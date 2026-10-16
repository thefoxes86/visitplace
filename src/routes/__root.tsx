import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { SiteMenu } from '../components/SiteMenu'

import { categoriesQuery } from '#/data/categories'
import { siteStatusQuery } from '#/data/site-status'
import { poisQuery } from '#/data/use-pois'
import { DEFAULT_DESCRIPTION, SITE_NAME } from '#/lib/seo'
import { getLocale } from '#/paraglide/runtime'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context, location }) => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
    // Maintenance mode: visitors who aren't signed in only see the maintenance page.
    // The admin stays reachable, or nobody could sign in to switch it off.
    if (location.pathname.startsWith('/admin') || location.pathname === '/manutenzione') return
    const status = await context.queryClient.fetchQuery(siteStatusQuery)
    if (status.maintenance && !status.signedIn) throw redirect({ to: '/manutenzione' })
  },
  // Every page shows places or categories (the menu lists them all): load them once here.
  // Not on the maintenance page, which must not hand the site's contents to visitors.
  loader: ({ context, location }) =>
    location.pathname !== '/manutenzione' &&
    Promise.all([
      context.queryClient.ensureQueryData(poisQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]),

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { name: 'theme-color', content: '#2a9d8f' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'it_IT' },
      // Pages add their own title, description, canonical and Open Graph tags with seo().
      { title: SITE_NAME },
      { name: 'description', content: DEFAULT_DESCRIPTION },
    ],
    links: [
      { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;800&family=Playfair+Display:ital@1&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const inSite = !pathname.startsWith('/admin') && pathname !== '/manutenzione'
  return (
    <>
      {inSite && <SiteMenu />}
      {inSite && <MaintenanceBanner />}
      <Outlet />
    </>
  )
}

/** Reminds signed-in users that only they can see the site while it is in maintenance. */
function MaintenanceBanner() {
  const { data } = useQuery(siteStatusQuery)
  if (!data?.maintenance || !data.signedIn) return null
  return (
    <p className="fixed inset-x-0 bottom-0 z-40 flex flex-wrap items-center justify-center gap-x-3 bg-coral-dark px-4 py-2 text-center text-xs font-semibold text-white">
      Modalità manutenzione attiva: il sito è visibile solo agli utenti del backoffice.
      <Link to="/admin/impostazioni" className="underline underline-offset-2">
        Impostazioni
      </Link>
    </p>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
