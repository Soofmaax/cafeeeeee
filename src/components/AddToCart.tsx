'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import type { Product, ProductVariation } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/format';

function getImage(product: Product): string {
  if (product.images && product.images.length > 0) return product.images[0];
  return product.image;
}

export default function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const variations = product.variations ?? [];
  const hasVariations = variations.length > 0;

  const firstVariation = variations.find((variation) => variation.stock > 0) ?? variations[0];
  const [selectedVariationId, setSelectedVariationId] = useState(
    hasVariations ? firstVariation?.id ?? '' : '',
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariation: ProductVariation | undefined = hasVariations
    ? variations.find((v) => v.id === selectedVariationId)
    : undefined;

  const stock = hasVariations ? selectedVariation?.stock ?? 0 : product.stock;
  const priceCents = hasVariations ? selectedVariation?.price_cents ?? 0 : product.price_cents;
  const weightLabel = hasVariations
    ? selectedVariation?.attribute ?? ''
    : product.weight;
  const variationName = hasVariations
    ? selectedVariation?.name ?? product.name
    : product.name;

  const totalPriceCents = priceCents * quantity;

  function handleAddToCart() {
    if (stock < 1) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        variationId: hasVariations ? selectedVariation!.id : product.id + '-default',
        name: product.name,
        variationName,
        priceCents,
        image: getImage(product),
        weight: weightLabel,
        maxQuantity: stock,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-8">
      {/* Dynamic price display */}
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-serif text-3xl font-medium text-ink-900">
          {formatPrice(priceCents)}
        </span>
        {hasVariations && weightLabel && (
          <span className="text-sm text-ink-500">{weightLabel}</span>
        )}
      </div>

      {hasVariations && (
        <div className="mb-6">
          <p id="format-label" className="mb-3 text-sm font-medium text-ink-700">
            Format
          </p>
          <div className="flex flex-wrap gap-3" role="group" aria-labelledby="format-label">
            {variations.map((v) => {
              const isSelected = v.id === selectedVariationId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariationId(v.id);
                    setQuantity((current) => Math.min(current, Math.max(1, v.stock)));
                  }}
                  disabled={v.stock < 1}
                  aria-pressed={isSelected}
                  className={`min-h-11 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                    isSelected
                      ? 'border-ink-900 bg-ink-900 text-ink-50'
                      : 'border-ink-300 text-ink-700 hover:border-ink-900 disabled:cursor-not-allowed disabled:opacity-40'
                  }`}
                >
                  {v.attribute}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center rounded-full border border-ink-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Diminuer la quantité"
            className="flex h-11 w-11 items-center justify-center text-ink-600 transition-colors hover:text-ink-900"
          >
            <span className="text-lg" aria-hidden="true">−</span>
          </button>
          <span
            className="w-12 text-center font-medium"
            aria-label={`Quantité: ${quantity}`}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            aria-label="Augmenter la quantité"
            className="flex h-11 w-11 items-center justify-center text-ink-600 transition-colors hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="text-lg" aria-hidden="true">+</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock < 1}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-all duration-200 ease-in-out ${
            added
              ? 'bg-green-700 animate-check-pop'
              : 'bg-ink-900 hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40'
          }`}
        >
          {added ? (
            <>
              <Check size={18} />
              Ajouté !
            </>
          ) : (
            <>
              {stock < 1 ? 'Rupture de stock' : 'Ajouter au panier'}
              <span className="ml-1 normal-case tracking-normal">
                · {formatPrice(totalPriceCents)}
              </span>
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-sm text-ink-600">
        ☕ Torréfaction artisanale à Paris 18e — préparation sous 4 jours ouvrés.
      </p>

      {stock > 0 && stock <= 10 && (
        <p className="mt-2 text-sm text-accent-600">Plus que {stock} en stock</p>
      )}
    </div>
  );
}
