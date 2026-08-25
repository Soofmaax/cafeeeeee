/*
 * Security hardening and atomic paid-order finalization.
 *
 * This migration intentionally corrects policies created by earlier migrations
 * instead of editing migration history that may already have been applied.
 */

-- Public users may read the catalog, but all customer/order data and every
-- catalog write are reserved for the service role.
DROP POLICY IF EXISTS "anon_insert_products" ON public.products;
DROP POLICY IF EXISTS "anon_update_products" ON public.products;
DROP POLICY IF EXISTS "anon_select_products" ON public.products;
DROP POLICY IF EXISTS "anon_select_customers" ON public.customers;
DROP POLICY IF EXISTS "anon_insert_customers" ON public.customers;
DROP POLICY IF EXISTS "anon_update_customers" ON public.customers;
DROP POLICY IF EXISTS "anon_select_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;

DROP POLICY IF EXISTS "public_read_catalog" ON public.products;
CREATE POLICY "public_read_catalog"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE ALL ON TABLE public.customers FROM anon, authenticated;
REVOKE ALL ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.products FROM anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon, authenticated;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS access_token_hash text,
  ADD COLUMN IF NOT EXISTS access_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_last_error text,
  ADD COLUMN IF NOT EXISTS email_attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS customer_email_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS customer_email_last_error text,
  ADD COLUMN IF NOT EXISTS admin_email_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS admin_email_last_error text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_access_token_hash
  ON public.orders(access_token_hash)
  WHERE access_token_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.stock_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  reason text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  refund_status text NOT NULL DEFAULT 'pending',
  stripe_refund_id text,
  refund_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_incidents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.stock_incidents FROM anon, authenticated;
GRANT ALL ON TABLE public.products, public.customers, public.orders, public.stock_incidents TO service_role;

-- The legacy aggregate column is kept coherent with variation-level stock.
UPDATE public.products
SET stock = COALESCE((
  SELECT SUM((value->>'stock')::integer)
  FROM jsonb_array_elements(COALESCE(products.variations, '[]'::jsonb))
), 0)
WHERE jsonb_array_length(COALESCE(variations, '[]'::jsonb)) > 0;

