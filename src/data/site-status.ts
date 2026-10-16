import { queryOptions } from '@tanstack/react-query'

import { getSiteStatus } from '#/server/settings'

/** Maintenance mode and whether the visitor is signed in: checked by the root route on every page. */
export const siteStatusQuery = queryOptions({
  queryKey: ['site-status'],
  queryFn: () => getSiteStatus(),
  staleTime: 30_000,
})
