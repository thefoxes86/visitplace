import { z } from 'zod'

/** A place as edited in the admin; empty optional fields are sent as null. */
export const poiInput = z
  .object({
    id: z
      .string()
      .min(1, 'Obbligatorio')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini'),
    category: z.enum(['restaurant', 'bnb', 'culture', 'events']),
    name: z.string().trim().min(1, 'Obbligatorio'),
    summary: z.string().trim().min(1, 'Obbligatorio').max(160, 'Al massimo 160 caratteri'),
    description: z.string().trim().min(1, 'Obbligatorio'),
    area: z.string().trim().min(1, 'Obbligatorio'),
    lat: z.number({ error: 'Scegli la posizione' }).min(-90).max(90),
    lon: z.number({ error: 'Scegli la posizione' }).min(-180).max(180),
    featured: z.boolean(),
    published: z.boolean(),
    topic: z.string().nullable(),
    imageUrl: z.url('Indirizzo non valido').nullable(),
    address: z.string().trim().nullable(),
    phone: z.string().trim().nullable(),
    email: z.email('Email non valida').nullable(),
    website: z.url('Indirizzo non valido').nullable(),
    startsAt: z.date().nullable(),
    endsAt: z.date().nullable(),
    sortOrder: z.number().int(),
  })
  .refine((poi) => poi.category !== 'events' || poi.startsAt, { path: ['startsAt'], error: 'Obbligatorio per gli eventi' })
  .refine((poi) => !poi.startsAt || !poi.endsAt || poi.endsAt >= poi.startsAt, {
    path: ['endsAt'],
    error: "Deve essere dopo l'inizio",
  })

export type PoiInput = z.infer<typeof poiInput>

/** "Osteria del Borgo" → "osteria-del-borgo" */
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
