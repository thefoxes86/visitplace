import { useMemo } from 'react'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { listCategories } from '#/server/categories'

/** A kind of place, as stored in the `categories` table. */
export interface Category {
  /** Stable key used in code (e.g. the Gusta page lists `restaurant`). */
  id: string
  /** URL segment in the admin: /admin/<slug>. */
  slug: string
  /** Name on the site: legends, filters, labels. */
  label: string
  /** Name of the list in the admin. */
  adminLabel: string
  /** "Nuovo …" in the admin. */
  singular: string
  color: string
  /** Decides the fields of its places: id in src/lib/category-types.ts. */
  type: string
}

/** Loaded by the root route, so always ready in pages. */
export const categoriesQuery = queryOptions({
  queryKey: ['categories'],
  queryFn: () => listCategories(),
  staleTime: 5 * 60_000,
})

/** Shown for a place whose category is missing, instead of breaking the page. */
const unknownCategory = (id: string): Category => ({
  id,
  slug: id,
  label: id,
  adminLabel: id,
  singular: id,
  color: '#33423e',
  type: 'place',
})

export function useCategories() {
  const { data: categories } = useSuspenseQuery(categoriesQuery)
  return useMemo(
    () => ({
      categories,
      /** The category of a place. */
      categoryOf: (id: string) => categories.find((c) => c.id === id) ?? unknownCategory(id),
    }),
    [categories],
  )
}

export const categoryBySlug = (categories: Category[], slug: string) => categories.find((c) => c.slug === slug)
