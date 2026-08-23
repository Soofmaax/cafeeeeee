/*
# Add stripe_session_id and status to orders table

## Summary
Adds two columns to the existing orders table to support Stripe webhook
idempotency and order status tracking.

## Modified Tables
### orders
- `stripe_session_id` (text, nullable, unique) — Stripe Checkout session ID
  used for idempotency: the webhook checks if an order with this session ID
  already exists before processing.
- `status` (text, not null, default 'paid') — order lifecycle status:
  'pending', 'paid', 'prepared', 'shipped', 'collected'.

## Security
- No RLS policy changes. Existing anon/authenticated policies remain in place.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'paid';

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
