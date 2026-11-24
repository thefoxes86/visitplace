import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, isNotNull, like, max } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { hiddenIds } from '#/lib/category-tree'
import { poiInput } from '#/lib/poi-input'
import { insertPoi, validateForCategory } from '#/server/poi-store'
import { requireEditor } from '#/server/session'

import type { Poi } from '#/data/pois'
import type { Track } from '#/lib/media'

const byMapOrder = [asc(pois.sortOrder), asc(pois.createdAt), asc(pois.id)]

/** Ids of the categories hidden from the site, with everything below them. */
async function hiddenCategoryIds() {
  return hiddenIds(await db.select({ id: categories.id, parentId: categories.parentId, visible: categories.visible }).from(categories))
}

/** Published places outside hidden categories, those on the map numbered in map order. */
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
  // Only places on the map get a number, so the map counts 1, 2, 3… without gaps.
  let number = 0
  return rows
    .filter((poi) => !hidden.has(poi.category))
    .map(({ published, sortOrder, createdAt, updatedAt, track, ownPhoto, ...poi }) => ({
      ...poi,
      // A hidden category does not list it either.
      extraCategories: poi.extraCategories.filter((id) => !hidden.has(id)),
      hasTrack: track !== null,
      number: poi.showOnMap ? ++number : null,
    }))
})

/** Points kept per track on the outdoor map: enough for the line, light for the page. */
const OVERVIEW_POINTS = 300

/** The GPS tracks of published hikes, thinned out, to draw them all on the outdoor map. */
export const listOutdoorTracks = createServerFn({ method: 'GET' }).handler(async (): Promise<{ id: string; points: [number, number][] }[]> => {
  const [rows, hidden] = await Promise.all([
    db
      .select({ id: pois.id, category: pois.category, track: pois.track })
      .from(pois)
      .innerJoin(categories, eq(categories.id, pois.category))
      .where(and(eq(pois.published, true), eq(categories.type, 'trekking'), isNotNull(pois.track))),
    hiddenCategoryIds(),
  ])
  return rows
    .filter((row) => row.track && !hidden.has(row.category))
    .map(({ id, track }) => {
      const points = track!.points
      const step = Math.max(1, Math.ceil(points.length / OVERVIEW_POINTS))
      const thin = points.filter((_, i) => i % step === 0 || i === points.length - 1)
      return { id, points: thin.map(([lat, lon]): [number, number] => [lat, lon]) }
    })
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

export const createPoi = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(poiInput)
  .handler(({ data }) => insertPoi(data))

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

/**
 * Copies a place into a new draft: same category, texts, details, photos and links,
 * name ending in "(copia)" and its own address (<id>-copia, <id>-copia-2…). Returns the copy's id.
 */
export const duplicatePoi = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const [original] = await db.select().from(pois).where(eq(pois.id, data.id))
    if (!original) throw new Error('Contenuto non trovato')
    const { id, createdAt: _created, updatedAt: _updated, ...fields } = original

    // The first free address among <id>-copia, <id>-copia-2, <id>-copia-3…
    const base = `${id.replace(/-copia(-\d+)?$/, '')}-copia`
    const taken = new Set((await db.select({ id: pois.id }).from(pois).where(like(pois.id, `${base}%`))).map((p) => p.id))
    let copyId = base
    for (let n = 2; taken.has(copyId); n++) copyId = `${base}-${n}`

    const [{ last }] = await db.select({ last: max(pois.sortOrder) }).from(pois)
    await db.insert(pois).values({
      ...fields,
      id: copyId,
      name: `${original.name.replace(/ \(copia\)$/, '')} (copia)`,
      // A draft until it is reviewed, and not among the home page's attractions.
      published: false,
      featured: false,
      sortOrder: (last ?? 0) + 1,
    })
    return { id: copyId }
  })
