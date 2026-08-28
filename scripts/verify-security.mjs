import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const migration = read('supabase/migrations/20260823000000_secure_orders_and_atomic_stock.sql');
const productionMigration = read('supabase/migrations/20260825000000_add_admin_audit_and_pickup_email.sql');
const checkout = read('src/app/api/checkout/route.ts');
const webhook = read('src/app/api/webhook/route.ts');
const lookup = read('src/app/api/orders/lookup/route.ts');
const checkoutPage = read('src/app/checkout/page.tsx');
const adminAuth = read('src/lib/admin-auth.ts');
const adminLogin = read('src/app/api/admin/login/route.ts');
const nextConfig = read('next.config.mjs');

assert.match(migration, /REVOKE ALL ON TABLE public\.customers FROM anon, authenticated/);
assert.match(migration, /REVOKE ALL ON TABLE public\.orders FROM anon, authenticated/);
assert.match(migration, /REVOKE ALL ON TABLE public\.products FROM anon, authenticated/);
assert.match(migration, /GRANT SELECT ON TABLE public\.products TO anon, authenticated/);
assert.match(migration, /FOR UPDATE/);
assert.match(migration, /pg_advisory_xact_lock/);
assert.match(migration, /finalize_paid_checkout/);
assert.match(migration, /access_token_hash/);
assert.match(migration, /access_token_expires_at/);

const simulatedRelayIdentifier = ['SIMULATED', 'RELAYS'].join('_');
assert.equal(checkoutPage.includes(simulatedRelayIdentifier), false);
assert.doesNotMatch(checkoutPage, /mondial_relay/i);
assert.doesNotMatch(checkout, /mondial_relay/);
assert.match(checkout, /check_checkout_stock/);
assert.match(webhook, /session\.payment_status !== 'paid'/);
assert.match(webhook, /finalize_checkout_intent/);
assert.match(checkout, /checkout_intents/);
assert.doesNotMatch(checkout, /orderAccessTokenHash|customerInfo: JSON\.stringify/);
assert.match(webhook, /idempotencyKey: `stock-allocation-failure:/);
assert.match(webhook, /customer_email_status/);
assert.match(webhook, /admin_email_status/);
assert.match(webhook, /await Promise\.all/);

assert.equal(existsSync(new URL('../src/app/api/orders/route.ts', import.meta.url)), false);
assert.doesNotMatch(lookup, /session_id|\.eq\('email'/);
assert.match(lookup, /hashOrderAccessToken/);
assert.match(lookup, /access_token_expires_at/);
assert.match(productionMigration, /admin_audit_log/);
assert.match(productionMigration, /api_rate_limits/);
assert.match(productionMigration, /checkout_intents/);
assert.match(productionMigration, /finalize_checkout_intent/);
assert.match(productionMigration, /mark_order_refunded_and_restock/);
assert.match(productionMigration, /REVOKE ALL ON TABLE public\.checkout_intents FROM anon, authenticated/);
assert.match(adminAuth, /auth\.getUser\(token\)/);
assert.match(adminLogin, /httpOnly: true/);
assert.match(adminLogin, /sameSite: 'strict'/);
assert.match(adminLogin, /distributedRateLimit/);
assert.match(nextConfig, /Content-Security-Policy/);
assert.match(nextConfig, /Strict-Transport-Security/);

console.log('Security regression checks passed.');
