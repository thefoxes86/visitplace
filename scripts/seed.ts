/**
 * Loads src/db/seed-data.ts: the categories of each section that don't exist yet, and the
 * initial places into an empty `pois` table. Run with `npm run db:seed`: running it again adds nothing twice.
 */
import { count, max } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { categories, pois } from '../src/db/schema.ts'
import { seedCategories, seedPois } from '../src/db/seed-data.ts'

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

// Categories: skip any whose address is taken, or with the same name in the same section.
const existing = await db.select({ id: categories.id, slug: categories.slug, label: categories.label, section: categories.section }).from(categories)
const [{ last }] = await db.select({ last: max(categories.sortOrder) }).from(categories)
let sortOrder = last ?? 0
const added: string[] = []
for (const [section, labels] of Object.entries(seedCategories)) {
  for (const label of labels) {
    const slug = slugify(label)
    const taken = existing.some(
      (c) => c.id === slug || c.slug === slug || (c.section === section && c.label.toLowerCase() === label.toLowerCase()),
    )
    if (taken) continue
    await db.insert(categories).values({
      id: slug,
      slug,
      label,
      adminLabel: label,
      singular: 'categoria',
      color: COLORS[added.length % COLORS.length],
      type: 'list',
      section,
      sortOrder: ++sortOrder,
    })
    added.push(`${section}/${label}`)
  }
}
console.log(added.length ? `Added ${added.length} categories: ${added.join(', ')}.` : 'Categories: nothing to add.')

// Places: only into an empty table.
const [{ total }] = await db.select({ total: count() }).from(pois)
if (total > 0) {
  console.log(`The pois table already has ${total} rows: nothing to do.`)
} else {
  await db.insert(pois).values(seedPois.map((poi, i) => ({ ...poi, sortOrder: i + 1 })))
  console.log(`Added ${seedPois.length} places.`)
}
await db.$client.end()
