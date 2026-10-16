import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import { Skyline } from '#/components/Skyline'
import { siteStatusQuery } from '#/data/site-status'
import { SITE_NAME } from '#/lib/seo'

// Shown to visitors who aren't signed in while maintenance mode is on (see __root.tsx); answers 503 (see server.ts).
export const Route = createFileRoute('/manutenzione')({
  beforeLoad: async ({ context }) => {
    const status = await context.queryClient.fetchQuery(siteStatusQuery)
    // Nothing to wait for: back to the site.
    if (!status.maintenance || status.signedIn) throw redirect({ to: '/' })
    return { message: status.message }
  },
  head: () => ({
    meta: [{ title: `Sito in manutenzione · ${SITE_NAME}` }, { name: 'robots', content: 'noindex' }],
  }),
  component: MaintenancePage,
})

function MaintenancePage() {
  const { message } = Route.useRouteContext()

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 py-16 font-sans text-ink">
      <div className="w-full max-w-2xl">
        {/* Skyline + title, standing on one baseline, as on the home page */}
        <header className="flex flex-col-reverse items-start gap-4 border-b-[3px] border-teal sm:flex-row sm:items-end sm:gap-8">
          <Skyline className="w-32 shrink-0 text-teal sm:w-40" />
          <div className="sm:pb-3">
            <p className="font-serif text-lg italic text-coral">{SITE_NAME}</p>
            <h1 className="font-display text-[clamp(2.25rem,8vw,4rem)] font-extrabold uppercase leading-[0.95] tracking-wide text-coral">
              Lavori in corso
            </h1>
          </div>
        </header>
        <p className="mt-8 text-lg font-light leading-relaxed">{message}</p>
        <p className="mt-10 flex flex-wrap justify-between gap-2 text-xs italic text-ink/70">
          <span>Camaiore · Versilia, Toscana</span>
          <Link to="/admin/login" className="hover:text-coral hover:underline">
            Accesso riservato
          </Link>
        </p>
      </div>
    </main>
  )
}
