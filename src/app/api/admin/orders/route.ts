import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendPickupReadyEmail } from '@/lib/email';
import { getStripe } from '@/lib/stripe';

const orderUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['paid', 'prepared', 'collected']),
});
const refundSchema = z.object({ id: z.string().uuid() });

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .select('id, email, total_cents, shipping_type, items_snapshot, status, created_at, customer_phone, email_status')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: 'Lecture des commandes impossible' }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const parsed = orderUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Commande invalide' }, { status: 400 });

  const { data: previousOrder, error: readError } = await getSupabaseAdmin()
    .from('orders')
    .select('id, status, email, customer_id, pickup_ready_email_status')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (readError || !previousOrder) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .select('id, status')
    .single();
  if (error) return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 500 });

  await getSupabaseAdmin().from('admin_audit_log').insert({
    actor_email: admin.email,
    action: 'order.update_status',
    entity_type: 'order',
    entity_id: parsed.data.id,
    previous_values: { status: previousOrder.status },
    new_values: { status: parsed.data.status },
  });

  if (parsed.data.status === 'prepared' && previousOrder.pickup_ready_email_status !== 'sent') {
    const { data: emailClaim } = await getSupabaseAdmin()
      .from('orders')
      .update({ pickup_ready_email_status: 'sending', pickup_ready_email_error: null })
      .eq('id', previousOrder.id)
      .in('pickup_ready_email_status', ['pending', 'failed'])
      .select('id')
      .maybeSingle();
    if (!emailClaim) return NextResponse.json({ order: data });

    const { data: customer } = await getSupabaseAdmin()
      .from('customers')
      .select('first_name, last_name')
      .eq('id', previousOrder.customer_id)
      .maybeSingle();
    const customerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || 'Client';
    try {
      await sendPickupReadyEmail(previousOrder.email, customerName, previousOrder.id);
      await getSupabaseAdmin().from('orders').update({
        pickup_ready_email_status: 'sent',
        pickup_ready_email_error: null,
        pickup_ready_email_sent_at: new Date().toISOString(),
      }).eq('id', previousOrder.id);
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : String(emailError);
      await getSupabaseAdmin().from('orders').update({
        pickup_ready_email_status: 'failed',
        pickup_ready_email_error: message.slice(0, 2000),
      }).eq('id', previousOrder.id);
      return NextResponse.json({
        order: data,
        warning: 'Statut enregistré, mais l’e-mail de retrait a échoué.',
      });
    }
  }
  return NextResponse.json({ order: data });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const parsed = refundSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Commande invalide' }, { status: 400 });

  const { data: order, error } = await getSupabaseAdmin()
    .from('orders')
    .select('id, status, stripe_session_id')
    .eq('id', parsed.data.id)
    .maybeSingle();
  if (error || !order?.stripe_session_id) {
    return NextResponse.json({ error: 'Commande Stripe introuvable' }, { status: 404 });
  }
  if (order.status === 'refunded') return NextResponse.json({ refunded: true });
  if (!['paid', 'prepared'].includes(order.status)) {
    return NextResponse.json({ error: 'Cette commande ne peut plus être restockée automatiquement' }, { status: 409 });
  }

  const session = await getStripe().checkout.sessions.retrieve(order.stripe_session_id);
  const paymentIntent = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;
  if (!paymentIntent) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 409 });

  const refund = await getStripe().refunds.create(
    { payment_intent: paymentIntent, reason: 'requested_by_customer' },
    { idempotencyKey: `admin-order-refund:${order.id}` },
  );
  const { error: restockError } = await getSupabaseAdmin().rpc('mark_order_refunded_and_restock', {
    p_order_id: order.id,
  });
  if (restockError) {
    console.error('Stripe refund succeeded but stock restoration failed:', { orderId: order.id, restockError });
    await getSupabaseAdmin().from('admin_audit_log').insert({
      actor_email: admin.email,
      action: 'order.refund_stock_restore_failed',
      entity_type: 'order',
      entity_id: order.id,
      previous_values: { status: order.status },
      new_values: { stripe_refund_id: refund.id, error: restockError.message },
    });
    return NextResponse.json({
      error: 'Paiement remboursé, mais le stock doit être vérifié manuellement.',
      refundId: refund.id,
    }, { status: 500 });
  }
  await getSupabaseAdmin().from('admin_audit_log').insert({
    actor_email: admin.email,
    action: 'order.refund',
    entity_type: 'order',
    entity_id: order.id,
    previous_values: { status: order.status },
    new_values: { status: 'refunded', stripe_refund_id: refund.id },
  });
  return NextResponse.json({ refunded: true, refundId: refund.id });
}
