'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error || 'Connexion impossible.');
      setLoading(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="font-serif text-3xl font-medium text-ink-900">Administration</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">
        Accès réservé à l&apos;équipe Café de Papá.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-700">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="username" required className="w-full border border-ink-300 bg-white px-4 py-3" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink-700">Mot de passe</label>
          <input id="password" name="password" type="password" autoComplete="current-password" minLength={12} required className="w-full border border-ink-300 bg-white px-4 py-3" />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="min-h-11 w-full bg-ink-900 px-6 py-3 text-sm font-semibold text-ink-50 disabled:opacity-50">
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </section>
  );
}
