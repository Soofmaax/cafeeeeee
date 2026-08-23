import Link from 'next/link';
import type { Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import ProductImage from '@/components/ProductImage';
import { Sparkles } from 'lucide-react';

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

function pickCrossSellProducts(current: Product, all: Product[]): Product[] {
  const others = all.filter((p) => p.id !== current.id);
  const recommendations: Product[] = [];

  if (current.category === 'Café') {
    // Suggest a cafetière (accessoire)
    const cafetiere = others.find((p) => p.category === 'Cafetières');
    if (cafetiere) recommendations.push(cafetiere);

    // Suggest another café with similar intensity
    const sameIntensity = others.find(
      (p) => p.category === 'Café' && p.id !== current.id && p.intensity === current.intensity,
    );
    if (sameIntensity) {
      recommendations.push(sameIntensity);
    } else {
      // Fallback: any other café
      const otherCoffee = others.find((p) => p.category === 'Café' && p.id !== current.id);
      if (otherCoffee) recommendations.push(otherCoffee);
    }
  } else if (current.category === 'Thé') {
    // Suggest another tea
    const otherTea = others.find((p) => p.category === 'Thé' && p.id !== current.id);
    if (otherTea) recommendations.push(otherTea);

    // Suggest a cafetière for loose leaf
    const cafetiere = others.find((p) => p.category === 'Cafetières');
    if (cafetiere) recommendations.push(cafetiere);
  } else if (current.category === 'Cafetières') {
    // Suggest a coffee to go with the cafetière
    const coffee = others.find((p) => p.category === 'Café');
    if (coffee) recommendations.push(coffee);

    // Suggest another accessory
    const otherAccessory = others.find(
      (p) => p.category === 'Cafetières' && p.id !== current.id,
    );
    if (otherAccessory) recommendations.push(otherAccessory);
  }

  // Fill up to 3 with any remaining products
  const remaining = others.filter((p) => !recommendations.includes(p));
  while (recommendations.length < 3 && remaining.length > 0) {
    const next = remaining.shift();
    if (next) recommendations.push(next);
  }

  return recommendations.slice(0, 3);
}

export default function CrossSell({
  currentProduct,
  allProducts,
}: {
  currentProduct: Product;
  allProducts: Product[];
}) {
  const recommendations = pickCrossSellProducts(currentProduct, allProducts);

  if (recommendations.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8" aria-label="Recommandations">
      <div className="border-t border-ink-200 pt-12">
        <div className="mb-8 flex items-center gap-2">
          <Sparkles size={20} className="text-accent-600" />
          <h2 className="font-serif text-2xl font-medium text-ink-900 sm:text-3xl">
            Le conseil du barista
          </h2>
        </div>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-600">
          Sélection complémentaire pour sublimer votre dégustation.
        </p>
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {recommendations.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex gap-4 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-200 hover:border-ink-400 hover:shadow-md focus-visible:outline-none"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <ProductImage
                  src={getImage(product)}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                  {product.category}
                </p>
                <h3 className="mt-1 line-clamp-2 font-medium text-ink-900 group-hover:text-accent-700">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-ink-700">
                  {formatPrice(getBasePrice(product))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
