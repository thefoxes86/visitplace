import { createContext, createElement, useContext, useMemo } from 'react'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import type { ReactNode } from 'react'

import { categoryPath, categoryTree, hiddenIds, subtreeIds } from '#/lib/category-tree'
import { isListType } from '#/lib/category-types'
import { listCategories } from '#/server/categories'

export { categoryPath, categoryTree, hiddenIds, subtreeIds } from '#/lib/category-tree'

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
  /** Off hides the category and everything below it from the site. */
  visible: boolean
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
  visible: true,
})

/** On in the admin, which shows hidden categories too; the site leaves them out. */
const AllCategoriesContext = createContext(false)

/** Gives the admin every category, hidden ones included. */
export const AllCategories = ({ children }: { children: ReactNode }) => createElement(AllCategoriesContext.Provider, { value: true }, children)

/** Categories on the site, or every category inside <AllCategories> (the admin). */
export function useCategories() {
  const { data: all } = useSuspenseQuery(categoriesQuery)
  const showHidden = useContext(AllCategoriesContext)
  return useMemo(() => {
    const hidden = showHidden ? new Set<string>() : hiddenIds(all)
    const categories = hidden.size ? all.filter((c) => !hidden.has(c.id)) : all
    return {
      categories,
      /** Every category, each followed by its subcategories, with its depth. */
      tree: categoryTree(categories),
      /** Top-level categories. */
      roots: categories.filter((c) => !c.parentId),
      /** The category of a place. */
      categoryOf: (id: string) => categories.find((c) => c.id === id) ?? unknownCategory(id),
      /** Ids of a category and its subcategories. */
      subtree: (id: string) => subtreeIds(categories, id),
      /** Whether a category holds events only, shown as a timeline. */
      isEventCategory: (id: string) => isEventCategory(categories, id),
      /** The category of every event: the highest that holds events only. */
      eventsCategory: categoryTree(categories)
        .filter((c) => isEventCategory(categories, c.id))
        .sort((a, b) => a.depth - b.depth)[0] as Category | undefined,
    }
  }, [all, showHidden])
}

/** An event category, or a list whose categories are all event categories. */
function isEventCategory(categories: Category[], id: string) {
  const ids = subtreeIds(categories, id)
  const holding = categories.filter((c) => ids.has(c.id) && !isListType(c.type))
  return holding.length > 0 && holding.every((c) => c.type === 'event')
}

export const categoryBySlug =(categories: Category[], slug: string) => categories.find((c) => c.slug === slug)

/** Props for a <Link> to a category's public page. */
export const categoryLink = (category: Pick<Category, 'slug'>) => ({ to: '/categorie/$slug' as const, params: { slug: category.slug } })

/** The section a category belongs to: its own, or its top-level category's. */
export const sectionOf = (categories: Category[], id: string) => categoryPath(categories, id)[0]?.section ?? null
