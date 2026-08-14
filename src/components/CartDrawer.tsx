'use client';

import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotalCents, totalItems } =
    useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-ink-950/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ink-50 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4 sm:px-6">
          <h2 className="font-serif text-xl font-medium text-ink-900">
            Panier{' '}
            {totalItems > 0 && (
              <span className="text-ink-400">
                ({totalItems} article{totalItems > 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 transition-colors hover:text-ink-900"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-serif text-lg text-ink-500">Votre panier est vide</p>
              <Link
                href="/cafes"
                onClick={closeCart}
                className="rounded-full border border-ink-300 px-6 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900"
              >
                Découvrir nos cafés
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.variationId} className="flex gap-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="shrink-0"
                    aria-label={item.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="font-medium text-ink-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variationId)}
                        aria-label={`Retirer ${item.name} du panier`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-400 transition-colors hover:text-ink-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-500">{item.weight}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variationId, item.quantity - 1)}
                          aria-label={`Diminuer la quantité de ${item.name}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-300 text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
                        >
                          <Minus size={16} />
                        </button>
                        <span
                          className="w-10 text-center text-sm font-medium"
                          aria-label={`Quantité: ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variationId, item.quantity + 1)}
                          aria-label={`Augmenter la quantité de ${item.name}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-300 text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="font-medium text-ink-900">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-ink-200 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-600">Sous-total</span>
              <span className="font-serif text-xl font-medium text-ink-900">
                {formatPrice(subtotalCents)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-400">Livraison calculée à l&apos;étape suivante</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 block rounded-full bg-ink-900 py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:bg-ink-800"
            >
              Passer commande
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
