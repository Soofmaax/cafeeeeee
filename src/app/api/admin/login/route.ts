import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { getClientIP } from '@/lib/rate-limit';
import { getSupabaseAuthClient } from '@/lib/supabaseAuth';
import { distributedRateLimit } from '@/lib/distributed-rate-limit';

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(128),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!await distributedRateLimit(`admin-login:${ip}`, 5, 15 * 60)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
  }

  const parsed = credentialsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 400 });
  }

  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase());
  if (!allowedEmails.includes(parsed.data.email.toLowerCase())) {
    return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 401 });
  }

  const { data, error } = await getSupabaseAuthClient().auth.signInWithPassword(parsed.data);
  if (error || !data.session) {
    return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: Math.max(60, data.session.expires_in),
  });
  return response;
}
