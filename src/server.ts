import '../instrument.server.mjs'
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

export default createServerEntry(
  wrapFetchWithSentry({
    async fetch(request: Request) {
      const response = await handler.fetch(request)
      // The maintenance page only renders while maintenance is on (else it redirects): it answers 503,
      // so search engines come back later instead of indexing it. The router sets 200 on every page it renders.
      if (response.status === 200 && new URL(request.url).pathname === '/manutenzione') {
        return new Response(response.body, { status: 503, statusText: 'Service Unavailable', headers: response.headers })
      }
      return response
    },
  }),
)
