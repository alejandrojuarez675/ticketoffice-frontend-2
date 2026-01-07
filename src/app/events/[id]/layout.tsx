// src/app/events/[id]/layout.tsx
import type { Metadata } from 'next';
import { EventService } from '@/services/EventService';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuentradaya.com';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const event = await EventService.getPublicById(id);
    
    if (!event) {
      return {
        title: 'Evento no encontrado | TuEntradaYa',
        description: 'El evento que buscas no está disponible.',
      };
    }

    const title = `${event.title} | TuEntradaYa`;
    const description = event.description?.slice(0, 160) || `Compra entradas para ${event.title} en TuEntradaYa`;
    const eventUrl = `${BASE_URL}/events/${id}`;
    const imageUrl = event.image?.url || `${BASE_URL}/og-default.jpg`;

    return {
      title,
      description,
      alternates: {
        canonical: eventUrl,
      },
      openGraph: {
        title: event.title,
        description,
        url: eventUrl,
        siteName: 'TuEntradaYa',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: event.image?.alt || event.title,
          },
        ],
        locale: 'es_AR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description,
        images: [imageUrl],
      },
      other: {
        'event:start_time': event.date,
        'event:location': `${event.location?.name || ''}, ${event.location?.city || ''}, ${event.location?.country || ''}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for event:', error);
    return {
      title: 'Evento | TuEntradaYa',
      description: 'Encuentra los mejores eventos en TuEntradaYa',
    };
  }
}

export default function EventLayout({ children }: Props) {
  return <>{children}</>;
}
