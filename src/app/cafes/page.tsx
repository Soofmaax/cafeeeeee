import type { Metadata } from 'next';
import { getSupabaseClient, type Product } from '@/lib/supabase';
import CategoryPageClient from '@/components/CategoryPageClient';

export const metadata: Metadata = {
  alternates: { canonical: '/cafes' },
  title: 'Nos Cafés — Café de Papá',
  description:
    'Découvrez notre sélection de cafés de spécialité 100% Arabica, torréfiés artisanalement à Paris. Filtres par origine, intensité et type (grains, moulu, décaféiné).',
  openGraph: {
    title: 'Nos Cafés — Café de Papá',
    description:
      'Cafés de spécialité 100% Arabica, torréfiés à la commande sous 4 jours ouvrés à Paris.',
  },
};

export default async function CafesPage() {
  const supabase = getSupabaseClient();
  const { data } = supabase
    ? await supabase.from('products').select('*').order('created_at', { ascending: true })
    : { data: [] };

  const allProducts = (data ?? []) as Product[];
  const products = allProducts.filter((p) => p.category === 'Café');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
          Notre brûlerie
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
          Nos Cafés
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          Des grains 100% Arabica issus de fermes partenaires triées avec soin, torréfiés
          lentement à Paris 18e et préparés sous 4 jours ouvrés. Choisissez par terroir,
          par intensité, ou laissez-vous guider par nos notes de dégustation.
        </p>
      </header>

      <CategoryPageClient
        products={products}
        categoryId="cafes"
        emptyMessage="Aucun café ne correspond à ces critères. Essayez d'élargir votre sélection."
      />
    </div>
  );
}
