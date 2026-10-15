import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, eq, max, ne, or } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { categoryInput } from '#/lib/category-input'
import { requireAdmin } from '#/server/session'

import type { Category } from '#/data/categories'

const publicColumns = {
  id: categories.id,
  slug: categories.slug,
  label: categories.label,
  adminLabel: categories.adminLabel,
  singular: categories.singular,
  color: categories.color,
  type: categories.type,
}

const byMenuOrder = [asc(categories.sortOrder), asc(categories.label)]

/** Every category, in menu order. */
export const listCategories = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Category[]> => db.select(publicColumns).from(categories).orderBy(...byMenuOrder),
)

// ── Admin ────────────────────────────────────────────────────────────────────

/** Categories with their order and how many places use them. */
export const adminListCategories = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(() =>
    db
      .select({ ...publicColumns, sortOrder: categories.sortOrder, places: count(pois.id) })
      .from(categories)
      .leftJoin(pois, eq(pois.category, categories.id))
      .groupBy(categories.id)
      .orderBy(...byMenuOrder),
  )

export const createCategory = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(categoryInput)
  .handler(async ({ data }) => {
    const [taken] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(eq(categories.id, data.id), eq(categories.slug, data.slug)))
    if (taken) throw new Error(`Esiste già una categoria con indirizzo "${data.slug}"`)
    const [{ last }] = await db.select({ last: max(categories.sortOrder) }).from(categories)
    await db.insert(categories).values({ ...data, sortOrder: data.sortOrder || (last ?? 0) + 1 })
    return { id: data.id }
  })

export const updateCategory = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(categoryInput)
  .handler(async ({ data: { id, ...data } }) => {
    const [taken] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.slug, data.slug), ne(categories.id, id)))
    if (taken) throw new Error(`Esiste già una categoria con indirizzo "${data.slug}"`)
    const updated = await db.update(categories).set(data).where(eq(categories.id, id)).returning({ id: categories.id })
    if (!updated.length) throw new Error('Categoria non trovata')
    return { id }
  })

export const deleteCategory = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // The foreign key refuses too; this gives a readable message.
    const [{ places }] = await db.select({ places: count() }).from(pois).where(eq(pois.category, data.id))
    if (places > 0) {
      throw new Error(`La categoria ha ${places} contenut${places === 1 ? 'o' : 'i'}: spostali o eliminali prima.`)
    }
    await db.delete(categories).where(eq(categories.id, data.id))
  })
