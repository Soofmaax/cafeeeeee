import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getClientIP } from '@/lib/rate-limit';
import { hashOrderAccessToken, isValidOrderAccessToken } from '@/lib/order-access';
import { distributedRateLimit } from '@/lib/distributed-rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!await distributedRateLimit(`order-token:${ip}`, 15, 60)) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans un instant.' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json() as { token?: unknown };
    if (!isValidOrderAccessToken(body.token)) {
      return NextResponse.json({ error: 'Jeton de commande invalide' }, { status: 400 });
    }

    const tokenHash = hashOrderAccessToken(body.token);
    const { data: orderData, error } = await getSupabaseAdmin()
      .from('orders')
      .select('id, customer_id, total_cents, shipping_type, shipping_cost, relay_info, items_snapshot, status, created_at')
      .eq('access_token_hash', tokenHash)
      .gt('access_token_expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (!orderData) return NextResponse.json({ found: false });

    const { data: customerData, error: customerError } = await getSupabaseAdmin()
      .from('customers')
      .select('first_name, last_name, email, phone')
      .eq('id', orderData.customer_id)
      .maybeSingle();
    if (customerError) throw customerError;

    return NextResponse.json({
      found: true,
      order: {
        id: orderData.id,
        createdAt: orderData.created_at,
        totalCents: orderData.total_cents,
        shippingType: orderData.shipping_type,
        shippingCost: orderData.shipping_cost,
        relayInfo: orderData.relay_info,
        status: orderData.status,
        items: orderData.items_snapshot ? JSON.parse(orderData.items_snapshot) : [],
      },
      customer: customerData
        ? {
            firstName: customerData.first_name,
            lastName: customerData.last_name,
            email: customerData.email,
            phone: customerData.phone,
          }
        : null,
    });
  } catch (error) {
    console.error('Secure order lookup error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
