/**
 * Saving places, shared by the admin's server functions and /api/events.
 * Server only: import it from handlers, never from code that also runs in the browser.
 */
import { eq, inArray, like, max } from 'drizzle-orm'

import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { categoryType, isListType } from '#/lib/category-types'
import { poiInputFor } from '#/lib/poi-input'

import type { PoiInput } from '#/lib/poi-input'

/** Checks a place against the fields of its category's type. */
export async function validateForCategory(input: PoiInput) {
  const [category] = await db.select({ type: categories.type }).from(categories).where(eq(categories.id, input.category))
  if (!category) throw new Error('Categoria non trovata')
  if (isListType(category.type)) throw new Error('Una lista non ha contenuti propri: scegli una sua sottocategoria')
  const parsed = poiInputFor(categoryType(category.type)).safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '))

  // Other categories: existing ones that hold places, without the main one or repeats.
  const extra = [...new Set(parsed.data.extraCategories)].filter((id) => id !== parsed.data.category)
  if (extra.length) {
    const found = await db.select({ id: categories.id, label: categories.label, type: categories.type }).from(categories).where(inArray(categories.id, extra))
    if (found.length < extra.length) throw new Error('Una delle altre categorie non esiste più')
    const list = found.find((c) => isListType(c.type))
    if (list) throw new Error(`"${list.label}" è una lista, non ha contenuti propri: scegli una sua sottocategoria`)
  }
  return { ...parsed.data, extraCategories: extra }
}

/** Checks a new place against its category and saves it, last in map order unless it has its own. Used by the admin and /api/events. */
export async function insertPoi(input: PoiInput) {
  const data = await validateForCategory(input)
  const [existing] = await db.select({ id: pois.id }).from(pois).where(eq(pois.id, data.id))
  if (existing) throw new Error(`L'indirizzo "${data.id}" è già usato da un altro contenuto`)
  const [{ last }] = await db.select({ last: max(pois.sortOrder) }).from(pois)
  await db.insert(pois).values({ ...data, sortOrder: data.sortOrder || (last ?? 0) + 1 })
  return { id: data.id }
}

/** `base` if no place uses it, otherwise the first free among base-2, base-3… */
export async function freePoiId(base: string) {
  const taken = new Set((await db.select({ id: pois.id }).from(pois).where(like(pois.id, `${base}%`))).map((p) => p.id))
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
  return id
}
