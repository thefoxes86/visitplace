import { categoryLink, useCategories } from '#/data/categories'
import { usePois } from '#/data/use-pois'
import { sectionLink } from '#/data/sections'
import { nextOccurrence } from '#/lib/event-dates'

/** The next `limit` events not over yet, soonest first: repeating ones count from their next time. */
export function useUpcomingEvents(limit: number) {
  const pois = usePois()
  const { categoryOf } = useCategories()
  return pois
    .flatMap((poi) => {
      const next = categoryOf(poi.category).type === 'event' ? nextOccurrence(poi) : null
      return next ? [{ ...poi, next }] : []
    })
    .sort((a, b) => a.next.start.getTime() - b.next.start.getTime())
    .slice(0, limit)
}

/** Props for a <Link> to every event: the events category's timeline, or the Vivi section until there is one. */
export function useEventsLink() {
  const { eventsCategory } = useCategories()
  return eventsCategory ? categoryLink(eventsCategory) : sectionLink('vivi')
}
