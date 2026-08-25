import type { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-constants';

export { ADMIN_SESSION_COOKIE } from '@/lib/admin-constants';

function getAllowedAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !data.user || !email || !getAllowedAdminEmails().has(email)) return null;

  return { id: data.user.id, email };
}
