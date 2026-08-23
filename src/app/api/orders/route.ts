import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

const emailSchema = z.string().email();

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const { allowed } = rateLimit(ip, 15, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans un instant.' },
      { status: 429 },
    );
  }

  try {
    const emailParam = req.nextUrl.searchParams.get('email');
    if (!emailParam) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const emailResult = emailSchema.safeParse(emailParam);
    if (!emailResult.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const email = emailResult.data;

    const { data: customer, error: customerError } = await getSupabaseAdmin()
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (customerError || !customer) {
      return NextResponse.json({ orders: [] });
    }

    const { data: orders, error: ordersError } = await getSupabaseAdmin()
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({
      orders: (orders ?? []).map((o: Record<string, string | number | null>) => ({
        id: o.id as string,
        totalCents: o.total_cents as number,
        shippingType: o.shipping_type as string,
        shippingCost: o.shipping_cost as number,
        status: o.status as string,
        items: o.items_snapshot ? JSON.parse(o.items_snapshot as string) : [],
        createdAt: o.created_at as string,
      })),
    });
  } catch (err) {
    console.error('Orders fetch error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
