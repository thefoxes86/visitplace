import { createFileRoute } from '@tanstack/react-router'

import { createEvent, listEvents, unauthorized } from '#/server/events-api'

/** Events sent by `npm run event:add`: see src/server/events-api.ts. */
export const Route = createFileRoute('/api/events')({
  server: {
    handlers: {
      GET: async ({ request }) => unauthorized(request) ?? listEvents(),
      POST: async ({ request }) => unauthorized(request) ?? createEvent(request),
    },
  },
})
