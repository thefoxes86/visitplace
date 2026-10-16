import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, redirect, useParams, useRouter } from '@tanstack/react-router'

import { Skyline } from '#/components/Skyline'
import { AllCategories, sectionOf, useCategories } from '#/data/categories'
import { sections } from '#/data/sections'
import { authClient } from '#/lib/auth-client'
import { ROLES } from '#/lib/permissions'
import { getSessionUser } from '#/server/session'

// Every admin page but the login: signed-in admins and editors only.
export const Route = createFileRoute('/admin/_panel')({
  beforeLoad: async ({ location }) => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login', search: { redirect: location.href } })
    return { user }
  },
  head: () => ({ meta: [{ title: 'Backoffice · Visit Camaiore' }, { name: 'robots', content: 'noindex' }] }),
  // The admin shows hidden categories too.
  component: () => (
    <AllCategories>
      <AdminLayout />
    </AllCategories>
  ),
})

const navLink =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white'
const activeNavLink = { className: 'bg-white/15 text-white' }

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const { categories } = useCategories()
  // A section stays highlighted on the pages of its categories too.
  const params = useParams({ strict: false })
  const currentSection =
    params.section ?? (params.category ? sectionOf(categories, categories.find((c) => c.slug === params.category)?.id ?? '') : null)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  async function signOut() {
    await authClient.signOut()
    queryClient.removeQueries({ queryKey: ['admin'] })
    await queryClient.invalidateQueries({ queryKey: ['site-status'] })
    await router.invalidate()
    router.navigate({ to: '/admin/login' })
  }

  const close = () => setOpen(false)

  return (
    <div className="min-h-dvh bg-paper font-sans text-ink lg:flex">
      <aside className="bg-teal text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link to="/admin" onClick={close} className="flex items-end gap-3">
            <Skyline animate={false} className="w-14 shrink-0 text-mint" />
            <span className="pb-0.5">
              <span className="block font-display text-sm font-extrabold uppercase leading-none tracking-wide">Camaiore</span>
              <span className="block font-serif text-xs italic text-mint">Backoffice</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="admin-nav"
            className="rounded-md px-3 py-1.5 text-sm font-semibold ring-1 ring-white/30 lg:hidden"
          >
            {open ? 'Chiudi' : 'Menu'}
          </button>
        </div>

        <nav id="admin-nav" className={`${open ? 'block' : 'hidden'} px-3 pb-4 lg:block lg:flex-1 lg:overflow-y-auto`}>
          <Link to="/admin" activeOptions={{ exact: true }} activeProps={activeNavLink} onClick={close} className={navLink}>
            <span aria-hidden className="grid size-5 place-items-center">◎</span>
            Panoramica
          </Link>
          {/* The sections of the site: their categories are listed inside */}
          <p className="mt-5 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">Sezioni</p>
          {sections.map((section) => (
            <Link
              key={section.id}
              to="/admin/sezione/$section"
              params={{ section: section.id }}
              onClick={close}
              className={`${navLink} ${section.id === currentSection ? activeNavLink.className : ''}`}
            >
              <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: section.color }} />
              {section.title}
            </Link>
          ))}
          {user.role === 'admin' && (
            <>
              <p className="mt-5 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">Amministrazione</p>
              <Link to="/admin/categorie" activeProps={activeNavLink} onClick={close} className={navLink}>
                <span aria-hidden className="grid size-5 place-items-center">▦</span>
                Categorie
              </Link>
              <Link to="/admin/utenti" activeProps={activeNavLink} onClick={close} className={navLink}>
                <span aria-hidden className="grid size-5 place-items-center">☺</span>
                Utenti
              </Link>
              <Link to="/admin/impostazioni" activeProps={activeNavLink} onClick={close} className={navLink}>
                <span aria-hidden className="grid size-5 place-items-center">⚙</span>
                Impostazioni
              </Link>
            </>
          )}
          <div className="mt-6 border-t border-white/15 px-3 pt-4 lg:hidden">
            <UserBox name={user.name} role={user.role} onSignOut={signOut} />
          </div>
        </nav>

        <div className="hidden border-t border-white/15 px-5 py-4 lg:block">
          <UserBox name={user.name} role={user.role} onSignOut={signOut} />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function UserBox({ name, role, onSignOut }: { name: string; role: string; onSignOut: () => void }) {
  return (
    <div className="text-sm">
      <p className="font-semibold">{name}</p>
      <p className="text-xs text-mint">{ROLES.find((r) => r.id === role)?.label}</p>
      <div className="mt-3 flex gap-3 text-xs font-semibold">
        <Link to="/" className="underline-offset-2 hover:underline">
          Vai al sito
        </Link>
        <button type="button" onClick={onSignOut} className="underline-offset-2 hover:underline">
          Esci
        </button>
      </div>
    </div>
  )
}
