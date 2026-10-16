import { createMiddleware, createServerFn } from '@tanstack/react-start'

import { currentUser } from '#/server/current-user'

export type { SessionUser } from '#/server/current-user'

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
