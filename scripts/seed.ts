/**
 * Loads src/db/seed-data.ts: the categories of each section and their subcategories that don't
 * exist yet, and the places whose address isn't taken. Run with `npm run db:seed`: running it again
 * adds nothing twice, and never changes what is already there.
 */
import { max } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { categories, pois } from '../src/db/schema.ts'
import { seedCategories, seedPois } from '../src/db/seed-data.ts'

import type { SeedCategory } from '../src/db/seed-data.ts'

const db = drizzle(process.env.DATABASE_URL!)

/** "Chiese e luoghi sacri" → "chiese-e-luoghi-sacri". */
const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Colours that sit well on the tourist map, as in the admin's category form. */
const COLORS = ['#e5775d', '#2f6e60', '#d39a2c', '#4a6f99', '#5f8f4e', '#8a5a9e', '#8b6b4a', '#c0507a', '#33423e']

// Categories: an existing one with the same address, or the same name in the same place, is kept as it is.
const existing = await db
  .select({ id: categories.id, slug: categories.slug, label: categories.label, section: categories.section, parentId: categories.parentId, color: categories.color })
  .from(categories)
const [{ last }] = await db.select({ last: max(categories.sortOrder) }).from(categories)
let sortOrder = last ?? 0
const added: string[] = []

/** Creates the category unless it exists, then its subcategories; returns its id. */
async function addCategory(seed: SeedCategory, place: { section: string | null; parentId: string | null; color?: string }, path: string) {
  const slug = slugify(seed.label)
  const label = seed.label.toLowerCase()
  const found = existing.find(
    (c) =>
      c.id === slug ||
      c.slug === slug ||
      (c.parentId === place.parentId && (place.parentId || c.section === place.section) && c.label.toLowerCase() === label),
  )
  const type = seed.type ?? 'list'
  let id = found?.id
  let color = found?.color
  if (!found) {
    color = place.color ?? COLORS[added.length % COLORS.length]
    await db.insert(categories).values({
      id: slug,
      slug,
      label: seed.label,
      adminLabel: seed.label,
      singular: seed.singular ?? (type === 'list' ? 'categoria' : 'luogo'),
      color,
      type,
      // Only top-level categories carry a section: subcategories follow their parent's.
      section: place.parentId ? null : place.section,
      parentId: place.parentId,
      sortOrder: ++sortOrder,
    })
    existing.push({ id: slug, slug, label: seed.label, section: place.section, parentId: place.parentId, color })
    added.push(`${path}${seed.label}`)
    id = slug
  }
  // Subcategories take the colour of their parent, as in the admin.
  for (const child of seed.children ?? []) await addCategory(child, { section: null, parentId: id!, color }, `${path}${seed.label}/`)
}

for (const [section, list] of Object.entries(seedCategories)) {
  for (const seed of list) await addCategory(typeof seed === 'string' ? { label: seed } : seed, { section, parentId: null }, `${section}/`)
}
console.log(added.length ? `Added ${added.length} categories: ${added.join(', ')}.` : 'Categories: nothing to add.')

// Places: those whose address is free, after the ones already on the map.
const current = await db.select({ id: pois.id, category: pois.category }).from(pois)
const missing = seedPois.filter((poi) => !current.some((p) => p.id === poi.id))
const [{ lastPlace }] = await db.select({ lastPlace: max(pois.sortOrder) }).from(pois)
if (missing.length) await db.insert(pois).values(missing.map((poi, i) => ({ ...poi, sortOrder: (lastPlace ?? 0) + i + 1 })))
console.log(missing.length ? `Added ${missing.length} places: ${missing.map((p) => p.id).join(', ')}.` : 'Places: nothing to add.')

// Places already there are left alone: list those whose category differs from the seed, to move in the admin.
const moved = seedPois.flatMap((poi) => {
  const found = current.find((p) => p.id === poi.id)
  return found && found.category !== poi.category ? [`${poi.id} (${found.category} → ${poi.category})`] : []
})
if (moved.length) console.log(`Already there in another category, left as they are: ${moved.join(', ')}.`)
await db.$client.end()
