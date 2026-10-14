import { createServerFn } from '@tanstack/react-start'
import { asc, eq, max } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { pois } from '#/db/schema'
import { poiInput } from '#/lib/poi-input'
import { requireEditor } from '#/server/session'

import type { Poi } from '#/data/pois'

const byMapOrder = [asc(pois.sortOrder), asc(pois.createdAt), asc(pois.id)]

/** Published places, numbered in map order. */
export const listPublicPois = createServerFn({ method: 'GET' }).handler(async (): Promise<Poi[]> => {
  const rows = await db
    .select()
    .from(pois)
    .where(eq(pois.published, true))
    .orderBy(...byMapOrder)
  return rows.map(({ published, sortOrder, createdAt, updatedAt, ...poi }, i) => ({ ...poi, number: i + 1 }))
})

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminListPois = createServerFn({ method: 'GET' })
  .middleware([requireEditor])
  .handler(() => db.select().from(pois).orderBy(...byMapOrder))

export const createPoi = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(poiInput)
  .handler(async ({ data }) => {
    const [existing] = await db.select({ id: pois.id }).from(pois).where(eq(pois.id, data.id))
    if (existing) throw new Error(`L'indirizzo "${data.id}" è già usato da un altro contenuto`)
    const [{ last }] = await db.select({ last: max(pois.sortOrder) }).from(pois)
    await db.insert(pois).values({ ...data, sortOrder: data.sortOrder || (last ?? 0) + 1 })
    return { id: data.id }
  })

export const updatePoi = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(poiInput)
  .handler(async ({ data: { id, ...data } }) => {
    const updated = await db.update(pois).set(data).where(eq(pois.id, id)).returning({ id: pois.id })
    if (!updated.length) throw new Error('Contenuto non trovato')
    return { id }
  })

export const deletePoi = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(pois).where(eq(pois.id, data.id))
  })
