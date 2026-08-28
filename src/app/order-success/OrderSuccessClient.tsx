'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { CheckCircle2, Store, Phone, Loader2, AlertCircle } from 'lucide-react';
import { PICKUP_STORE } from '@/data/stores';

const MAX_RETRIES = 5;
const POLL_INTERVAL_MS = 2500;

interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  attribute: string;
  quantity: number;
  unitPrice: number;
}

interface LookupResponse {
  found: boolean;
  order?: {
    id: string;
    createdAt: string;
    totalCents: number;
    shippingType: string;
    shippingCost: number;
    relayInfo: { id?: string; name?: string; address?: string } | null;
    items: OrderItem[];
  };
  customer?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  } | null;
}

export default function OrderSuccessClient({ orderToken }: { orderToken: string }) {
  const [order, setOrder] = useState<LookupResponse['order'] | null>(null);
  const [customer, setCustomer] = useState<LookupResponse['customer']>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState<'polling' | 'success' | 'error'>('polling');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (cancelled) return;

        setRetryCount(attempt + 1);

        try {
          const res = await fetch('/api/orders/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: orderToken }),
          });
          if (!res.ok) throw new Error('Lookup failed');
          const data: LookupResponse = await res.json();

          if (data.found && data.order) {
            if (cancelled) return;
            setOrder(data.order);
            setItems(data.order.items ?? []);
            setCustomer(data.customer ?? null);
            setStatus('success');
            return;
          }
        } catch {
          // Network or server error — keep polling
        }

        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }
      }

      if (!cancelled) setStatus('error');
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [orderToken]);

  // --- Polling state ---
  if (status === 'polling') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-100">
          <Loader2 size={32} className="animate-spin text-ink-400" />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-medium text-ink-900 sm:text-3xl">
          Validation de votre commande en cours...
        </h1>
        <p className="mt-3 text-ink-500">
          Nous confirmons votre paiement auprès de notre banque. Cela peut prendre quelques secondes.
        </p>
        <p className="mt-4 text-xs text-ink-400">
          Tentative {retryCount} / {MAX_RETRIES}
        </p>
      </div>
    );
  }

  // --- Error state ---
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle size={32} className="text-amber-600" />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-medium text-ink-900 sm:text-3xl">
          Confirmation en attente
        </h1>
        <p className="mt-3 text-ink-500">
          Votre paiement a été accepté, mais la confirmation de votre commande prend plus de temps que prévu.
          Vous recevrez un e-mail de confirmation dès que votre commande sera validée.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:bg-ink-800"
          >
            Retour à la boutique
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-ink-300 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink-900 transition-colors hover:border-ink-900"
          >
            Mes commandes
          </Link>
        </div>
      </div>
    );
  }

  // --- Success state ---
  if (!order) return null;

  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
          Paiement confirmé
        </h1>
        <p className="mt-3 text-ink-600">
          Merci {customer ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() : ''} ! Votre commande a bien été enregistrée.
        </p>
        <p className="mt-2 text-sm text-ink-500">
          Votre commande est entrée en préparation artisanale, prévue sous 4 jours ouvrés.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-ink-200 bg-white p-6">
        <div className="flex justify-between border-b border-ink-200 pb-4 text-sm">
          <span className="text-ink-500">Date</span>
          <span className="font-medium text-ink-900">{orderDate}</span>
        </div>

        <h2 className="mt-6 mb-4 font-serif text-lg font-medium text-ink-900">Articles</h2>
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={`${item.variantId}-${idx}`} className="flex justify-between text-sm">
              <span className="text-ink-600">
                {item.name} ({item.attribute}){' '}
                <span className="text-ink-400">×{item.quantity}</span>
              </span>
              <span className="font-medium text-ink-900">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2 border-t border-ink-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-600">Mode de retrait</span>
            <span className="font-medium text-ink-900">Click &amp; Collect</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-600">Frais de retrait</span>
            <span className="font-medium text-ink-900">Gratuit</span>
          </div>
          <div className="flex justify-between border-t border-ink-200 pt-3">
            <span className="font-medium text-ink-900">Total</span>
            <span className="font-serif text-xl font-medium text-ink-900">
              {formatPrice(order.totalCents)}
            </span>
          </div>
        </div>

        {/* Pickup info */}
        <div className="mt-6 rounded-lg bg-ink-900 px-5 py-4 text-sm text-ink-50">
            <div className="flex items-start gap-3">
              <Store size={20} className="mt-0.5 shrink-0 text-accent-400" />
              <div>
                <p className="font-medium">Retrait en boutique</p>
                <p className="mt-1 text-ink-200">{PICKUP_STORE.name}</p>
                <p className="text-ink-300">{PICKUP_STORE.address}, {PICKUP_STORE.postalCode} {PICKUP_STORE.city}</p>
                <p className="mt-1 text-ink-300">{PICKUP_STORE.hours}</p>
              </div>
            </div>
            <p className="mt-4 border-t border-ink-700 pt-3 text-ink-300">
              Attendez l&apos;e-mail confirmant que la commande est prête avant votre déplacement.
            </p>
        </div>

        {/* Customer contact */}
        {customer && (
          <div className="mt-6 border-t border-ink-200 pt-4 text-sm text-ink-600">
            <p className="font-medium text-ink-900">Contact</p>
            <p className="mt-1">
              {customer.firstName} {customer.lastName}
            </p>
            <p>{customer.email}</p>
            {customer.phone && (
              <p className="mt-1 flex items-center gap-1.5">
                <Phone size={14} className="text-ink-400" />
                {customer.phone}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:bg-ink-800"
        >
          Retour à la boutique
        </Link>
        <Link
          href="/account"
          className="rounded-full border border-ink-300 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink-900 transition-colors hover:border-ink-900"
        >
          Mes commandes
        </Link>
      </div>
    </div>
  );
}
