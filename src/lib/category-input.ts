import { z } from 'zod'

import { CATEGORY_SECTION_IDS } from '#/data/sections'
import { CATEGORY_TYPE_IDS } from '#/lib/category-types'

/** Admin pages a category slug would hide: /admin/<slug>. */
const RESERVED_SLUGS = ['categorie', 'sezione', 'impostazioni', 'utenti', 'login', 'nuovo', 'nuova']

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
  /** Parent category, for subcategories. */
  parentId: slug.nullable(),
  /** Section of the site: required for top-level categories, left out for subcategories. */
  section: z.enum(CATEGORY_SECTION_IDS, { error: 'Scegli una sezione' }).nullable(),
  /** Shown among the featured categories on the home page. */
  featured: z.boolean(),
}).refine((data) => data.parentId || data.section, { path: ['section'], message: 'Scegli la sezione del sito' })

/** What to do with what is inside a category being deleted. */
export const deleteCategoryInput = z.object({
  id: z.string(),
  /** Subcategories: moved up to the deleted category's parent, or deleted with it. */
  children: z.enum(['up', 'delete']),
  /** Category the places move to; null deletes them. */
  placesTo: z.string().nullable(),
})

export type CategoryInput = z.infer<typeof categoryInput>
