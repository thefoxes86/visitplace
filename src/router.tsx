import { Link, createRouter as createTanStackRouter } from '@tanstack/react-router'

import type { ErrorComponentProps } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './integrations/tanstack-query/root-provider'

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorPage,
    // Page changes fade the old page out and the new one in, carrying the
    // skyline over (see styles.css). Same-page changes (hash, search) and the
    // admin don't.
    defaultViewTransition: {
      types: ({ pathChanged, toLocation }) =>
        pathChanged && !toLocation.pathname.startsWith('/admin') ? ['page'] : false,
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}

function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper p-8 text-center font-sans text-ink">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase text-coral">Pagina non trovata</h1>
        <Link to="/" className="mt-4 inline-block font-serif italic text-teal underline">
          Torna alla home
        </Link>
      </div>
    </main>
  )
}

function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper p-8 text-center font-sans text-ink">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase text-coral">Qualcosa è andato storto</h1>
        <p className="mt-2 text-sm font-light">{error instanceof Error ? error.message : String(error)}</p>
        <button type="button" onClick={reset} className="mt-4 font-serif italic text-teal underline">
          Riprova
        </button>
      </div>
    </main>
  )
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
