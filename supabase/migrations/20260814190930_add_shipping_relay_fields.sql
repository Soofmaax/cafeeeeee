/*
# Add shipping and relay fields to orders + phone to customers

## Summary
Replaces the single "standard" shipping method with two explicit options:
Mondial Relay (point relais) and Pickup (retrait en boutique). Adds relay
metadata, customer phone, and a stored shipping cost to orders. Adds a phone
column to customers for carrier SMS tracking.

## Modified Tables

### orders
- `shipping_type` (text, nullable) — 'mondial_relay' or 'pickup'
  (new column; legacy `shipping_method` kept for backward compat)
- `relay_info` (jsonb, nullable) — { id, name, address } for Mondial Relay
- `customer_phone` (text, nullable) — phone number for carrier tracking
- `shipping_cost` (integer, nullable, default 0) — shipping cost in cents

### customers
- `phone` (text, nullable) — customer phone number

## Security
- No RLS policy changes. Existing anon/authenticated policies remain in place.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_type text,
  ADD COLUMN IF NOT EXISTS relay_info jsonb,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS shipping_cost integer NOT NULL DEFAULT 0;

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS phone text;
