import { queryOptions } from '@tanstack/react-query'

import { adminListCategories } from '#/server/categories'
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

/** Categories with their order and number of places (admins only). */
export const adminCategoriesQuery = queryOptions({
  queryKey: ['admin', 'categories'],
  queryFn: () => adminListCategories(),
})

export type AdminCategory = Awaited<ReturnType<typeof adminListCategories>>[number]
