import type { PoiCategory } from '#/data/pois'

export function CategoryIcon({ id, className = 'size-4' }: { id: PoiCategory; className?: string }) {
  const d: Record<PoiCategory, string> = {
    // fork and knife
    restaurant: 'M7 3v7a2 2 0 0 0 4 0V3M9 3v18M17 3c-2 2-2 6 0 8v10',
    // bed
    bnb: 'M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01',
    // columns
    culture: 'M3 9l9-5 9 5M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18',
    // calendar with a star
    events: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M12 12.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 14.8l2-.3z',
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d[id]} />
    </svg>
  )
}
