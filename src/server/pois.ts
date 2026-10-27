import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, max } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { hiddenIds } from '#/lib/category-tree'
import { categoryType, isListType } from '#/lib/category-types'
import { poiInput, poiInputFor } from '#/lib/poi-input'
import { requireEditor } from '#/server/session'

import type { Poi } from '#/data/pois'
import type { PoiInput } from '#/lib/poi-input'
import type { Track } from '#/lib/media'

const byMapOrder = [asc(pois.sortOrder), asc(pois.createdAt), asc(pois.id)]

/** Ids of the categories hidden from the site, with everything below them. */
async function hiddenCategoryIds() {
  return hiddenIds(await db.select({ id: categories.id, parentId: categories.parentId, visible: categories.visible }).from(categories))
}

/** Published places outside hidden categories, numbered in map order. */
export const listPublicPois = createServerFn({ method: 'GET' }).handler(async (): Promise<Poi[]> => {
  const [rows, hidden] = await Promise.all([
    db
      .select()
      .from(pois)
      .where(eq(pois.published, true))
      .orderBy(...byMapOrder),
    hiddenCategoryIds(),
  ])
  // Tracks stay out: they can be large, and only the place's own page draws one.
  return rows
    .filter((poi) => !hidden.has(poi.category))
    .map(({ published, sortOrder, createdAt, updatedAt, track, ...poi }, i) => ({ ...poi, hasTrack: track !== null, number: i + 1 }))
})

/** The GPS track of a published place, for its page. */
export const getPoiTrack = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<Track | null> => {
    const [row] = await db
      .select({ track: pois.track })
      .from(pois)
      .where(and(eq(pois.id, data.id), eq(pois.published, true)))
    return row?.track ?? null
  })

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminListPois = createServerFn({ method: 'GET' })
  .middleware([requireEditor])
  .handler(() => db.select().from(pois).orderBy(...byMapOrder))

/** Checks a place against the fields of its category's type. */
async function validateForCategory(input: PoiInput) {
  const [category] = await db.select({ type: categories.type }).from(categories).where(eq(categories.id, input.category))
  if (!category) throw new Error('Categoria non trovata')
  if (isListType(category.type)) throw new Error('Una lista non ha contenuti propri: scegli una sua sottocategoria')
  const parsed = poiInputFor(categoryType(category.type)).safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '))
  return parsed.data
}

export const createPoi = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(poiInput)
  .handler(async ({ data: input }) => {
    const data = await validateForCategory(input)
    const [existing] = await db.select({ id: pois.id }).from(pois).where(eq(pois.id, data.id))
    if (existing) throw new Error(`L'indirizzo "${data.id}" è già usato da un altro contenuto`)
    const [{ last }] = await db.select({ last: max(pois.sortOrder) }).from(pois)
    await db.insert(pois).values({ ...data, sortOrder: data.sortOrder || (last ?? 0) + 1 })
    return { id: data.id }
  })

export const updatePoi = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(poiInput)
  .handler(async ({ data: input }) => {
    const { id, ...data } = await validateForCategory(input)
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
