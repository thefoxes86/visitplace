import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import { isRole } from '#/lib/permissions'

import type { Role } from '#/lib/permissions'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

async function currentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session || !isRole(session.user.role) || session.user.banned) return null
  const { id, name, email, role } = session.user
  return { id, name, email, role }
}

/** The signed-in backoffice user, or null. */
export const getSessionUser = createServerFn({ method: 'GET' }).handler(currentUser)

/** Server functions behind it need a signed-in admin or editor. */
export const requireEditor = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await currentUser()
  if (!user) throw new Error('Accesso non autorizzato')
  return next({ context: { user } })
})

/** Server functions behind it need a signed-in admin. */
export const requireAdmin = createMiddleware({ type: 'function' })
  .middleware([requireEditor])
  .server(({ context, next }) => {
    if (context.user.role !== 'admin') throw new Error('Solo gli amministratori possono farlo')
    return next()
  })
