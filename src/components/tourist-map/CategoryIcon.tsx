import { useCategories } from '#/data/categories'

import type { CategoryTypeId } from '#/lib/category-types'

/** Line icons of the category types (src/lib/category-types.ts). */
const ICONS: Record<CategoryTypeId, string> = {
  // calendar with a star
  event: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M12 12.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 14.8l2-.3z',
  // columns
  place: 'M3 9l9-5 9 5M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18',
  // fork and knife
  restaurant: 'M7 3v7a2 2 0 0 0 4 0V3M9 3v18M17 3c-2 2-2 6 0 8v10',
  // bed
  bnb: 'M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01',
  // building with an H
  hotel: 'M4 21V3h16v18M2 21h20M9 7v8M15 7v8M9 11h6M11 21v-3h2v3',
  // mountains with a path
  trekking: 'M2 20l6-10 4 6 3-4 7 8zM8 10l1.5 2.5M5 20l3-3 2 1 3-2',
  // carabiner
  climbing: 'M9 3h5a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H9a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM9 8v9M9 8l3-2',
}

/** A type unknown to this file (added without an icon) gets a map pin. */
const PIN = 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'

/** Icon of a category type. */
export function TypeIcon({ type, className = 'size-4' }: { type: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[type as CategoryTypeId] ?? PIN} />
    </svg>
  )
}

/** Icon of a category (by id in the `categories` table), from its type. */
export function CategoryIcon({ id, className }: { id: string; className?: string }) {
  return <TypeIcon type={useCategories().categoryOf(id).type} className={className} />
}
