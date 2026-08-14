/*
# Create shop tables (products, customers, orders)

## Summary
Migrates the coffee shop data layer from local SQLite to Supabase.
This is a single-tenant app with no sign-in screen, so all policies
allow anon + authenticated access (the frontend uses the anon key).

## New Tables

### products
- id (uuid, primary key)
- slug (text, unique, not null) — URL-friendly product identifier
- name (text, not null)
- description (text, not null)
- price_cents (integer, not null) — price in cents
- image (text, not null) — image URL
- weight (text, not null) — e.g. "250g"
- stock (integer, not null, default 0)
- created_at (timestamptz, default now())

### customers
- id (uuid, primary key)
- email (text, unique, not null)
- first_name (text, nullable)
- last_name (text, nullable)
- address (text, nullable)
- city (text, nullable)
- postal_code (text, nullable)
- country (text, nullable)
- created_at (timestamptz, default now())

### orders
- id (uuid, primary key)
- customer_id (uuid, not null, references customers.id)
- email (text, not null) — denormalized for easy lookup by email
- total_cents (integer, not null)
- shipping_method (text, not null)
- items_snapshot (text, not null) — JSON string of order items
- created_at (timestamptz, default now())

## Security
- RLS enabled on all three tables.
- All policies use `TO anon, authenticated` because this is a no-auth
  public storefront — the browser client uses the anon key.
- products: public read, public insert/update (admin-style operations
  from API routes), no delete needed.
- customers: public read/insert/update (checkout creates/updates by email).
- orders: public read/insert (checkout creates orders, account page reads by email).

## Important Notes
1. No user_id columns — this is a single-tenant storefront with no auth.
2. products.slug has a unique index for fast lookups.
3. customers.email has a unique index for upsert-by-email.
4. orders.email is indexed for the account page lookup.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  price_cents integer NOT NULL,
  image text NOT NULL,
  weight text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  address text,
  city text,
  postal_code text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  email text NOT NULL,
  total_cents integer NOT NULL,
  shipping_method text NOT NULL,
  items_snapshot text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- products policies
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- customers policies
DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- orders policies
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);