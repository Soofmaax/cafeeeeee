import type { Metadata } from 'next';
import { getSupabaseClient, type Product } from '@/lib/supabase';
import CategoryPageClient from '@/components/CategoryPageClient';

export const metadata: Metadata = {
  alternates: { canonical: '/accessoires' },
  title: 'Accessoires — Café de Papá',
  description:
    "Cafetières à piston, cafetières italiennes Moka et accessoires pour préparer le café comme un barista. Filtres par méthode d'extraction.",
  openGraph: {
    title: 'Accessoires — Café de Papá',
    description: "Tout l'équipement pour préparer un café d'exception à la maison.",
  },
};

export default async function AccessoiresPage() {
  const supabase = getSupabaseClient();
  const { data } = supabase
    ? await supabase.from('products').select('*').order('created_at', { ascending: true })
    : { data: [] };

  const allProducts = (data ?? []) as Product[];
  const products = allProducts.filter((p) => p.category === 'Cafetières');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
          L&apos;art de la préparation
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
          Accessoires
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          Tout le matériel pour préparer un café d&apos;exception à la maison. De la French Press
          scandinave à la Moka italienne, en passant par les pièces de rechange — choisissez
          la méthode qui révèle le mieux vos arômes.
        </p>
      </header>

      <CategoryPageClient
        products={products}
        categoryId="accessoires"
        emptyMessage="Aucun accessoire ne correspond à ces critères."
      />
    </div>
  );
}
