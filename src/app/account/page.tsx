'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import { KeyRound, Package, Store } from 'lucide-react';

interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  attribute: string;
  quantity: number;
  unitPrice: number;
}

interface OrderResult {
  id: string;
  totalCents: number;
  shippingType: string;
  shippingCost: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  prepared: 'Préparée',
  shipped: 'Expédiée',
  collected: 'Récupérée',
};

export default function AccountPage() {
  const [orderToken, setOrderToken] = useState('');
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderToken.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: orderToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setOrders(data.found && data.order ? [data.order] : []);
      setSearched(true);
    } catch {
      setError('Impossible de récupérer vos commandes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-medium text-ink-900 sm:text-4xl">Mon compte</h1>
      <p className="mt-3 text-ink-600">
        Utilisez le jeton sécurisé figurant dans votre lien de confirmation pour consulter votre commande.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <KeyRound
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="password"
            required
            value={orderToken}
            onChange={(e) => setOrderToken(e.target.value)}
            placeholder="Jeton sécurisé de la commande"
            className="w-full rounded-full border border-ink-300 bg-white py-3.5 pl-12 pr-4 text-sm text-ink-900 placeholder-ink-400 outline-none transition-colors focus:border-ink-900"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? 'Recherche...' : 'Consulter'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {searched && !error && (
        <div className="mt-10">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-ink-200 bg-white py-16 text-center">
              <Package size={32} className="text-ink-300" />
              <p className="mt-4 font-serif text-lg text-ink-500">
                Aucune commande trouvée pour cette adresse
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-medium text-ink-900">
                {orders.length} commande{orders.length > 1 ? 's' : ''}
              </h2>
              {orders.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                return (
                  <div key={order.id} className="rounded-xl border border-ink-200 bg-white p-6">
                    <div className="flex items-center justify-between border-b border-ink-200 pb-4">
                      <div>
                        <span className="text-sm font-medium text-ink-900">
                          Commande n°{order.id.slice(0, 8)}
                        </span>
                        <span className="ml-3 text-sm text-ink-500">{date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                        <span className="font-serif text-lg font-medium text-ink-900">
                          {formatPrice(order.totalCents)}
                        </span>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {order.items.map((item, idx) => (
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
                    <div className="mt-4 flex items-center gap-2 border-t border-ink-200 pt-3 text-sm text-ink-500">
                      <Store size={16} />
                      <span>
                        Retrait en boutique — gratuit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
