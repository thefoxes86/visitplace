import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import { requireEditor } from '#/server/session'

/** Backoffice users, for admins. Changes go through the auth client's admin API. */
export const listUsers = createServerFn({ method: 'GET' })
  .middleware([requireEditor])
  .handler(async ({ context }) => {
    if (context.user.role !== 'admin') throw new Error('Solo gli amministratori gestiscono gli utenti')
    const { users } = await auth.api.listUsers({
      query: { limit: 500, sortBy: 'createdAt', sortDirection: 'asc' },
      headers: getRequestHeaders(),
    })
    return users.map(({ id, name, email, role }) => ({ id, name, email, role: role ?? null }))
  })
