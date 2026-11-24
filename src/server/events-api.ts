import { createHash, timingSafeEqual } from 'node:crypto'

import { and, asc, gte, inArray, isNotNull, or } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { categoryType } from '#/lib/category-types'
import { MONTH_WEEKS, RECURRENCE_IDS, parseWallTime, startOfDay } from '#/lib/event-dates'
import { photoCreditSchema } from '#/lib/media'
import { slugify } from '#/lib/poi-input'
import { absoluteUrl } from '#/lib/seo'
import { freePoiId, insertPoi } from '#/server/poi-store'

/**
 * /api/events, server only. Adds events from outside the backoffice, e.g. `npm run event:add` driven by Claude.
 *
 * - GET: the event categories and the upcoming events, to choose a category and avoid doubles.
 * - POST: a new event, as a draft unless `published` is true. Same checks as the admin form.
 *
 * Both need `Authorization: Bearer <EVENTS_API_TOKEN>`; without that variable the API is off.
 */

/** Centre of Camaiore: where an event without coordinates goes, kept off the map. */
const CENTRE = { lat: 43.9418, lon: 10.3022 }

/** "2026-12-08T21:00" or "2026-12-08", on the clock of Camaiore. */
const wallTime = z.string().transform((value, ctx) => {
  const date = parseWallTime(value.trim())
  if (!date) ctx.addIssue({ code: 'custom', message: 'Usa AAAA-MM-GG o AAAA-MM-GGTHH:MM (ora di Camaiore)' })
  return date ?? new Date(NaN)
})

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || null)

const eventInput = z.object({
  /** Address of the page, /luoghi/<id>: from the name if missing, made unique. */
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo lettere minuscole, numeri e trattini')
    .optional(),
  category: z.string().min(1),
  extraCategories: z.array(z.string().min(1)).max(20).default([]),
  name: z.string().trim().min(1),
  summary: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1),
  area: z.string().trim().min(1),
  startsAt: wallTime,
  endsAt: wallTime.optional(),
  allDay: z.boolean().default(false),
  recurrence: z.enum(RECURRENCE_IDS).optional(),
  recurrenceUntil: wallTime.optional(),
  recurrenceWeeks: z.array(z.number().int().refine((week) => (MONTH_WEEKS as readonly number[]).includes(week))).default([]),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  address: optionalText,
  website: z.url({ protocol: /^https?$/ }).optional(),
  imageUrl: z.url({ protocol: /^https$/ }).optional(),
  imageCredit: photoCreditSchema.optional(),
  organizer: optionalText,
  price: optionalText,
  booking: z.boolean().default(false),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
})

export type EventApiInput = z.input<typeof eventInput>

const SHA = (value: string) => createHash('sha256').update(value).digest()

/** Null when the request carries the token, otherwise the response refusing it. */
export function unauthorized(request: Request) {
  const token = process.env.EVENTS_API_TOKEN
  if (!token || token.length < 32) return Response.json({ error: 'API eventi non attiva: manca EVENTS_API_TOKEN (almeno 32 caratteri).' }, { status: 503 })
  const sent = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1] ?? ''
  // Hashed first, so the comparison takes the same time whatever the length.
  if (!timingSafeEqual(SHA(sent), SHA(token))) return Response.json({ error: 'Token non valido' }, { status: 401 })
  return null
}

/** Categories whose places are events. */
async function eventCategories() {
  const all = await db
    .select({ id: categories.id, slug: categories.slug, label: categories.label, type: categories.type, parentId: categories.parentId })
    .from(categories)
  const labels = new Map(all.map((c) => [c.id, c.label]))
  return all
    .filter((c) => categoryType(c.type).dates)
    .map((c) => ({ id: c.id, slug: c.slug, label: c.label, parent: c.parentId ? (labels.get(c.parentId) ?? null) : null }))
}

export async function listEvents() {
  const cats = await eventCategories()
  const today = startOfDay(new Date())
  const upcoming = cats.length
    ? await db
        .select({ id: pois.id, name: pois.name, category: pois.category, startsAt: pois.startsAt, published: pois.published })
        .from(pois)
        .where(
          and(
            inArray(
              pois.category,
              cats.map((c) => c.id),
            ),
            or(gte(pois.startsAt, today), gte(pois.endsAt, today), isNotNull(pois.recurrence)),
          ),
        )
        .orderBy(asc(pois.startsAt))
    : []
  return Response.json({ categories: cats.map(({ slug: _slug, ...c }) => c), upcoming })
}

export async function createEvent(request: Request) {
  const parsed = eventInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ') }, { status: 400 })
  }
  const event = parsed.data
  const cats = await eventCategories()
  const category = cats.find((c) => c.id === event.category)
  if (!category) {
    return Response.json({ error: `"${event.category}" non è una categoria di eventi. Usa una di: ${cats.map((c) => c.id).join(', ')}` }, { status: 400 })
  }

  const located = event.lat !== undefined && event.lon !== undefined
  const allDay = event.allDay
  try {
    const { id } = await insertPoi({
      id: event.id ?? (await freePoiId(slugify(event.name))),
      category: event.category,
      extraCategories: event.extraCategories,
      name: event.name,
      summary: event.summary,
      description: event.description,
      area: event.area,
      lat: located ? event.lat! : CENTRE.lat,
      lon: located ? event.lon! : CENTRE.lon,
      featured: event.featured,
      showOnMap: located,
      published: event.published,
      imageUrl: event.imageUrl ?? null,
      ownPhoto: false,
      imageCredit: event.imageUrl ? (event.imageCredit ?? null) : null,
      address: event.address,
      phone: null,
      email: null,
      website: event.website ?? null,
      startsAt: allDay ? startOfDay(event.startsAt) : event.startsAt,
      endsAt: event.endsAt ? (allDay ? startOfDay(event.endsAt) : event.endsAt) : null,
      allDay,
      recurrence: event.recurrence ?? null,
      recurrenceUntil: event.recurrenceUntil ?? null,
      recurrenceWeeks: event.recurrenceWeeks,
      gallery: [],
      links: [],
      track: null,
      sortOrder: 0,
      details: {
        ...(event.organizer && { organizer: event.organizer }),
        ...(event.price && { price: event.price }),
        booking: event.booking,
      },
    })
    return Response.json(
      {
        id,
        published: event.published,
        onMap: located,
        page: absoluteUrl(`/luoghi/${id}`),
        edit: absoluteUrl(`/admin/${category.slug}/${id}`),
      },
      { status: 201 },
    )
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Salvataggio non riuscito' }, { status: 400 })
  }
}
