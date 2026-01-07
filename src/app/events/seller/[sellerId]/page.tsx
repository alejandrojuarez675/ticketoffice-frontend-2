import { redirect } from 'next/navigation';
import { isValidId } from '@/utils/validation';

export default async function SellerEventsRedirectPage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  
  // Validar sellerId - redirigir a home si es inválido
  if (!sellerId || !isValidId(sellerId)) {
    redirect('/');
  }
  
  const sp = new URLSearchParams();
  sp.set('vendors', sellerId);
  sp.set('page', '1');
  redirect(`/events?${sp.toString()}`);
}
