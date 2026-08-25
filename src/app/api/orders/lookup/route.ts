import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { features } from '@/lib/features';

export async function GET(req: NextRequest) {
  if (!features.supabase) {
    return NextResponse.json({ error: 'Commandes indisponibles en mode aperçu.' }, { status: 503 });
  }

  const ip = getClientIP(req);
  const { allowed } = rateLimit(ip, 15, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans un instant.' },
      { status: 429 },
    );
  }

  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    const { data: orderData, error } = await getSupabaseAdmin()
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (error || !orderData) {
      return NextResponse.json({ found: false });
    }

    const order = orderData as Record<string, string | number | null | object>;

    const { data: customerData } = await getSupabaseAdmin()
      .from('customers')
      .select('*')
      .eq('id', order.customer_id as string)
      .maybeSingle();

    const customer = customerData as Record<string, string | null> | null;

    return NextResponse.json({
      found: true,
      order: {
        id: order.id as string,
        createdAt: order.created_at as string,
        totalCents: order.total_cents as number,
        shippingType: order.shipping_type as string,
        shippingCost: order.shipping_cost as number,
        relayInfo: order.relay_info,
        items: order.items_snapshot ? JSON.parse(order.items_snapshot as string) : [],
      },
      customer: customer
        ? {
            firstName: customer.first_name,
            lastName: customer.last_name,
            email: customer.email,
            phone: customer.phone,
          }
        : null,
    });
  } catch (err) {
    console.error('Order lookup error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
