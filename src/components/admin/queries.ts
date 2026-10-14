import { queryOptions } from '@tanstack/react-query'

import { adminListPois } from '#/server/pois'
import { listUsers } from '#/server/users'

/** Every place, published or not. */
export const adminPoisQuery = queryOptions({
  queryKey: ['admin', 'pois'],
  queryFn: () => adminListPois(),
})

export type AdminPoi = Awaited<ReturnType<typeof adminListPois>>[number]

export const usersQuery = queryOptions({
  queryKey: ['admin', 'users'],
  queryFn: () => listUsers(),
})
