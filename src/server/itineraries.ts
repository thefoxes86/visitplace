import { createServerFn } from '@tanstack/react-start'
import { asc, eq, inArray, max } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { itineraries, pois } from '#/db/schema'
import { itineraryInput } from '#/lib/itineraries'
import { requireEditor } from '#/server/session'

import type { Itinerary, ItineraryInput } from '#/lib/itineraries'

const columns = {
  id: itineraries.id,
  title: itineraries.title,
  summary: itineraries.summary,
  description: itineraries.description,
  modes: itineraries.modes,
  duration: itineraries.duration,
  season: itineraries.season,
  kidFriendly: itineraries.kidFriendly,
  petFriendly: itineraries.petFriendly,
  stops: itineraries.stops,
  published: itineraries.published,
  sortOrder: itineraries.sortOrder,
}

const byListOrder = [asc(itineraries.sortOrder), asc(itineraries.title)]

/** Published itineraries, in list order. Stops whose place is not on the site are dropped by the page. */
export const listPublicItineraries = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Itinerary[]> => db.select(columns).from(itineraries).where(eq(itineraries.published, true)).orderBy(...byListOrder),
)

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminListItineraries = createServerFn({ method: 'GET' })
  .middleware([requireEditor])
  .handler((): Promise<Itinerary[]> => db.select(columns).from(itineraries).orderBy(...byListOrder))

/** Every stop must point to an existing place. */
async function checkStops(data: ItineraryInput) {
  const ids = [...new Set(data.stops.map((s) => s.poiId))]
  const found = await db.select({ id: pois.id }).from(pois).where(inArray(pois.id, ids))
  const missing = ids.filter((id) => !found.some((f) => f.id === id))
  if (missing.length) throw new Error(`Tappe con luoghi inesistenti: ${missing.join(', ')}`)
}

export const createItinerary = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(itineraryInput)
  .handler(async ({ data }) => {
    const [taken] = await db.select({ id: itineraries.id }).from(itineraries).where(eq(itineraries.id, data.id))
    if (taken) throw new Error(`L'indirizzo "${data.id}" è già usato da un altro itinerario`)
    await checkStops(data)
    const [{ last }] = await db.select({ last: max(itineraries.sortOrder) }).from(itineraries)
    await db.insert(itineraries).values({ ...data, sortOrder: data.sortOrder || (last ?? 0) + 1 })
    return { id: data.id }
  })

export const updateItinerary = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(itineraryInput)
  .handler(async ({ data: { id, ...data } }) => {
    await checkStops({ id, ...data })
    const updated = await db.update(itineraries).set(data).where(eq(itineraries.id, id)).returning({ id: itineraries.id })
    if (!updated.length) throw new Error('Itinerario non trovato')
    return { id }
  })

export const deleteItinerary = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(itineraries).where(eq(itineraries.id, data.id))
  })
