import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, eq, inArray, isNull, max, ne, or } from 'drizzle-orm'

import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { categoryInput, deleteCategoryInput } from '#/lib/category-input'
import { categoryTree, subtreeIds } from '#/lib/category-tree'
import { isListType } from '#/lib/category-types'
import { requireAdmin } from '#/server/session'

import type { Category } from '#/data/categories'
import type { CategoryInput } from '#/lib/category-input'

const publicColumns = {
  id: categories.id,
  slug: categories.slug,
  label: categories.label,
  adminLabel: categories.adminLabel,
  singular: categories.singular,
  color: categories.color,
  type: categories.type,
  parentId: categories.parentId,
  section: categories.section,
  featured: categories.featured,
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

/** Id, parent and type of every category, to walk the tree. */
const treeColumns = { id: categories.id, parentId: categories.parentId, type: categories.type }

/**
 * Checks the parent of a category and returns the type the category must have:
 * under a list it keeps its own, otherwise it shares its parent's, so its places keep the same fields.
 */
async function typeUnderParent(data: CategoryInput) {
  if (!data.parentId) return data.type
  const all = await db.select(treeColumns).from(categories)
  const parent = all.find((c) => c.id === data.parentId)
  if (!parent) throw new Error('Categoria padre non trovata')
  // A category can't go under itself or one of its own subcategories.
  if (subtreeIds(all, data.id).has(parent.id)) throw new Error('Una categoria non può stare dentro sé stessa o una sua sottocategoria')
  return isListType(parent.type) ? data.type : (parent.type as CategoryInput['type'])
}

/** Next position among the category's siblings. */
async function nextSortOrder(parentId: string | null) {
  const [{ last }] = await db
    .select({ last: max(categories.sortOrder) })
    .from(categories)
    .where(parentId ? eq(categories.parentId, parentId) : isNull(categories.parentId))
  return (last ?? 0) + 1
}

/** Only top-level categories carry a section: subcategories follow their parent's. */
const ownSection = (data: CategoryInput) => (data.parentId ? null : data.section)

export const createCategory = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(categoryInput)
  .handler(async ({ data }) => {
    const [taken] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(eq(categories.id, data.id), eq(categories.slug, data.slug)))
    if (taken) throw new Error(`Esiste già una categoria con indirizzo "${data.slug}"`)
    const type = await typeUnderParent(data)
    const sortOrder = data.sortOrder || (await nextSortOrder(data.parentId))
    await db.insert(categories).values({ ...data, type, section: ownSection(data), sortOrder })
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
    const type = await typeUnderParent({ id, ...data })
    if (isListType(type)) {
      const [{ places }] = await db.select({ places: count() }).from(pois).where(eq(pois.category, id))
      if (places > 0) {
        throw new Error(`Una lista non ha contenuti propri: sposta prima i ${places} contenuti in una sottocategoria.`)
      }
    }
    await db.transaction(async (tx) => {
      const updated = await tx
        .update(categories)
        .set({ ...data, type, section: ownSection({ id, ...data }) })
        .where(eq(categories.id, id))
        .returning({ id: categories.id })
      if (!updated.length) throw new Error('Categoria non trovata')
      // Below a category that is not a list, every subcategory shares its type.
      if (isListType(type)) return
      const all = await tx.select(treeColumns).from(categories)
      const below = [...subtreeIds(all, id)].filter((c) => c !== id)
      if (below.length) await tx.update(categories).set({ type }).where(inArray(categories.id, below))
    })
    return { id }
  })

export const deleteCategory = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(deleteCategoryInput)
  .handler(async ({ data }) => {
    await db.transaction(async (tx) => {
      const all = await tx.select(treeColumns).from(categories)
      const category = all.find((c) => c.id === data.id)
      if (!category) throw new Error('Categoria non trovata')
      const removed = data.children === 'delete' ? subtreeIds(all, data.id) : new Set([data.id])

      // Subcategories kept move up one level. Their type is already right there:
      // under a list they keep their own, otherwise they share it with both levels.
      if (data.children === 'up') {
        // Becoming top-level, they take the section of the category they leave.
        const [{ section }] = await tx.select({ section: categories.section }).from(categories).where(eq(categories.id, data.id))
        await tx
          .update(categories)
          .set({ parentId: category.parentId, section: category.parentId ? null : section })
          .where(eq(categories.parentId, data.id))
      }

      const removedIds = [...removed]
      if (data.placesTo) {
        const target = all.find((c) => c.id === data.placesTo)
        if (!target || removed.has(target.id)) throw new Error('Scegli una categoria che non viene eliminata')
        if (isListType(target.type)) throw new Error('Una lista non ha contenuti propri: scegli una sottocategoria')
        await tx.update(pois).set({ category: target.id }).where(inArray(pois.category, removedIds))
      } else {
        await tx.delete(pois).where(inArray(pois.category, removedIds))
      }

      // Deepest first: a category can't go while its subcategories point to it.
      const deepestFirst = categoryTree(all)
        .filter((c) => removed.has(c.id))
        .sort((a, b) => b.depth - a.depth)
      for (const c of deepestFirst) await tx.delete(categories).where(eq(categories.id, c.id))
    })
  })
