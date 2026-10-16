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

/**
 * The signed-in backoffice user, read from the request's cookies.
 * Import it only inside server function handlers and middleware: those are stripped from the
 * client build, and this import with them, so the database driver never reaches the browser.
 */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session || !isRole(session.user.role) || session.user.banned) return null
  const { id, name, email, role } = session.user
  return { id, name, email, role }
}
