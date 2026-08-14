import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import { supabase } from '@/lib/supabase';
import type { SearchProduct } from '@/components/SearchBar';
import { features } from '@/lib/features';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cafedepapa.fr'),
  title: 'Café de Papá — De la Terre Péruvienne à la Tasse Parisienne',
  description:
    'Café de spécialité issu de la Finca La Campiña au Pérou, porté jusqu\'à Paris par une histoire de famille.',
};

async function getSearchProducts(): Promise<SearchProduct[]> {
  if (!features.supabase) return [];

  const { data } = await supabase
    .from('products')
    .select('id, slug, name, category, origin, aromatic_notes, image, price_cents')
    .order('name', { ascending: true });
  return (data ?? []) as SearchProduct[];
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const searchProducts = await getSearchProducts();

  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable}`}>
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
