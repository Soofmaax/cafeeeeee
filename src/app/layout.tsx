import type { Metadata } from 'next';
import { Source_Sans_3, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import { getSupabaseClient } from '@/lib/supabase';
import type { SearchProduct } from '@/components/SearchBar';
import { getPublicAppUrl } from '@/lib/app-url';

const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  title: 'Café de Papá — De la Terre Péruvienne à la Tasse Parisienne',
  description:
    'Café de spécialité issu de la Finca La Campiña au Pérou, porté jusqu\'à Paris par une histoire de famille.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Café de Papá',
    title: 'Café de Papá, de la Terre Péruvienne à la Tasse Parisienne',
    description: 'Café de spécialité familial, cultivé au Pérou et torréfié à Paris.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Café de Papá, de la Terre Péruvienne à la Tasse Parisienne',
    description: 'Café de spécialité familial, cultivé au Pérou et torréfié à Paris.',
  },
};

async function getSearchProducts(): Promise<SearchProduct[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('products')
    .select('id, slug, name, category, origin, aromatic_notes, image, price_cents')
    .order('name', { ascending: true });
  return (data ?? []) as SearchProduct[];
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const searchProducts = await getSearchProducts();

  return (
    <html lang="fr" className={`${sourceSans.variable} ${cormorant.variable}`}>
      <body>
        <CartProvider>
          <Header searchProducts={searchProducts} />
          <main className="min-h-screen pt-16">{children}</main>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
