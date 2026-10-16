import { useMemo } from 'react'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { categoryPath, categoryTree, subtreeIds } from '#/lib/category-tree'
import { listCategories } from '#/server/categories'

export { categoryPath, categoryTree, subtreeIds } from '#/lib/category-tree'

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
  /** Decides the fields of its places: id in src/lib/category-types.ts. Subcategories share their parent's. */
  type: string
  /** Parent category, for subcategories. */
  parentId: string | null
  /** Section of the site it belongs to (scopri, vivi, gusta, info): set on top-level categories only. */
  section: string | null
  /** Shown among the featured categories on the home page. */
  featured: boolean
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
  parentId: null,
  section: null,
  featured: false,
})

export function useCategories() {
  const { data: categories } = useSuspenseQuery(categoriesQuery)
  return useMemo(
    () => ({
      categories,
      /** Every category, each followed by its subcategories, with its depth. */
      tree: categoryTree(categories),
      /** Top-level categories. */
      roots: categories.filter((c) => !c.parentId),
      /** The category of a place. */
      categoryOf: (id: string) => categories.find((c) => c.id === id) ?? unknownCategory(id),
      /** Ids of a category and its subcategories. */
      subtree: (id: string) => subtreeIds(categories, id),
    }),
    [categories],
  )
}

export const categoryBySlug = (categories: Category[], slug: string) => categories.find((c) => c.slug === slug)

/** Props for a <Link> to a category's public page. */
export const categoryLink = (category: Pick<Category, 'slug'>) => ({ to: '/categorie/$slug' as const, params: { slug: category.slug } })

/** The section a category belongs to: its own, or its top-level category's. */
export const sectionOf = (categories: Category[], id: string) => categoryPath(categories, id)[0]?.section ?? null
