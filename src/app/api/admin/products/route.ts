import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const variationSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().max(200),
  sku: z.string().max(120),
  attribute: z.string().max(120),
  price_cents: z.number().int().min(0).max(10_000_000),
  weight: z.union([z.string(), z.number()]),
  stock: z.number().int().min(0).max(1_000_000),
});

const productUpdateSchema = z.object({
  id: z.string().uuid(),
  price_cents: z.number().int().min(0).max(10_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  variations: z.array(variationSchema).max(100),
});

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .select('id, name, slug, sku, category, price_cents, stock, variations')
    .order('name');
  if (error) return NextResponse.json({ error: 'Lecture du catalogue impossible' }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const parsed = productUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Produit invalide' }, { status: 400 });

  const variationStock = parsed.data.variations.reduce((sum, variation) => sum + variation.stock, 0);
  const stock = parsed.data.variations.length > 0 ? variationStock : parsed.data.stock;
  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .update({
      price_cents: parsed.data.price_cents,
      stock,
      variations: parsed.data.variations,
    })
    .eq('id', parsed.data.id)
    .select('id, name, slug, sku, category, price_cents, stock, variations')
    .single();
  if (error) return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 500 });
  await getSupabaseAdmin().from('admin_audit_log').insert({
    actor_email: admin.email,
    action: 'product.update_stock_and_price',
    entity_type: 'product',
    entity_id: parsed.data.id,
    new_values: { price_cents: parsed.data.price_cents, stock, variations: parsed.data.variations },
  });
  return NextResponse.json({ product: data });
}
