import { createServerFn } from '@tanstack/react-start'
import { asc, eq, max } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { categoryType, isListType } from '#/lib/category-types'
import { poiInput, poiInputFor } from '#/lib/poi-input'
import { requireEditor } from '#/server/session'

import type { Poi } from '#/data/pois'
import type { PoiInput } from '#/lib/poi-input'

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
