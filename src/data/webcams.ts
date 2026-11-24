import { queryOptions } from '@tanstack/react-query'

import { listPublicWebcams } from '#/server/settings'

/** The published webcams of the Info page. */
export const webcamsQuery = queryOptions({
  queryKey: ['webcams'],
  queryFn: () => listPublicWebcams(),
  staleTime: 5 * 60_000,
})

export type PublicWebcam = Awaited<ReturnType<typeof listPublicWebcams>>[number]
