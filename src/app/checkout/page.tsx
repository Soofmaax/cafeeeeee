'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';
import { MapPin, Store, Search, Package, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { PICKUP_STORE } from '@/data/stores';

const MONDIAL_RELAY_COST_CENTS = 450;
const FREE_SHIPPING_THRESHOLD_CENTS = 4500;
const PICKUP_COST_CENTS = 0;

interface RelayPoint {
  id: string;
  name: string;
  address: string;
  distance: string;
}

const SIMULATED_RELAYS: RelayPoint[] = [
  { id: 'MR-001', name: 'Tabac Presse Le Marais', address: '23 rue du Temple, 75004 Paris', distance: '0,4 km' },
  { id: 'MR-002', name: 'Carrefour Express Bastille', address: '8 rue de la Roquette, 75011 Paris', distance: '0,8 km' },
  { id: 'MR-003', name: 'Papeterie Nationale', address: '45 rue de Rivoli, 75001 Paris', distance: '1,2 km' },
  { id: 'MR-004', name: 'Relais Kiosque Opéra', address: '12 avenue de l\'Opéra, 75009 Paris', distance: '2,1 km' },
  { id: 'MR-005', name: 'Pharmacie Lafayette', address: '67 rue du Faubourg Saint-Antoine, 75012 Paris', distance: '2,6 km' },
];

type ShippingType = 'mondial_relay' | 'pickup';

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [shippingType, setShippingType] = useState<ShippingType>('mondial_relay');
  const [relaySearch, setRelaySearch] = useState('');
  const [relayResults, setRelayResults] = useState<RelayPoint[]>([]);
  const [relaySearched, setRelaySearched] = useState(false);
  const [selectedRelay, setSelectedRelay] = useState<RelayPoint | null>(null);

  const shippingCostCents = useMemo(() => {
    if (shippingType === 'pickup') return PICKUP_COST_CENTS;
    if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
    return MONDIAL_RELAY_COST_CENTS;
  }, [shippingType, subtotalCents]);

  const totalCents = subtotalCents + (items.length > 0 ? shippingCostCents : 0);

  function handleRelaySearch(e: React.FormEvent) {
    e.preventDefault();
    setRelaySearched(true);
    setRelayResults(SIMULATED_RELAYS);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    if (shippingType === 'mondial_relay' && !selectedRelay) {
      setError('Veuillez sélectionner un point relais.');
      return;
    }

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
      shippingType,
      deliveryDetails:
        shippingType === 'mondial_relay' && selectedRelay
          ? {
              relayId: selectedRelay.id,
              relayName: selectedRelay.name,
              relayAddress: selectedRelay.address,
            }
          : { pickupAddress: PICKUP_STORE.address },
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

  const relayFree = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;

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

          {/* Mode de livraison */}
          <fieldset>
            <legend className="mb-4 font-serif text-lg font-medium text-ink-800">
              Mode de livraison
            </legend>
            <div className="space-y-3">
              {/* Mondial Relay */}
              <div>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 transition-all duration-200 ease-in-out ${
                    shippingType === 'mondial_relay'
                      ? 'border-ink-900 bg-ink-100/50'
                      : 'border-ink-300 hover:border-ink-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingType"
                    value="mondial_relay"
                    checked={shippingType === 'mondial_relay'}
                    onChange={() => setShippingType('mondial_relay')}
                    className="accent-ink-900"
                  />
                  <Package size={20} className="shrink-0 text-ink-600" />
                  <div className="flex-1">
                    <span className="font-medium text-ink-900">Point Relais (Mondial Relay)</span>
                    <span className="mt-0.5 block text-sm text-ink-500">Expédition sous 4 jours ouvrés</span>
                  </div>
                  <span className="font-medium text-ink-900">
                    {relayFree ? 'Offerte' : formatPrice(MONDIAL_RELAY_COST_CENTS)}
                  </span>
                </label>

                {shippingType === 'mondial_relay' && (
                  <div className="mt-4 rounded-lg border border-ink-200 bg-ink-50/50 p-4">
                    <p className="mb-3 text-sm font-medium text-ink-700">
                      Rechercher un point relais
                    </p>
                    <form onSubmit={handleRelaySearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                        />
                        <input
                          type="text"
                          value={relaySearch}
                          onChange={(e) => setRelaySearch(e.target.value)}
                          placeholder="Code postal ou ville"
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                      <button
                        type="submit"
                        className="shrink-0 rounded-lg bg-ink-900 px-5 text-sm font-medium text-ink-50 transition-colors hover:bg-ink-800"
                      >
                        Rechercher
                      </button>
                    </form>

                    {relaySearched && (
                      <div className="mt-4 space-y-2">
                        {relayResults.map((relay) => (
                          <label
                            key={relay.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-200 ${
                              selectedRelay?.id === relay.id
                                ? 'border-ink-900 bg-white'
                                : 'border-ink-200 bg-white hover:border-ink-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="relay"
                              value={relay.id}
                              checked={selectedRelay?.id === relay.id}
                              onChange={() => setSelectedRelay(relay)}
                              className="mt-1 accent-ink-900"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink-900">{relay.name}</p>
                              <p className="text-sm text-ink-500">{relay.address}</p>
                              <p className="mt-0.5 text-xs text-accent-600">
                                à {relay.distance}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedRelay && (
                      <div className="mt-3 rounded-lg bg-ink-900 px-4 py-3 text-sm text-ink-50">
                        <p className="font-medium">Point relais sélectionné :</p>
                        <p className="mt-1 text-ink-200">
                          {selectedRelay.name} — {selectedRelay.address}
                        </p>
                      </div>
                    )}

                    <p className="mt-3 text-xs text-ink-500">
                      Expédition sous 4 jours ouvrés (délai de livraison garanti sous 30 jours max).
                    </p>
                  </div>
                )}
              </div>

              {/* Pickup */}
              <div>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 transition-all duration-200 ease-in-out ${
                    shippingType === 'pickup'
                      ? 'border-ink-900 bg-ink-100/50'
                      : 'border-ink-300 hover:border-ink-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingType"
                    value="pickup"
                    checked={shippingType === 'pickup'}
                    onChange={() => setShippingType('pickup')}
                    className="accent-ink-900"
                  />
                  <Store size={20} className="shrink-0 text-ink-600" />
                  <div className="flex-1">
                    <span className="font-medium text-ink-900">Retrait en boutique</span>
                    <span className="mt-0.5 block text-sm text-ink-500">
                      Click &amp; Collect — 1 Rue du Poteau, Paris 18e
                    </span>
                  </div>
                  <span className="font-medium text-ink-900">Gratuit</span>
                </label>

                {shippingType === 'pickup' && (
                  <div className="mt-4 rounded-lg border border-ink-200 bg-ink-50/50 p-4">
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
                      Disponible au retrait sous 4 jours ouvrés. Vous recevrez un email/SMS dès que
                      votre commande est prête.
                    </p>
                  </div>
                )}
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
                  <span className="text-ink-600">Livraison</span>
                  <span className="font-medium text-ink-900">
                    {shippingCostCents === 0 ? 'Offerte' : formatPrice(shippingCostCents)}
                  </span>
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
