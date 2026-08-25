const required = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'ADMIN_EMAIL',
  'ADMIN_EMAILS',
  'FROM_EMAIL',
  'LEGAL_HOST_NAME',
  'LEGAL_HOST_ADDRESS',
];

if (process.env.REQUIRE_PRODUCTION_CONFIG === 'true') {
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Production configuration is incomplete: ${missing.join(', ')}`);
  }
  const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
  if (appUrl.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_APP_URL must use HTTPS in production');
  }
}
