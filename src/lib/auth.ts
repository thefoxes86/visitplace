import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { ac, roles } from '#/lib/permissions'

/**
 * Addresses of this Vercel deployment: every preview has its own URL (and one for
 * its git branch), so the admin login works there without setting BETTER_AUTH_URL.
 */
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`)

/** Server-only: import it from server functions and API routes. */
export const auth = betterAuth({
  // Production sets BETTER_AUTH_URL to the public domain; previews use their own URL.
  baseURL: process.env.BETTER_AUTH_URL || vercelOrigins[0],
  trustedOrigins: vercelOrigins,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    // Users are created by an admin in /admin/utenti.
    disableSignUp: true,
    minPasswordLength: 8,
  },
  plugins: [
    admin({ ac, roles, adminRoles: ['admin'], defaultRole: 'editor' }),
    // Must stay last: sets the cookies of auth calls made from server functions.
    tanstackStartCookies(),
  ],
})
