import type { Metadata } from 'next';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Order Details',
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <div data-id={id}>{/* Order detail */}</div>;
}
