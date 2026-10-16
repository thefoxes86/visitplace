import { z } from 'zod'

import { detailsSchema } from '#/lib/category-types'

import type { CategoryType } from '#/lib/category-types'

/** Fields shared by every place; empty optional fields are sent as null. */
const poiFields = z.object({
  id: z
    .string()
    .min(1, 'Obbligatorio')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini'),
  /** Id in the `categories` table (checked by its foreign key). */
  category: z.string().min(1),
  name: z.string().trim().min(1, 'Obbligatorio'),
  summary: z.string().trim().min(1, 'Obbligatorio').max(160, 'Al massimo 160 caratteri'),
  description: z.string().trim().min(1, 'Obbligatorio'),
  area: z.string().trim().min(1, 'Obbligatorio'),
  lat: z.number({ error: 'Scegli la posizione' }).min(-90).max(90),
  lon: z.number({ error: 'Scegli la posizione' }).min(-180).max(180),
  featured: z.boolean(),
  published: z.boolean(),
  imageUrl: z.url('Indirizzo non valido').nullable(),
  address: z.string().trim().nullable(),
  phone: z.string().trim().nullable(),
  email: z.email('Email non valida').nullable(),
  website: z.url('Indirizzo non valido').nullable(),
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable(),
  sortOrder: z.number().int(),
})

/** What the admin sends: `details` is checked once the category's type is known. */
export const poiInput = poiFields.extend({
  details: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
})

export type PoiInput = z.infer<typeof poiInput>

/** A place of a category of the given type: its own fields, and dates for events. */
export const poiInputFor = (type: CategoryType) =>
  poiFields
    .extend({ details: detailsSchema(type) })
    .refine((poi) => !type.dates || poi.startsAt, { path: ['startsAt'], error: 'Obbligatorio per gli eventi' })
    .refine((poi) => !poi.startsAt || !poi.endsAt || poi.endsAt >= poi.startsAt, {
      path: ['endsAt'],
      error: "Deve essere dopo l'inizio",
    })
    // Clear what the type doesn't use, so switching type leaves nothing stale behind.
    .transform((poi) => ({
      ...poi,
      startsAt: type.dates ? poi.startsAt : null,
      endsAt: type.dates ? poi.endsAt : null,
      address: type.contacts.includes('address') ? poi.address : null,
      phone: type.contacts.includes('phone') ? poi.phone : null,
      email: type.contacts.includes('email') ? poi.email : null,
      website: type.contacts.includes('website') ? poi.website : null,
    }))

/** "Osteria del Borgo" → "osteria-del-borgo" */
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
