import { useState } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { Skyline } from '#/components/Skyline'
import { Alert, Field, buttonClass, inputClass } from '#/components/admin/ui'
import { authClient } from '#/lib/auth-client'
import { getSessionUser } from '#/server/session'

/** Only pages of the admin are valid targets after signing in. */
const safeRedirect = (target: unknown) =>
  typeof target === 'string' && target.startsWith('/admin') && !target.startsWith('/admin/login') ? target : '/admin'

export const Route = createFileRoute('/admin/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  beforeLoad: async ({ search }) => {
    if (await getSessionUser()) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Accedi · Backoffice Visit Camaiore' }, { name: 'robots', content: 'noindex' }] }),
  component: LoginPage,
})

function LoginPage() {
  const search = Route.useSearch()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setLoading(true)
    setError(null)
    const { error } = await authClient.signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    if (error) {
      setError(error.status === 401 ? 'Email o password non corretti.' : (error.message ?? 'Accesso non riuscito.'))
      setLoading(false)
      return
    }
    await router.invalidate()
    router.history.push(safeRedirect(search.redirect))
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4 py-12 font-sans text-ink">
      <div className="w-full max-w-sm">
        <div className="flex items-end gap-4 border-b-[3px] border-teal">
          <Skyline animate={false} className="w-24 shrink-0 text-teal" />
          <div className="pb-2">
            <p className="font-display text-xl font-extrabold uppercase leading-none tracking-wide text-coral">Camaiore</p>
            <p className="font-serif text-sm italic text-coral">Backoffice</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" autoComplete="username" required autoFocus className={inputClass} />
          </Field>
          <Field label="Password" htmlFor="password">
            <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </Field>
          <button type="submit" disabled={loading} className={`${buttonClass.primary} w-full`}>
            {loading ? 'Accesso…' : 'Accedi'}
          </button>
        </form>
      </div>
    </main>
  )
}
