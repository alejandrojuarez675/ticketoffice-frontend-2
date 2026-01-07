// src/components/seo/OrganizationJsonLd.tsx
import Script from 'next/script';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuentradaya.com';

export default function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TuEntradaYa',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Plataforma de venta de entradas para eventos en Argentina y Colombia',
    sameAs: [
      'https://www.facebook.com/tuentradaya',
      'https://www.instagram.com/tuentradaya',
      'https://twitter.com/tuentradaya',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+57-314-542-9669',
        contactType: 'customer service',
        areaServed: 'CO',
        availableLanguage: 'Spanish',
      },
      {
        '@type': 'ContactPoint',
        telephone: '+54-9-3436-21-0450',
        contactType: 'customer service',
        areaServed: 'AR',
        availableLanguage: 'Spanish',
      },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        addressCountry: 'CO',
        addressLocality: 'Colombia',
      },
      {
        '@type': 'PostalAddress',
        addressCountry: 'AR',
        addressLocality: 'Argentina',
      },
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
