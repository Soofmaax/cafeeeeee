import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email';
import { getStripe } from '@/lib/stripe';

interface ValidatedItem {
  productId: string;
  variantId: string;
  name: string;
  attribute: string;
  quantity: number;
  unitPrice: number;
}

interface FinalizeResult {
  status: 'created' | 'already_processed' | 'insufficient_stock';
  orderId?: string;
  emailStatus?: string;
}

async function refundForStockFailure(session: Stripe.Checkout.Session): Promise<void> {
  const paymentIntent = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  if (!paymentIntent) {
    await getSupabaseAdmin()
      .from('stock_incidents')
      .update({
        refund_status: 'failed',
        refund_error: 'Stripe session has no payment intent',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id);
    throw new Error('Cannot refund stock failure without a payment intent');
  }

  try {
    const refund = await getStripe().refunds.create(
      { payment_intent: paymentIntent, reason: 'requested_by_customer' },
      { idempotencyKey: `stock-allocation-failure:${session.id}` },
    );
    await getSupabaseAdmin()
      .from('stock_incidents')
      .update({
        refund_status: 'refunded',
        stripe_refund_id: refund.id,
        refund_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Stripe refund error';
    await getSupabaseAdmin()
      .from('stock_incidents')
      .update({
        refund_status: 'failed',
        refund_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id);
    throw error;
  }
}

async function deliverOrderEmails(
  orderId: string,
  sessionId: string,
  customerInfo: { name: string; email: string; phone: string },
  items: ValidatedItem[],
  totalCents: number,
  shippingCost: number,
): Promise<boolean> {
  const attemptedAt = new Date().toISOString();
  async function deliverChannel(
    statusColumn: 'customer_email_status' | 'admin_email_status',
    errorColumn: 'customer_email_last_error' | 'admin_email_last_error',
    send: () => Promise<void>,
  ): Promise<string | null> {
    const { data: claimedOrder, error: claimError } = await getSupabaseAdmin()
      .from('orders')
      .update({ [statusColumn]: 'sending', email_attempted_at: attemptedAt })
      .eq('id', orderId)
      .eq('stripe_session_id', sessionId)
      .in(statusColumn, ['pending', 'failed'])
      .select('id')
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claimedOrder) return null;

    try {
      await send();
      await getSupabaseAdmin()
        .from('orders')
        .update({ [statusColumn]: 'sent', [errorColumn]: null })
        .eq('id', orderId);
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await getSupabaseAdmin()
        .from('orders')
        .update({ [statusColumn]: 'failed', [errorColumn]: message.slice(0, 2000) })
        .eq('id', orderId);
      return message;
    }
  }

  const results = await Promise.all([
    deliverChannel('customer_email_status', 'customer_email_last_error', () => sendCustomerConfirmationEmail(
      customerInfo,
      orderId,
      items,
      totalCents,
      shippingCost,
    )),
    deliverChannel('admin_email_status', 'admin_email_last_error', () => sendAdminNotificationEmail(
      customerInfo,
      orderId,
      items,
      totalCents,
      shippingCost,
    )),
  ]);
  const errors = results.filter((result): result is string => result !== null);

  if (errors.length > 0) {
    await getSupabaseAdmin()
      .from('orders')
      .update({ email_status: 'failed', email_last_error: errors.join(' | ').slice(0, 2000) })
      .eq('id', orderId);
    console.error('Order email delivery failed:', { orderId, errors });
    return false;
  }

  await getSupabaseAdmin()
    .from('orders')
    .update({ email_status: 'sent', email_last_error: null })
    .eq('id', orderId);
  return true;
}

async function processPaidSession(session: Stripe.Checkout.Session): Promise<NextResponse> {
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, processed: false });
  }

  const checkoutIntentId = session.metadata?.checkoutIntentId;
  if (!checkoutIntentId) throw new Error('Stripe session has no checkout intent');

  const { data: intent, error: intentError } = await getSupabaseAdmin()
    .from('checkout_intents')
    .select('items, customer_info, shipping_cost')
    .eq('id', checkoutIntentId)
    .eq('stripe_session_id', session.id)
    .maybeSingle();
  if (intentError || !intent) throw intentError || new Error('Checkout intent not found');

  const items = intent.items as ValidatedItem[];
  const customerInfo = intent.customer_info as {
    name: string;
    email: string;
    phone: string;
  };
  const shippingCost = intent.shipping_cost as number;

  const { data, error } = await getSupabaseAdmin().rpc('finalize_checkout_intent', {
    p_checkout_intent_id: checkoutIntentId,
    p_stripe_session_id: session.id,
    p_total_cents: session.amount_total ?? 0,
  });
  if (error) throw error;

  const result = data as FinalizeResult;
  if (result.status === 'insufficient_stock') {
    await refundForStockFailure(session);
    return NextResponse.json({ received: true, processed: false, refunded: true });
  }
  if (!result.orderId) throw new Error('Order finalization returned no order ID');

  const emailsDelivered = await deliverOrderEmails(
    result.orderId,
    session.id,
    customerInfo,
    items,
    session.amount_total ?? 0,
    shippingCost,
  );
  if (!emailsDelivered) {
    return NextResponse.json({ error: 'Email delivery will be retried' }, { status: 500 });
  }

  return NextResponse.json({ received: true, processed: result.status === 'created' });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook non configuré' }, { status: 503 });
    }

    const event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);

    if (
      event.type === 'checkout.session.completed'
      || event.type === 'checkout.session.async_payment_succeeded'
    ) {
      return await processPaidSession(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      console.warn('Asynchronous Stripe payment failed:', event.data.object.id);
    }

    return NextResponse.json({ received: true, processed: false });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
