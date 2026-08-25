/** External services are opt-in so the storefront can be previewed without API keys. */
export const features = {
  supabase: process.env.NEXT_PUBLIC_ENABLE_SUPABASE === 'true',
  stripe: process.env.ENABLE_STRIPE === 'true',
  email: process.env.ENABLE_EMAIL === 'true',
} as const;

