import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function distributedRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const keyHash = createHash('sha256').update(key, 'utf8').digest('hex');
  const { data, error } = await getSupabaseAdmin().rpc('consume_rate_limit', {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw error;
  return data === true;
}
