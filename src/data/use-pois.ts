import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { listPublicPois } from '#/server/pois'

/** Published places; loaded by the root route, so always ready in pages. */
export const poisQuery = queryOptions({
  queryKey: ['pois'],
  queryFn: () => listPublicPois(),
  staleTime: 60_000,
})

export const usePois = () => useSuspenseQuery(poisQuery).data
