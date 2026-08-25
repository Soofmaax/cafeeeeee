import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administration, Café de Papá',
  description: 'Administration sécurisée du catalogue et des commandes.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
