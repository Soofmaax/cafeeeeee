import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { features } from '@/lib/features';

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!features.supabase) {
    throw new Error('Supabase est désactivé (mode aperçu).');
  }
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return client;
}
