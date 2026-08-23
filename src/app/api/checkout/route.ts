import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import type { Product, ProductVariation } from '@/lib/supabase';

const MONDIAL_RELAY_COST_CENTS = 450;
const FREE_SHIPPING_THRESHOLD_CENTS = 4500;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const itemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const deliveryDetailsSchema = z.object({
  relayId: z.string().optional(),
  relayName: z.string().optional(),
  relayAddress: z.string().optional(),
  pickupAddress: z.string().optional(),
});

const checkoutSchema = z.object({
  items: z.array(itemSchema).min(1),
  shippingType: z.enum(['mondial_relay', 'pickup']),
  deliveryDetails: deliveryDetailsSchema,
  customerInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
  }),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const { allowed } = rateLimit(ip, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans un instant.' },
      { status: 429 },
    );
  }

  try {
    const body = checkoutSchema.parse(await req.json());

    if (body.shippingType === 'mondial_relay' && !body.deliveryDetails.relayId) {
      return NextResponse.json(
        { error: 'Veuillez sélectionner un point relais' },
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
      } else {
        unitPriceCents = typedProduct.price_cents;
        attributeLabel = typedProduct.weight || 'Taille unique';
        variantId = item.variantId;
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

    // 2. Compute shipping cost
    let shippingCostCents = 0;
    if (body.shippingType === 'mondial_relay') {
      shippingCostCents =
        subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : MONDIAL_RELAY_COST_CENTS;
    }

    if (shippingCostCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: shippingCostCents,
          product_data: {
            name: 'Livraison Point Relais (Mondial Relay)',
          },
        },
      });
    }

    // 3. Create Stripe Checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      customer_email: body.customerInfo.email,
      metadata: {
        customerInfo: JSON.stringify(body.customerInfo),
        shippingType: body.shippingType,
        deliveryDetails: JSON.stringify(body.deliveryDetails),
        items: JSON.stringify(validatedItems),
        shippingCost: String(shippingCostCents),
      },
    });

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
