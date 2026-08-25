'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/format';

interface Variation {
  id: string;
  name: string;
  sku: string;
  attribute: string;
  price_cents: number;
  weight: string | number;
  stock: number;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category: string | null;
  price_cents: number;
  stock: number;
  variations: Variation[] | null;
}

interface AdminOrder {
  id: string;
  email: string;
  total_cents: number;
  status: string;
  created_at: string;
  customer_phone: string | null;
  email_status: string;
  items_snapshot: string;
}

const ORDER_STATUSES = ['paid', 'prepared', 'collected'] as const;

export default function AdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    const [productsResponse, ordersResponse] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/admin/orders'),
    ]);
    if (productsResponse.status === 401 || ordersResponse.status === 401) {
      setError('Session absente ou expirée.');
      setLoading(false);
      return;
    }
    if (!productsResponse.ok || !ordersResponse.ok) {
      setError('Chargement de l’administration impossible.');
      setLoading(false);
      return;
    }
    setProducts((await productsResponse.json()).products);
    setOrders((await ordersResponse.json()).orders);
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  async function saveProduct(product: AdminProduct) {
    setNotice('');
    const response = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: product.id,
        price_cents: product.price_cents,
        stock: product.stock,
        variations: product.variations ?? [],
      }),
    });
    if (!response.ok) {
      setError('Enregistrement du produit impossible.');
      return;
    }
    setNotice(`${product.name} a été enregistré.`);
    await loadData();
  }

  async function updateOrder(id: string, status: string) {
    const response = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError('Mise à jour de la commande impossible.');
      return;
    }
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
    setNotice(body.warning || 'Statut de la commande enregistré.');
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  async function refundOrder(order: AdminOrder) {
    if (!window.confirm(`Rembourser intégralement la commande ${order.id.slice(0, 8)} ?`)) return;
    const response = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || 'Remboursement impossible.');
      return;
    }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: 'refunded' } : item));
    setNotice('Remboursement Stripe enregistré.');
  }

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-20 text-ink-600">Chargement de l&apos;administration...</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-ink-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600">Gestion interne</p>
          <h1 className="mt-2 font-serif text-3xl font-medium text-ink-900">Commerce Café de Papá</h1>
        </div>
        <button type="button" onClick={logout} className="min-h-11 border border-ink-300 px-5 py-2 text-sm font-medium">Se déconnecter</button>
      </header>

      {error && <div role="alert" className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error} <Link href="/admin/login" className="underline">Connexion</Link></div>}
      {notice && <p role="status" className="mt-6 border border-green-300 bg-green-50 p-4 text-sm text-green-800">{notice}</p>}

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-medium text-ink-900">Produits et stocks</h2>
        <div className="mt-5 space-y-5">
          {products.map((product, productIndex) => (
            <article key={product.id} className="border border-ink-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div><h3 className="font-medium text-ink-900">{product.name}</h3><p className="text-sm text-ink-500">{product.sku || product.slug}</p></div>
                <button type="button" onClick={() => saveProduct(product)} className="min-h-11 bg-ink-900 px-5 py-2 text-sm font-semibold text-ink-50">Enregistrer</button>
              </div>
              {(product.variations ?? []).length === 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <AdminNumber label="Prix en centimes" value={product.price_cents} onChange={(value) => setProducts((current) => current.map((item, index) => index === productIndex ? { ...item, price_cents: value } : item))} />
                  <AdminNumber label="Stock" value={product.stock} onChange={(value) => setProducts((current) => current.map((item, index) => index === productIndex ? { ...item, stock: value } : item))} />
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead><tr className="border-b border-ink-200 text-ink-500"><th className="py-2">Variation</th><th>SKU</th><th>Prix</th><th>Stock</th></tr></thead>
                    <tbody>{product.variations?.map((variation, variationIndex) => (
                      <tr key={variation.id} className="border-b border-ink-100">
                        <td className="py-3">{variation.attribute}</td><td>{variation.sku}</td>
                        <td><input aria-label={`Prix ${variation.attribute}`} type="number" min="0" value={variation.price_cents} onChange={(event) => setProducts((current) => current.map((item, index) => index === productIndex ? { ...item, variations: item.variations?.map((entry, i) => i === variationIndex ? { ...entry, price_cents: Number(event.target.value) } : entry) ?? [] } : item))} className="w-28 border border-ink-300 px-2 py-2" /></td>
                        <td><input aria-label={`Stock ${variation.attribute}`} type="number" min="0" value={variation.stock} onChange={(event) => setProducts((current) => current.map((item, index) => index === productIndex ? { ...item, variations: item.variations?.map((entry, i) => i === variationIndex ? { ...entry, stock: Number(event.target.value) } : entry) ?? [] } : item))} className="w-24 border border-ink-300 px-2 py-2" /></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl font-medium text-ink-900">Commandes récentes</h2>
        <div className="mt-5 overflow-x-auto border border-ink-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead><tr className="border-b border-ink-200 text-ink-500"><th className="p-4">Commande</th><th>Client</th><th>Total</th><th>E-mail</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>{orders.map((order) => (
              <tr key={order.id} className="border-b border-ink-100">
                <td className="p-4"><span className="font-medium">{order.id.slice(0, 8)}</span><br /><span className="text-ink-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span></td>
                <td>{order.email}<br /><span className="text-ink-500">{order.customer_phone}</span></td>
                <td>{formatPrice(order.total_cents)}</td><td>{order.email_status}</td>
                <td>{order.status === 'refunded' ? 'refunded' : <select value={order.status} onChange={(event) => updateOrder(order.id, event.target.value)} className="border border-ink-300 bg-white px-3 py-2">{ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>}</td>
                <td><button type="button" disabled={!['paid', 'prepared'].includes(order.status)} onClick={() => refundOrder(order)} className="min-h-11 border border-red-300 px-3 py-2 text-red-800 disabled:opacity-40">Rembourser</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdminNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-sm text-ink-600">{label}<input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 block w-full border border-ink-300 px-3 py-2 text-ink-900" /></label>;
}
