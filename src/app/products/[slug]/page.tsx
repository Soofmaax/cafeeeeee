import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase, type Product } from '@/lib/supabase';
import AddToCart from '@/components/AddToCart';
import ProductImage from '@/components/ProductImage';
import CrossSell from '@/components/CrossSell';
import Link from 'next/link';
import { ArrowLeft, MapPin, Coffee, Gauge, ChefHat } from 'lucide-react';
import { features } from '@/lib/features';

export async function generateStaticParams() {
  if (!features.supabase) return [];

  const { data } = await supabase.from('products').select('slug');
  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!features.supabase) return { title: 'Mode aperçu — Café de Papá' };

  const { data } = await supabase
    .from('products')
    .select('name, short_description, aromatic_notes, images, category')
    .eq('slug', params.slug)
    .maybeSingle();

  const product = data as Pick<Product, 'name' | 'short_description' | 'aromatic_notes' | 'images' | 'category'> | null;
  if (!product) return { title: 'Produit introuvable — Café de Papá' };

  const description = product.aromatic_notes
    ? `${product.short_description ?? product.name}. Notes aromatiques : ${product.aromatic_notes}.`
    : product.short_description ?? product.name;

  const image = product.images && product.images.length > 0 ? product.images[0] : undefined;
  const title = `${product.name} — Café de Papá`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

function getImages(product: Product): string[] {
  if (product.images && product.images.length > 0) return product.images;
  return [product.image];
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  if (!features.supabase) notFound();

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  const product = data as Product | null;
  if (!product) notFound();

  const { data: allProductsData } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  const allProducts = (allProductsData ?? []) as Product[];

  const categoryHref =
    product.category === 'Café' ? '/cafes'
    : product.category === 'Thé' ? '/thes'
    : product.category === 'Cafetières' ? '/accessoires'
    : '/';

  const images = getImages(product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-2 text-sm text-ink-500 sm:mb-8">
        <Link href="/" className="transition-colors hover:text-ink-900">Accueil</Link>
        <span aria-hidden="true">/</span>
        <Link href={categoryHref} className="transition-colors hover:text-ink-900">
          {product.category === 'Café' ? 'Nos Cafés' : product.category === 'Thé' ? 'Nos Thés' : product.category === 'Cafetières' ? 'Accessoires' : 'Boutique'}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-100">
            <ProductImage
              src={images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3" role="region" aria-label="Galerie d'images du produit">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square w-20 overflow-hidden rounded-md bg-ink-100 sm:w-24"
                >
                  <ProductImage
                    src={img}
                    alt={`${product.name} — image ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col lg:py-4">
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600">
              {product.category}
            </p>
          )}
          <h1 className="mt-3 font-serif text-2xl font-medium leading-tight text-ink-900 sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>
          {product.short_description && (
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              {product.short_description}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-6 space-y-3 border-t border-ink-200 pt-6">
            {product.origin && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="mt-0.5 shrink-0 text-ink-400" />
                <div>
                  <span className="font-medium text-ink-700">Origine : </span>
                  <span className="text-ink-600">{product.origin}</span>
                </div>
              </div>
            )}
            {product.aromatic_notes && (
              <div className="flex items-start gap-3 text-sm">
                <Coffee size={18} className="mt-0.5 shrink-0 text-ink-400" />
                <div>
                  <span className="font-medium text-ink-700">Notes aromatiques : </span>
                  <span className="text-ink-600">{product.aromatic_notes}</span>
                </div>
              </div>
            )}
            {product.intensity && (
              <div className="flex items-start gap-3 text-sm">
                <Gauge size={18} className="mt-0.5 shrink-0 text-ink-400" />
                <div>
                  <span className="font-medium text-ink-700">Intensité : </span>
                  <span className="text-ink-600">{product.intensity}</span>
                </div>
              </div>
            )}
            {product.preparation_guide && (
              <div className="flex items-start gap-3 text-sm">
                <ChefHat size={18} className="mt-0.5 shrink-0 text-ink-400" />
                <div>
                  <span className="font-medium text-ink-700">Préparation : </span>
                  <span className="text-ink-600">{product.preparation_guide}</span>
                </div>
              </div>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-base leading-relaxed text-ink-600">
              {product.description}
            </p>
          )}

          <AddToCart product={product} />
        </div>
      </div>

      <CrossSell currentProduct={product} allProducts={allProducts} />
    </div>
  );
}
