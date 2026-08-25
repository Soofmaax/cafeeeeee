/* Administration audit trail and Click & Collect notification tracking. */

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pickup_ready_email_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pickup_ready_email_error text,
  ADD COLUMN IF NOT EXISTS pickup_ready_email_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  previous_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_audit_log FROM anon, authenticated;
GRANT ALL ON TABLE public.admin_audit_log TO service_role;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key_hash text PRIMARY KEY,
  request_count integer NOT NULL,
  reset_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_reset_at ON public.api_rate_limits(reset_at);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.api_rate_limits FROM anon, authenticated;
GRANT ALL ON TABLE public.api_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_entry public.api_rate_limits%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_key_hash, 0));
  DELETE FROM public.api_rate_limits WHERE reset_at < now() - interval '1 day';

  IF p_limit < 1 OR p_window_seconds < 1 OR length(p_key_hash) <> 64 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;

  SELECT * INTO v_entry
  FROM public.api_rate_limits
  WHERE key_hash = p_key_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.api_rate_limits (key_hash, request_count, reset_at)
    VALUES (p_key_hash, 1, now() + make_interval(secs => p_window_seconds));
    RETURN true;
  END IF;

  IF v_entry.reset_at <= now() THEN
    UPDATE public.api_rate_limits
    SET request_count = 1,
        reset_at = now() + make_interval(secs => p_window_seconds)
    WHERE key_hash = p_key_hash;
    RETURN true;
  END IF;

  IF v_entry.request_count >= p_limit THEN
    RETURN false;
  END IF;

  UPDATE public.api_rate_limits
  SET request_count = request_count + 1
  WHERE key_hash = p_key_hash;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

CREATE TABLE IF NOT EXISTS public.checkout_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL,
  customer_info jsonb NOT NULL,
  shipping_type text NOT NULL CHECK (shipping_type = 'pickup'),
  shipping_cost integer NOT NULL DEFAULT 0,
  delivery_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  access_token_hash text NOT NULL,
  access_token_expires_at timestamptz NOT NULL,
  stripe_session_id text UNIQUE,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checkout_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.checkout_intents FROM anon, authenticated;
GRANT ALL ON TABLE public.checkout_intents TO service_role;

CREATE OR REPLACE FUNCTION public.finalize_checkout_intent(
  p_checkout_intent_id uuid,
  p_stripe_session_id text,
  p_total_cents integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_intent public.checkout_intents%ROWTYPE;
  v_result jsonb;
BEGIN
  SELECT * INTO v_intent
  FROM public.checkout_intents
  WHERE id = p_checkout_intent_id
  FOR UPDATE;

  IF NOT FOUND OR v_intent.stripe_session_id IS DISTINCT FROM p_stripe_session_id THEN
    RAISE EXCEPTION 'Invalid checkout intent';
  END IF;

  v_result := public.finalize_paid_checkout(
    p_stripe_session_id,
    v_intent.customer_info,
    v_intent.items,
    p_total_cents,
    v_intent.shipping_type,
    v_intent.shipping_cost,
    v_intent.delivery_details,
    v_intent.access_token_hash,
    v_intent.access_token_expires_at
  );

  IF v_result->>'status' IN ('created', 'already_processed') THEN
    UPDATE public.checkout_intents SET processed_at = now() WHERE id = v_intent.id;
  END IF;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_checkout_intent(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_checkout_intent(uuid, text, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.mark_order_refunded_and_restock(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_variations jsonb;
  v_quantity integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_order_id::text, 0));
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.status = 'refunded' THEN RETURN false; END IF;
  IF v_order.status NOT IN ('paid', 'prepared') THEN RAISE EXCEPTION 'Order cannot be restocked'; END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(v_order.items_snapshot::jsonb)
  LOOP
    v_quantity := (v_item->>'quantity')::integer;
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'productId')::uuid
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product not found during restock'; END IF;

    IF jsonb_array_length(COALESCE(v_product.variations, '[]'::jsonb)) > 0 THEN
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_product.variations)
        WHERE value->>'id' = v_item->>'variantId'
      ) THEN
        RAISE EXCEPTION 'Variation not found during restock';
      END IF;
      SELECT jsonb_agg(
        CASE WHEN value->>'id' = v_item->>'variantId'
          THEN jsonb_set(value, '{stock}', to_jsonb((value->>'stock')::integer + v_quantity), true)
          ELSE value END
        ORDER BY ordinal
      ) INTO v_variations
      FROM jsonb_array_elements(v_product.variations) WITH ORDINALITY AS variants(value, ordinal);
      UPDATE public.products
      SET variations = v_variations,
          stock = (SELECT SUM((value->>'stock')::integer) FROM jsonb_array_elements(v_variations))
      WHERE id = v_product.id;
    ELSE
      UPDATE public.products SET stock = stock + v_quantity WHERE id = v_product.id;
    END IF;
  END LOOP;

  UPDATE public.orders SET status = 'refunded' WHERE id = p_order_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_order_refunded_and_restock(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_order_refunded_and_restock(uuid) TO service_role;
