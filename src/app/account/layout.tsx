import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suivre une commande, Café de Papá',
  description: 'Consultez une commande Café de Papá avec le jeton sécurisé de votre confirmation.',
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
