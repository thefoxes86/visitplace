import { useState } from 'react'
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { Alert, Card, Field, PageHeader, Toggle, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { DEFAULT_MAINTENANCE_MESSAGE, maintenanceSetting } from '#/lib/settings'
import { adminGetSettings, updateMaintenance } from '#/server/settings'

const settingsQuery = queryOptions({
  queryKey: ['admin', 'settings'],
  queryFn: () => adminGetSettings(),
})

// /admin/impostazioni: admins only.
export const Route = createFileRoute('/admin/_panel/impostazioni')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'admin') throw redirect({ to: '/admin' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: SettingsPage,
})

function SettingsPage() {
  const { data } = useSuspenseQuery(settingsQuery)
  const queryClient = useQueryClient()
  const [values, setValues] = useState(data.maintenance)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
    setError(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = maintenanceSetting.safeParse(values)
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    setSaving(true)
    try {
      await updateMaintenance({ data: parsed.data })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] }),
        queryClient.invalidateQueries({ queryKey: ['site-status'] }),
      ])
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Impostazioni" subtitle="Le opzioni del sito" />

      <form onSubmit={submit} noValidate className="mt-6 max-w-2xl space-y-6">
        {error && <Alert>{error}</Alert>}
        {saved && (
          <p role="status" className="rounded-md bg-mint-light px-4 py-3 text-sm font-semibold text-teal">
            Impostazioni salvate.
          </p>
        )}

        <Card title="Modalità manutenzione">
          <Toggle
            label="Sito in manutenzione"
            hint="I visitatori vedono solo la pagina di manutenzione. Chi ha accesso al backoffice, una volta entrato, vede il sito come sempre."
            checked={values.enabled}
            onChange={(enabled) => set('enabled', enabled)}
          />
          {values.enabled !== data.maintenance.enabled && (
            <p className="mt-4 rounded-md bg-coral/10 px-3 py-2 text-xs font-semibold text-coral-dark">
              {values.enabled
                ? 'Al salvataggio il sito non sarà più visibile ai visitatori.'
                : 'Al salvataggio il sito tornerà visibile a tutti.'}
            </p>
          )}
          <Field
            label="Messaggio"
            htmlFor="message"
            hint={`Sulla pagina di manutenzione. Se vuoto: "${DEFAULT_MAINTENANCE_MESSAGE}"`}
            className="mt-6"
          >
            <textarea
              id="message"
              rows={3}
              maxLength={500}
              value={values.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder={DEFAULT_MAINTENANCE_MESSAGE}
              className={inputClass}
            />
          </Field>
          <button type="submit" disabled={saving} className={`${buttonClass.primary} mt-6`}>
            {saving ? 'Salvataggio…' : 'Salva impostazioni'}
          </button>
        </Card>
      </form>
    </>
  )
}
