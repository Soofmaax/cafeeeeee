import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import OrderSuccessClient from './OrderSuccessClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Confirmation de commande, Café de Papá',
  description: 'Confirmation sécurisée de votre commande Café de Papá.',
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage({
  searchParams,
}: {
    searchParams: { order_token?: string };
  }) {
  if (!searchParams.order_token) notFound();

  return <OrderSuccessClient orderToken={searchParams.order_token} />;
}
