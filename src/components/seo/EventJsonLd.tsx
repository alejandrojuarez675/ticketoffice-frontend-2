// src/components/seo/EventJsonLd.tsx
import Script from 'next/script';
import type { EventDetail } from '@/types/Event';

interface EventJsonLdProps {
  event: EventDetail;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuentradaya.com';

export default function EventJsonLd({ event }: EventJsonLdProps) {
  const eventDate = new Date(event.date);
  const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // +3 horas por defecto

  // Encontrar el precio más bajo y más alto
  const prices = event.tickets?.map(t => t.value).filter(v => v > 0) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const currency = event.tickets?.[0]?.currency || 'ARS';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || '',
    startDate: eventDate.toISOString(),
    endDate: endDate.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location?.name || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location?.address || '',
        addressLocality: event.location?.city || '',
        addressCountry: event.location?.country || '',
      },
    },
    image: event.image?.url ? [event.image.url] : [],
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: minPrice,
      highPrice: maxPrice,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/events/${event.id}`,
      validFrom: new Date().toISOString(),
    },
    organizer: event.organizer ? {
      '@type': 'Organization',
      name: event.organizer.name || 'TuEntradaYa',
      url: event.organizer.url || BASE_URL,
    } : {
      '@type': 'Organization',
      name: 'TuEntradaYa',
      url: BASE_URL,
    },
    performer: {
      '@type': 'PerformingGroup',
      name: event.title,
    },
  };

  return (
    <Script
      id="event-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
