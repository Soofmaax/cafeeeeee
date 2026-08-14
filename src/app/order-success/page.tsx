import { notFound } from 'next/navigation';
import OrderSuccessClient from './OrderSuccessClient';

export const dynamic = 'force-dynamic';

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  if (!searchParams.session_id) notFound();

  return <OrderSuccessClient sessionId={searchParams.session_id} />;
}
