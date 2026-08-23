import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Product, ProductVariation } from '@/lib/supabase';
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface ValidatedItem {
  productId: string;
  variantId: string;
  name: string;
  attribute: string;
  quantity: number;
  unitPrice: number;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};

      // --- Idempotency: skip if order already exists for this Stripe session ---
      const { data: existingOrder } = await getSupabaseAdmin()
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle();

      if (existingOrder) {
        return NextResponse.json({ received: true });
      }

      const items: ValidatedItem[] = JSON.parse(metadata.items || '[]');
      const customerInfo = JSON.parse(metadata.customerInfo || '{}');
      const deliveryDetails = JSON.parse(metadata.deliveryDetails || '{}');
      const shippingType = metadata.shippingType as 'mondial_relay' | 'pickup';
      const shippingCost = parseInt(metadata.shippingCost || '0', 10);

      // 1. Decrement stock for each item
      for (const item of items) {
        const { data: productData, error } = await getSupabaseAdmin()
          .from('products')
          .select('*')
          .eq('id', item.productId)
          .maybeSingle();

        if (error || !productData) continue;

        const product = productData as Product;
        const variations = product.variations ?? [];
        const updatedVariations = variations.map((v: ProductVariation) =>
          v.id === item.variantId
            ? { ...v, stock: Math.max(0, v.stock - item.quantity) }
            : v,
        );

        await getSupabaseAdmin()
          .from('products')
          .update({ variations: updatedVariations })
          .eq('id', item.productId);
      }

      // 2. Create or find customer
      const { data: existingCustomer } = await getSupabaseAdmin()
        .from('customers')
        .select('id')
        .eq('email', customerInfo.email as string)
        .maybeSingle();

      let customerId: string;

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: insertError } = await getSupabaseAdmin()
          .from('customers')
          .insert({
            email: customerInfo.email,
            first_name: customerInfo.name?.split(' ')[0] ?? null,
            last_name: customerInfo.name?.split(' ').slice(1).join(' ') ?? null,
            phone: customerInfo.phone,
          })
          .select('id')
          .single();

        if (insertError || !newCustomer) {
          console.error('Failed to create customer:', insertError);
          return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 },
          );
        }
        customerId = newCustomer.id;
      }

      // 3. Insert order
      const { data: orderRecord, error: orderError } = await getSupabaseAdmin().from('orders').insert({
        customer_id: customerId,
        email: customerInfo.email,
        total_cents: session.amount_total ?? 0,
        shipping_method: shippingType,
        shipping_type: shippingType,
        shipping_cost: shippingCost,
        relay_info: shippingType === 'mondial_relay' ? deliveryDetails : null,
        customer_phone: customerInfo.phone,
        items_snapshot: JSON.stringify(items),
        stripe_session_id: session.id,
        status: 'paid',
      }).select('id').single();

      if (orderError || !orderRecord) {
        console.error('Failed to create order:', orderError);
        return NextResponse.json(
          { error: 'Failed to create order' },
          { status: 500 },
        );
      }

      // 4. Send transactional emails (non-blocking, errors logged only)
      const orderId = orderRecord.id;
      const totalCents = session.amount_total ?? 0;

      Promise.all([
        sendCustomerConfirmationEmail(
          customerInfo,
          orderId,
          items,
          totalCents,
          shippingCost,
          shippingType,
          deliveryDetails,
        ),
        sendAdminNotificationEmail(
          customerInfo,
          orderId,
          items,
          totalCents,
          shippingCost,
          shippingType,
          deliveryDetails,
        ),
      ]).catch((err) => console.error('Email sending failed:', err));
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 },
    );
  }
}
