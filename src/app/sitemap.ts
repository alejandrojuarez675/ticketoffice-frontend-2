// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { EventService } from '@/services/EventService';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuentradaya.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Páginas dinámicas de eventos
  let eventPages: MetadataRoute.Sitemap = [];
  
  try {
    const events = await EventService.searchEvents({ country: '', pageSize: 100 });
    eventPages = events.events.map((event) => ({
      url: `${BASE_URL}/events/${event.id}`,
      lastModified: new Date(event.date || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching events for sitemap:', error);
  }

  return [...staticPages, ...eventPages];
}
