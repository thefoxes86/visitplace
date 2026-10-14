/**
 * Loads the initial places of src/db/seed-data.ts into an empty `pois` table.
 * Run with `npm run db:seed`; does nothing once the table has contents.
 */
import { count } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { pois } from '../src/db/schema.ts'
import { seedPois } from '../src/db/seed-data.ts'

const db = drizzle(process.env.DATABASE_URL!)

const [{ total }] = await db.select({ total: count() }).from(pois)
if (total > 0) {
  console.log(`The pois table already has ${total} rows: nothing to do.`)
} else {
  await db.insert(pois).values(seedPois.map((poi, i) => ({ ...poi, sortOrder: i + 1 })))
  console.log(`Added ${seedPois.length} places.`)
}
await db.$client.end()
