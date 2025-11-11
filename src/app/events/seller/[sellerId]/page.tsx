import { redirect } from 'next/navigation';

export default async function SellerEventsRedirectPage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  const sp = new URLSearchParams();
  sp.set('vendors', sellerId);
  sp.set('page', '1');
  redirect(`/events?${sp.toString()}`);
}
