import { Link } from '@tanstack/react-router'

import { TypeIcon } from '#/components/tourist-map/CategoryIcon'
import { useCategories } from '#/data/categories'
import { categoryType } from '#/lib/category-types'

import type { AdminPoi } from '#/components/admin/queries'
import type { Category } from '#/data/categories'

interface CategoryRowsProps {
  /** Categories in tree order, with their depth: subcategories step in under their parent. */
  list: (Category & { depth: number })[]
  /** Every place, to count those of each category and its subcategories. */
  pois: AdminPoi[]
  empty: string
}

/** The categories of a section or a list, one row each, opening the category. */
export function CategoryRows({ list, pois, empty }: CategoryRowsProps) {
  const { subtree } = useCategories()
  if (!list.length) {
    return <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center font-serif italic text-teal">{empty}</p>
  }
  // Depths relative to the shallowest row, so the list starts at the left edge.
  const base = Math.min(...list.map((c) => c.depth))

  return (
    <ul className="divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
      {list.map((category) => {
        const ids = subtree(category.id)
        const places = pois.filter((poi) => ids.has(poi.category))
        const drafts = places.filter((poi) => !poi.published).length
        const depth = category.depth - base
        return (
          <li key={category.id}>
            <Link
              to="/admin/$category"
              params={{ category: category.slug }}
              className="group flex items-center gap-3 px-4 py-3 transition hover:bg-paper/60"
              style={{ paddingLeft: `${1 + depth * 1.75}rem` }}
            >
              {depth > 0 && (
                <span aria-hidden className="-mr-1 text-ink/30">
                  └
                </span>
              )}
              <span className="grid size-9 shrink-0 place-items-center rounded-md text-white" style={{ backgroundColor: category.color }}>
                <TypeIcon type={category.type} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-teal group-hover:text-coral">{category.adminLabel}</span>
                <span className="block text-xs font-light">
                  {categoryType(category.type).label}
                  {drafts > 0 && ` · ${drafts} non pubblicat${drafts === 1 ? 'o' : 'i'}`}
                </span>
              </span>
              <span className="font-display text-2xl font-light text-coral">{places.length}</span>
              <span aria-hidden className="text-teal transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
