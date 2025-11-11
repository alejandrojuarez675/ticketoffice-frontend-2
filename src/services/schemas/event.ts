import { z } from 'zod';

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
  date: z.string(),
  image: ImageSchema,
  tickets: z.array(TicketSchema),
  description: z.string(),
  additionalInfo: z.array(z.string()),
  organizer: OrganizerSchema.nullable(),
  status: z.string(),
  location: LocationSchema,
});

export const EventForListSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  location: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT']),
});

export const EventListResponseSchema = z.object({
  events: z.array(EventForListSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type EventDetailDTO = z.infer<typeof EventDetailSchema>;
export type EventForListDTO = z.infer<typeof EventForListSchema>;
export type EventListResponseDTO = z.infer<typeof EventListResponseSchema>;

// Search events
export const SearchEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  location: z.string(),
  bannerUrl: z.string(),
  price: z.number(),
  currency: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT']),
  minAge: z.number().int().positive().optional(),
});

export const SearchEventResponseSchema = z.object({
  events: z.array(SearchEventSchema),
  hasEventsInYourCity: z.boolean(),
  totalPages: z.number().int().nonnegative(),
  currentPage: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
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
