import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getClientIP } from '@/lib/rate-limit';
import type { Product, ProductVariation } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { createOrderAccessToken } from '@/lib/order-access';
import { PICKUP_STORE } from '@/data/stores';
import { getPublicAppUrl } from '@/lib/app-url';
import { distributedRateLimit } from '@/lib/distributed-rate-limit';

const MAX_ITEM_QUANTITY = 25;

const itemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_ITEM_QUANTITY),
});

const checkoutSchema = z.object({
  items: z.array(itemSchema).min(1).max(25),
  shippingType: z.literal('pickup'),
  deliveryDetails: z.object({}).optional(),
  customerInfo: z.object({
    name: z.string().trim().min(1).max(160),
    email: z.string().email(),
    phone: z.string().trim().min(6).max(30),
  }),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (!await distributedRateLimit(`checkout:${ip}`, 10, 60)) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans un instant.' },
      { status: 429 },
    );
  }

  try {
    const body = checkoutSchema.parse(await req.json());

    const uniqueLines = new Set(body.items.map((item) => `${item.productId}:${item.variantId}`));
    if (uniqueLines.size !== body.items.length) {
      return NextResponse.json(
        { error: 'Une même variation ne peut apparaître qu’une fois' },
        { status: 400 },
      );
    }

    // 1. Read real prices from Supabase and verify stock
    let subtotalCents = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const validatedItems: {
      productId: string;
      variantId: string;
      name: string;
      attribute: string;
      quantity: number;
      unitPrice: number;
    }[] = [];

    for (const item of body.items) {
      const { data: product, error } = await getSupabaseAdmin()
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .maybeSingle();

      if (error || !product) {
        return NextResponse.json(
          { error: `Produit introuvable: ${item.productId}` },
          { status: 400 },
        );
      }

      const typedProduct = product as Product;
      const variations = typedProduct.variations ?? [];

      let unitPriceCents: number;
      let attributeLabel: string;
      let variantId: string;

      if (variations.length > 0) {
        const variation = variations.find((v: ProductVariation) => v.id === item.variantId);
        if (!variation) {
          return NextResponse.json(
            { error: `Variation introuvable: ${item.variantId}` },
            { status: 400 },
          );
        }
        unitPriceCents = variation.price_cents;
        attributeLabel = variation.attribute;
        variantId = variation.id;
        if (variation.stock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuffisant pour ${typedProduct.name}` },
            { status: 409 },
          );
        }
      } else {
        unitPriceCents = typedProduct.price_cents;
        attributeLabel = typedProduct.weight || 'Taille unique';
        variantId = item.variantId;
        if (typedProduct.stock < item.quantity) {
          return NextResponse.json(
            { error: `Stock insuffisant pour ${typedProduct.name}` },
            { status: 409 },
          );
        }
      }

      const lineTotal = unitPriceCents * item.quantity;
      subtotalCents += lineTotal;

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: unitPriceCents,
          product_data: {
            name: `${typedProduct.name} (${attributeLabel})`,
          },
        },
      });

      validatedItems.push({
        productId: typedProduct.id,
        variantId,
        name: typedProduct.name,
        attribute: attributeLabel,
        quantity: item.quantity,
        unitPrice: unitPriceCents,
      });
    }

    // A final database-side check narrows the payment/allocation race window.
    // The webhook performs the definitive locked allocation after payment.
    const { data: stockCheck, error: stockCheckError } = await getSupabaseAdmin().rpc(
      'check_checkout_stock',
      { p_items: validatedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })) },
    );
    const stockResult = stockCheck as { available?: boolean } | null;
    if (stockCheckError || !stockResult?.available) {
      return NextResponse.json(
        { error: 'Le stock vient de changer. Veuillez vérifier votre panier.' },
        { status: 409 },
      );
    }

    const shippingCostCents = 0;
    const access = createOrderAccessToken();
    const deliveryDetails = {
      pickupAddress: `${PICKUP_STORE.address}, ${PICKUP_STORE.postalCode} ${PICKUP_STORE.city}`,
    };

    const abandonedBefore = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    await getSupabaseAdmin()
      .from('checkout_intents')
      .delete()
      .is('processed_at', null)
      .lt('created_at', abandonedBefore);

    const { data: checkoutIntent, error: intentError } = await getSupabaseAdmin()
      .from('checkout_intents')
      .insert({
        items: validatedItems,
        customer_info: body.customerInfo,
        shipping_type: 'pickup',
        shipping_cost: shippingCostCents,
        delivery_details: deliveryDetails,
        access_token_hash: access.hash,
        access_token_expires_at: access.expiresAt.toISOString(),
      })
      .select('id')
      .single();
    if (intentError || !checkoutIntent) throw intentError || new Error('Checkout intent creation failed');

    // Create a Stripe-hosted payment session. Only the token hash is retained
    // by Stripe/Supabase; the raw bearer token is returned to the customer URL.
    const appUrl = getPublicAppUrl();

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/order-success?order_token=${encodeURIComponent(access.token)}`,
      cancel_url: `${appUrl}/checkout`,
      customer_email: body.customerInfo.email,
      metadata: {
        checkoutIntentId: checkoutIntent.id,
      },
    });

    const { error: sessionLinkError } = await getSupabaseAdmin()
      .from('checkout_intents')
      .update({ stripe_session_id: session.id })
      .eq('id', checkoutIntent.id);
    if (sessionLinkError) {
      await getStripe().checkout.sessions.expire(session.id);
      throw sessionLinkError;
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: err.issues },
        { status: 400 },
      );
    }
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la commande' },
      { status: 500 },
    );
  }
}
