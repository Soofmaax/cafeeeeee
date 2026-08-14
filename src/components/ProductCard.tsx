import Link from 'next/link';
import type { Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import ProductImage from '@/components/ProductImage';

function getImage(product: Product): string {
  if (product.images && product.images.length > 0) return product.images[0];
  return product.image;
}

function getBasePrice(product: Product): number {
  if (product.variations && product.variations.length > 0) {
    return Math.min(...product.variations.map((v) => v.price_cents));
  }
  return product.price_cents;
}

function getCategoryLabel(product: Product): string {
  return product.category ?? 'Café';
}

export default function ProductCard({ product }: { product: Product }) {
  const image = getImage(product);
  const basePrice = getBasePrice(product);
  const hasMultiplePrices =
    product.variations && product.variations.length > 1
      ? new Set(product.variations.map((v) => v.price_cents)).size > 1
      : false;
  const totalStock =
    product.variations?.reduce((sum, v) => sum + v.stock, 0) ?? product.stock;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block focus-visible:outline-none"
      aria-label={product.name}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-ink-100">
        <ProductImage
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        {totalStock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-medium text-ink-50">
            Épuisé
          </span>
        )}
        {product.category && (
          <span className="absolute right-3 top-3 rounded-full bg-ink-50/90 px-3 py-1 text-xs font-medium text-ink-700">
            {getCategoryLabel(product)}
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-serif text-base font-medium leading-snug text-ink-900 sm:text-lg">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-500">{product.short_description}</p>
        )}
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-sm text-ink-500">
            {hasMultiplePrices ? 'À partir de' : ''}
          </span>
          <span className="font-medium text-ink-900">{formatPrice(basePrice)}</span>
        </div>
      </div>
    </Link>
  );
}
