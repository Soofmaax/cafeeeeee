'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';
import { MapPin, Store, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { PICKUP_STORE } from '@/data/stores';
export default function CheckoutPage() {
  const { items, subtotalCents, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const totalCents = subtotalCents;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const payload = {
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variationId,
        quantity: i.quantity,
      })),
      shippingType: 'pickup',
      deliveryDetails: { pickupAddress: PICKUP_STORE.address },
      customerInfo: {
        name: `${firstName} ${lastName}`,
        email: formData.get('email'),
        phone: formData.get('phone'),
      },
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la commande');

      clearCart();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium text-ink-900">Votre panier est vide</h1>
        <p className="mt-3 text-ink-600">Ajoutez des cafés avant de passer commande.</p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 outline-none transition-colors focus:border-ink-900';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="mb-8 font-serif text-2xl font-medium text-ink-900 sm:mb-10 sm:text-3xl lg:text-4xl">
        Finaliser la commande
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
        {/* Form fields */}
        <div className="space-y-6">
          {/* Coordonnées */}
          <fieldset>
            <legend className="mb-4 font-serif text-lg font-medium text-ink-800">
              Coordonnées
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-ink-700">
                  Prénom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-ink-700">
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-700">
                  Téléphone portable
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          {/* Mode de retrait */}
          <fieldset>
            <legend className="mb-4 font-serif text-lg font-medium text-ink-800">
              Mode de retrait
            </legend>
            <div className="rounded-lg border border-ink-900 bg-ink-100/50 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Store size={20} className="shrink-0 text-ink-600" />
                <div className="flex-1">
                  <span className="font-medium text-ink-900">Click &amp; Collect</span>
                  <span className="mt-0.5 block text-sm text-ink-500">
                    1 Rue du Poteau, Paris 18e
                  </span>
                </div>
                <span className="font-medium text-ink-900">Gratuit</span>
              </div>
              <div className="mt-4 border-t border-ink-200 pt-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-ink-400" />
                  <div className="text-sm">
                    <p className="font-medium text-ink-900">{PICKUP_STORE.name}</p>
                    <p className="text-ink-600">
                      {PICKUP_STORE.address}, {PICKUP_STORE.postalCode} {PICKUP_STORE.city}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-ink-400" />
                  <p className="text-sm text-ink-600">{PICKUP_STORE.hours}</p>
                </div>
                <p className="mt-3 text-xs text-ink-500">
                  Préparation prévue sous 4 jours ouvrés. Un e-mail vous préviendra lorsque la
                  commande sera prête au retrait.
                </p>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Summary — desktop sidebar / mobile accordion */}
        <div className="lg:pl-2">
          <div className="rounded-xl border border-ink-200 bg-white">
            {/* Mobile accordion header */}
            <button
              type="button"
              onClick={() => setSummaryOpen((v) => !v)}
              aria-expanded={summaryOpen}
              aria-controls="order-summary"
              className="flex w-full items-center justify-between px-5 py-4 lg:hidden"
            >
              <span className="font-serif text-lg font-medium text-ink-900">Récapitulatif</span>
              <span className="flex items-center gap-3">
                <span className="font-medium text-ink-900">{formatPrice(totalCents)}</span>
                <ChevronDown
                  size={20}
                  className={`text-ink-500 transition-transform duration-200 ${
                    summaryOpen ? 'rotate-180' : ''
                  }`}
                />
              </span>
            </button>

            {/* Desktop header */}
            <h2 className="hidden px-6 pt-6 font-serif text-lg font-medium text-ink-900 lg:block">
              Récapitulatif
            </h2>

            <div
              id="order-summary"
              role="region"
              aria-label="Récapitulatif de la commande"
              className={`px-5 pb-5 lg:px-6 lg:pb-6 lg:pt-4 ${
                summaryOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.variationId} className="flex justify-between text-sm">
                    <span className="pr-2 text-ink-600">
                      {item.name} <span className="text-ink-400">({item.weight})</span>{' '}
                      <span className="text-ink-400">×{item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium text-ink-900">
                      {formatPrice(item.priceCents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-ink-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-600">Sous-total</span>
                  <span className="font-medium text-ink-900">{formatPrice(subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-600">Retrait en boutique</span>
                  <span className="font-medium text-ink-900">Gratuit</span>
                </div>
                <div className="flex justify-between border-t border-ink-200 pt-3">
                  <span className="font-medium text-ink-900">Total</span>
                  <span className="font-serif text-xl font-medium text-ink-900">
                    {formatPrice(totalCents)}
                  </span>
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:bg-ink-800 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Redirection vers Stripe...
                  </>
                ) : (
                  'Payer avec Stripe'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
