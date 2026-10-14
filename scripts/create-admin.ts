/**
 * Creates the first backoffice admin, who can then add the other users in /admin/utenti.
 * Run with `npm run db:create-admin -- <email> <password> [name]`.
 */
import { randomUUID } from 'node:crypto'

import { hashPassword } from 'better-auth/crypto'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import { account, user } from '../src/db/schema.ts'

const [email, password, name = 'Amministratore'] = process.argv.slice(2)
if (!email || !password || password.length < 8) {
  console.error('Usage: npm run db:create-admin -- <email> <password (8+ characters)> [name]')
  process.exit(1)
}

const db = drizzle(process.env.DATABASE_URL!)

const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email.toLowerCase()))
if (existing) {
  await db.update(user).set({ role: 'admin' }).where(eq(user.id, existing.id))
  console.log(`${email} already exists: it is now an admin.`)
} else {
  // Same rows Better Auth writes for an email + password user.
  const id = randomUUID()
  await db.insert(user).values({ id, name, email: email.toLowerCase(), emailVerified: true, role: 'admin' })
  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: 'credential',
    userId: id,
    password: await hashPassword(password),
  })
  console.log(`Created admin ${email}.`)
}
await db.$client.end()
