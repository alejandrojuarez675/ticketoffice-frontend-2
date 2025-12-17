// src/constants/eventTags.ts

export const EVENT_TAGS = [
  'Música',
  'Concierto',
  'Teatro',
  'Deportes',
  'Fútbol',
  'Basketball',
  'Conferencia',
  'Tecnología',
  'Negocios',
  'Arte',
  'Exposición',
  'Festival',
  'Gastronomía',
  'Comedia',
  'Stand-up',
  'Familia',
  'Niños',
  'Mayor de edad +18',
  'Todo público',
  'Al aire libre',
  'Indoor',
  'Gratuito',
  'Beneficencia',
  'Educativo',
  'Workshop',
  'Networking',
  'Corporativo',
  'Cultural',
] as const;

export type EventTag = typeof EVENT_TAGS[number];

