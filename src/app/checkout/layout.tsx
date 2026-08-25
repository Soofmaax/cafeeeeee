import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finaliser la commande, Café de Papá',
  description: 'Finalisez votre commande et choisissez le retrait Click & Collect à Paris 18e.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
