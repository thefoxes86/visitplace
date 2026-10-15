import { z } from 'zod'

import { CATEGORY_TYPE_IDS } from '#/lib/category-types'

/** Admin pages a category slug would hide: /admin/<slug>. */
const RESERVED_SLUGS = ['categorie', 'utenti', 'login', 'nuovo', 'nuova']

const slug = z
  .string()
  .min(1, 'Obbligatorio')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini')

export const categoryInput = z.object({
  /** Fixed once created: places point to it. */
  id: slug,
  slug: slug.refine((value) => !RESERVED_SLUGS.includes(value), 'Indirizzo riservato al backoffice'),
  label: z.string().trim().min(1, 'Obbligatorio').max(40, 'Al massimo 40 caratteri'),
  adminLabel: z.string().trim().min(1, 'Obbligatorio').max(40, 'Al massimo 40 caratteri'),
  singular: z.string().trim().min(1, 'Obbligatorio').max(40, 'Al massimo 40 caratteri'),
  type: z.enum(CATEGORY_TYPE_IDS, { error: 'Scegli un tipo' }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colore non valido'),
  sortOrder: z.number().int().min(0),
})

export type CategoryInput = z.infer<typeof categoryInput>
