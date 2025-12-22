import { z } from 'zod';

/**
 * Transforma fecha del backend (array o string) a string ISO
 * El backend devuelve: [2032, 1, 1, 20, 0] (year, month, day, hour, minute)
 */
function transformBackendDate(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0] = value;
    // Crear fecha (month es 1-indexed en el backend, pero 0-indexed en JS)
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toISOString();
  }
  return new Date().toISOString(); // Fallback
}

// Schema para fechas que pueden venir como array o string
const DateSchema = z.union([
  z.string(),
  z.array(z.number())
]).transform(transformBackendDate);

export const LocationSchema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
});

export const ImageSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
});

export const TicketSchema = z.object({
  id: z.string(),
  value: z.number(),
  currency: z.string(),
  type: z.string(),
  isFree: z.boolean(),
  stock: z.number().int().nonnegative(),
});

export const OrganizerSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional().default(''),
  logoUrl: z.string().url().optional(),
});

export const EventDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: DateSchema,
  image: ImageSchema,
  tickets: z.array(TicketSchema),
  description: z.string(),
  additionalInfo: z.array(z.string()),
  organizer: OrganizerSchema.nullable(),
  status: z.string(),
  location: LocationSchema,
});

// Schema para la lista de eventos del vendedor (respuesta real del BE)
export const EventForListSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: DateSchema,
  location: z.string(),
  bannerUrl: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  status: z.string().default('ACTIVE'),
});

// Schema flexible para compatibilidad con BE (campos de paginación pueden no venir)
export const EventListResponseSchema = z.object({
  events: z.array(EventForListSchema),
  total: z.number().int().nonnegative().optional().default(0),
  page: z.number().int().nonnegative().optional().default(0),
  pageSize: z.number().int().positive().optional().default(10),
  totalPages: z.number().int().nonnegative().optional().default(1),
});

export type EventDetailDTO = z.infer<typeof EventDetailSchema>;
export type EventForListDTO = z.infer<typeof EventForListSchema>;
export type EventListResponseDTO = z.infer<typeof EventListResponseSchema>;

// Search events (público)
export const SearchEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: DateSchema,
  location: z.string(),
  bannerUrl: z.string(),
  price: z.number(),
  currency: z.string(),
  status: z.string().default('ACTIVE'),
  minAge: z.number().int().positive().optional(),
});

export const SearchEventResponseSchema = z.object({
  events: z.array(SearchEventSchema),
  hasEventsInYourCity: z.boolean().optional().default(false),
  totalPages: z.number().int().nonnegative().optional().default(1),
  currentPage: z.number().int().nonnegative().optional().default(0),
  pageSize: z.number().int().positive().optional().default(10),
});

export const personalDataSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  documentType: z.string().optional(),
  document: z.string().optional(),
});

export const buySchema = z.object({
  mainEmail: z.string().email(),
  buyer: z.array(personalDataSchema).min(1).max(5),
});

export const PublicEventDetailSchema = EventDetailSchema; // alias por ahora
export type PublicEventDetail = z.infer<typeof PublicEventDetailSchema>;

export type SearchEventDTO = z.infer<typeof SearchEventSchema>;
export type SearchEventResponseDTO = z.infer<typeof SearchEventResponseSchema>;
