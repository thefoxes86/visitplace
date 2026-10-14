import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { ac, roles } from '#/lib/permissions'

/** Server-only: import it from server functions and API routes. */
export const auth = betterAuth({
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