-- A best-effort check performed immediately before creating Stripe Checkout.
-- The definitive allocation still happens in finalize_paid_checkout below.
CREATE OR REPLACE FUNCTION public.check_checkout_stock(p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_variant jsonb;
  v_quantity integer;
BEGIN
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('available', false, 'reason', 'invalid_items');
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::integer;
    IF v_quantity < 1 THEN
      RETURN jsonb_build_object('available', false, 'reason', 'invalid_quantity');
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'productId')::uuid;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('available', false, 'reason', 'product_not_found');
    END IF;

    IF jsonb_array_length(COALESCE(v_product.variations, '[]'::jsonb)) > 0 THEN
      SELECT value INTO v_variant
      FROM jsonb_array_elements(v_product.variations)
      WHERE value->>'id' = v_item->>'variantId';

      IF v_variant IS NULL OR COALESCE((v_variant->>'stock')::integer, 0) < v_quantity THEN
        RETURN jsonb_build_object(
          'available', false,
          'reason', 'insufficient_stock',
          'productId', v_item->>'productId',
          'variantId', v_item->>'variantId'
        );
      END IF;
    ELSIF v_product.stock < v_quantity THEN
      RETURN jsonb_build_object(
        'available', false,
        'reason', 'insufficient_stock',
        'productId', v_item->>'productId'
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('available', true);
EXCEPTION
  WHEN invalid_text_representation OR numeric_value_out_of_range THEN
    RETURN jsonb_build_object('available', false, 'reason', 'invalid_items');
END;
$$;

-- Locks every product row, validates every line, decrements stock and creates
-- the customer/order in one PostgreSQL transaction. A returned stock failure is
-- persisted as an incident so the webhook can issue an idempotent Stripe refund.
CREATE OR REPLACE FUNCTION public.finalize_paid_checkout(
  p_stripe_session_id text,
  p_customer_info jsonb,
  p_items jsonb,
  p_total_cents integer,
  p_shipping_type text,
  p_shipping_cost integer,
  p_delivery_details jsonb,
  p_access_token_hash text,
  p_access_token_expires_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing public.orders%ROWTYPE;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_variant jsonb;
  v_updated_variations jsonb;
  v_quantity integer;
  v_customer_id uuid;
  v_order_id uuid;
  v_failure jsonb;
BEGIN
  -- Serialize deliveries for the same Stripe session before the first
  -- idempotency check. This prevents a duplicate from mistaking the stock
  -- consumed by the first delivery for an allocation failure.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_stripe_session_id, 0));

  SELECT * INTO v_existing
  FROM public.orders
  WHERE stripe_session_id = p_stripe_session_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'status', 'already_processed',
      'orderId', v_existing.id,
      'emailStatus', v_existing.email_status
    );
  END IF;

  IF p_shipping_type <> 'pickup'
     OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0
     OR jsonb_array_length(p_items) <> (
       SELECT COUNT(DISTINCT value->>'productId' || ':' || value->>'variantId')
       FROM jsonb_array_elements(p_items)
     )
     OR p_access_token_hash IS NULL
     OR p_access_token_expires_at <= now() THEN
    RAISE EXCEPTION 'Invalid paid checkout payload';
  END IF;

  -- Deterministic lock order prevents deadlocks for multi-product orders.
  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
    ORDER BY value->>'productId', value->>'variantId'
  LOOP
    v_quantity := (v_item->>'quantity')::integer;
    IF v_quantity < 1 THEN
      RAISE EXCEPTION 'Invalid item quantity';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'productId')::uuid
    FOR UPDATE;

    IF NOT FOUND THEN
      v_failure := jsonb_build_object('reason', 'product_not_found', 'item', v_item);
      EXIT;
    END IF;

    IF jsonb_array_length(COALESCE(v_product.variations, '[]'::jsonb)) > 0 THEN
      v_variant := NULL;
      SELECT value INTO v_variant
      FROM jsonb_array_elements(v_product.variations)
      WHERE value->>'id' = v_item->>'variantId';

      IF v_variant IS NULL OR COALESCE((v_variant->>'stock')::integer, 0) < v_quantity THEN
        v_failure := jsonb_build_object('reason', 'insufficient_stock', 'item', v_item);
        EXIT;
      END IF;

    ELSE
      IF v_product.stock < v_quantity THEN
        v_failure := jsonb_build_object('reason', 'insufficient_stock', 'item', v_item);
        EXIT;
      END IF;
    END IF;
  END LOOP;

  IF v_failure IS NOT NULL THEN
    -- Raising would roll back this trace, so return a failure after recording it.
    INSERT INTO public.stock_incidents (stripe_session_id, reason, details)
    VALUES (p_stripe_session_id, v_failure->>'reason', v_failure)
    ON CONFLICT (stripe_session_id) DO UPDATE
      SET details = EXCLUDED.details,
          updated_at = now();

    RETURN jsonb_build_object('status', 'insufficient_stock', 'details', v_failure);
  END IF;

  -- A concurrent delivery of the same webhook may have waited on our product
  -- locks. Re-check idempotency after acquiring them and before any mutation.
  SELECT * INTO v_existing
  FROM public.orders
  WHERE stripe_session_id = p_stripe_session_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'status', 'already_processed',
      'orderId', v_existing.id,
      'emailStatus', v_existing.email_status
    );
  END IF;

  -- All rows remain locked from the validation pass above. Only now mutate
  -- stock, so an unavailable line can never leave a partially allocated order.
  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
    ORDER BY value->>'productId', value->>'variantId'
  LOOP
    v_quantity := (v_item->>'quantity')::integer;
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'productId')::uuid;

    IF jsonb_array_length(COALESCE(v_product.variations, '[]'::jsonb)) > 0 THEN
      SELECT jsonb_agg(
        CASE
          WHEN value->>'id' = v_item->>'variantId'
            THEN jsonb_set(
              value,
              '{stock}',
              to_jsonb(((value->>'stock')::integer - v_quantity)),
              true
            )
          ELSE value
        END
        ORDER BY ordinal
      )
      INTO v_updated_variations
      FROM jsonb_array_elements(v_product.variations) WITH ORDINALITY AS variants(value, ordinal);

      UPDATE public.products
      SET variations = v_updated_variations,
          stock = COALESCE((
            SELECT SUM((value->>'stock')::integer)
            FROM jsonb_array_elements(v_updated_variations)
          ), 0)
      WHERE id = v_product.id;
    ELSE
      UPDATE public.products
      SET stock = stock - v_quantity
      WHERE id = v_product.id;
    END IF;
  END LOOP;

  INSERT INTO public.customers (email, first_name, last_name, phone)
  VALUES (
    p_customer_info->>'email',
    split_part(p_customer_info->>'name', ' ', 1),
    NULLIF(trim(substr(p_customer_info->>'name', length(split_part(p_customer_info->>'name', ' ', 1)) + 1)), ''),
    p_customer_info->>'phone'
  )
  ON CONFLICT (email) DO UPDATE
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone
  RETURNING id INTO v_customer_id;

  INSERT INTO public.orders (
    customer_id, email, total_cents, shipping_method, items_snapshot,
    shipping_type, shipping_cost, relay_info, customer_phone,
    stripe_session_id, status, access_token_hash, access_token_expires_at
  ) VALUES (
    v_customer_id,
    p_customer_info->>'email',
    p_total_cents,
    'pickup',
    p_items::text,
    'pickup',
    p_shipping_cost,
    NULL,
    p_customer_info->>'phone',
    p_stripe_session_id,
    'paid',
    p_access_token_hash,
    p_access_token_expires_at
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('status', 'created', 'orderId', v_order_id, 'emailStatus', 'pending');
END;
$$;

REVOKE ALL ON FUNCTION public.check_checkout_stock(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_paid_checkout(text, jsonb, jsonb, integer, text, integer, jsonb, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_checkout_stock(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_paid_checkout(text, jsonb, jsonb, integer, text, integer, jsonb, text, timestamptz) TO service_role;
