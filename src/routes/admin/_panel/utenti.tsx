import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { usersQuery } from '#/components/admin/queries'
import { Alert, Card, Field, PageHeader, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { authClient } from '#/lib/auth-client'
import { ROLES, isRole } from '#/lib/permissions'

import type { Role } from '#/lib/permissions'

export const Route = createFileRoute('/admin/_panel/utenti')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'admin') throw redirect({ to: '/admin' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery),
  component: UsersPage,
})

/** Better Auth answers with `{ error }` instead of throwing. */
async function call<T>(request: Promise<{ data: T; error: null } | { data: null; error: { message?: string } }>) {
  const { data, error } = await request
  if (error) throw new Error(error.message ?? 'Operazione non riuscita')
  return data
}

function UsersPage() {
  const { user: me } = Route.useRouteContext()
  const { data: users } = useSuspenseQuery(usersQuery)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  /** Runs one change on a user, then reloads the list. */
  async function run(key: string, action: () => Promise<unknown>) {
    setBusy(key)
    setError(null)
    try {
      await action()
      await queryClient.invalidateQueries({ queryKey: usersQuery.queryKey })
      return true
    } catch (e) {
      setError(errorMessage(e))
      return false
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHeader title="Utenti" subtitle="Chi può accedere al backoffice" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          {error && <Alert>{error}</Alert>}
          <div className="relative overflow-x-auto rounded-lg border border-ink/10 bg-white shadow-sm">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-teal">
                <tr>
                  <th className="px-4 py-3 font-semibold">Utente</th>
                  <th className="px-4 py-3 font-semibold">Ruolo</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {users.map((user) => {
                  const isMe = user.id === me.id
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-teal">
                          {user.name}
                          {isMe && <span className="ml-2 text-xs font-light text-ink/70">(tu)</span>}
                        </span>
                        <span className="block text-xs font-light">{user.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Ruolo di ${user.name}`}
                          value={isRole(user.role) ? user.role : ''}
                          // You can't remove your own admin rights.
                          disabled={isMe || busy === `role-${user.id}`}
                          onChange={(e) =>
                            run(`role-${user.id}`, () =>
                              call(authClient.admin.setRole({ userId: user.id, role: e.target.value as Role })),
                            )
                          }
                          className={`${inputClass} w-auto py-1.5`}
                        >
                          {!isRole(user.role) && <option value="">—</option>}
                          {ROLES.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          className="px-3 py-2 text-sm font-semibold text-teal hover:text-coral disabled:opacity-50"
                          disabled={busy === `password-${user.id}`}
                          onClick={() => {
                            const newPassword = prompt(`Nuova password per ${user.name} (almeno 8 caratteri):`)
                            if (newPassword === null) return
                            if (newPassword.length < 8) return setError('La password deve avere almeno 8 caratteri.')
                            run(`password-${user.id}`, () =>
                              call(authClient.admin.setUserPassword({ userId: user.id, newPassword })),
                            ).then((ok) => ok && alert('Password aggiornata.'))
                          }}
                        >
                          Cambia password
                        </button>
                        {!isMe && (
                          <button
                            type="button"
                            className={buttonClass.danger}
                            disabled={busy === `delete-${user.id}`}
                            onClick={() => {
                              if (!confirm(`Eliminare l'utente ${user.name}? Non potrà più accedere.`)) return
                              run(`delete-${user.id}`, () => call(authClient.admin.removeUser({ userId: user.id })))
                            }}
                          >
                            Elimina
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {ROLES.map((role) => (
              <div key={role.id} className="rounded-md bg-mint-light/60 px-4 py-3">
                <dt className="font-semibold text-teal">{role.label}</dt>
                <dd className="text-xs font-light">{role.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <NewUserForm
          busy={busy === 'create'}
          onCreate={(input) => run('create', () => call(authClient.admin.createUser(input)))}
        />
      </div>
    </>
  )
}

interface NewUser {
  name: string
  email: string
  password: string
  role: Role
}

function NewUserForm({ busy, onCreate }: { busy: boolean; onCreate: (user: NewUser) => Promise<boolean> }) {
  const [role, setRole] = useState<Role>('editor')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const ok = await onCreate({
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      password: String(data.get('password')),
      role,
    })
    if (ok) {
      form.reset()
      setRole('editor')
    }
  }

  return (
    <Card title="Nuovo utente" className="self-start">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome" htmlFor="new-name">
          <input id="new-name" name="name" required className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="new-email">
          <input id="new-email" name="email" type="email" required autoComplete="off" className={inputClass} />
        </Field>
        <Field label="Password" htmlFor="new-password" hint="Almeno 8 caratteri: comunicala all'utente.">
          <input id="new-password" name="password" type="text" required minLength={8} autoComplete="new-password" className={inputClass} />
        </Field>
        <fieldset>
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal">Ruolo</legend>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <label key={r.id} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value={r.id}
                  checked={role === r.id}
                  onChange={() => setRole(r.id)}
                  className="mt-1 accent-teal"
                />
                <span>
                  <span className="block font-semibold">{r.label}</span>
                  <span className="block text-xs font-light">{r.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={busy} className={`${buttonClass.primary} w-full`}>
          {busy ? 'Creazione…' : 'Crea utente'}
        </button>
      </form>
    </Card>
  )
}
