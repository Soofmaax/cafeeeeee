import type { Metadata } from 'next';
import { supabase, type Product } from '@/lib/supabase';
import { features } from '@/lib/features';
import CategoryPageClient from '@/components/CategoryPageClient';

export const metadata: Metadata = {
  title: 'Nos Thés — Café de Papá',
  description:
    'Une sélection de thés fins et infusions : thés noirs, thés verts, jasmin, Earl Grey, Lapsang fumé. Filtres par famille et origine.',
  openGraph: {
    title: 'Nos Thés — Café de Papá',
    description: 'Thés fins et infusions, sélectionnés avec le même soin que nos cafés.',
  },
};

export default async function ThesPage() {
  const { data } = features.supabase ? await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true }) : { data: [] };

  const allProducts = (data ?? []) as Product[];
  const products = allProducts.filter((p) => p.category === 'Thé');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
          Notre maison de thé
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
          Nos Thés
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          Des grands crus et créations maison, sélectionnés avec la même exigence que nos cafés.
          Thés noirs classiques, thés verts japonais, jasmin délicat ou Lapsang fumé — il y a un
          thé pour chaque moment de la journée.
        </p>
      </header>

      <CategoryPageClient
        products={products}
        categoryId="thes"
        emptyMessage="Aucun thé ne correspond à ces critères."
      />
    </div>
  );
}
