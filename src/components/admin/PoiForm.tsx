import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { LocationPicker } from '#/components/admin/LocationPicker'
import { Alert, Card, Field, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { poiCategory, poiImage } from '#/data/pois'
import { scopriTopics } from '#/data/scopri'
import { poiInput, slugify } from '#/lib/poi-input'
import { createPoi, updatePoi } from '#/server/pois'

import type { AdminPoi } from '#/components/admin/queries'
import type { PoiCategory } from '#/data/pois'
import type { PoiInput } from '#/lib/poi-input'

interface PoiFormProps {
  category: PoiCategory
  /** The place being edited; left out to create a new one. */
  poi?: AdminPoi
  /** Areas already in use, offered as suggestions. */
  areas: string[]
}

type Values = Record<
  'id' | 'name' | 'summary' | 'description' | 'area' | 'topic' | 'imageUrl' | 'address' | 'phone' | 'email' | 'website' | 'startsAt' | 'endsAt',
  string
> & { lat: number | null; lon: number | null; featured: boolean; published: boolean; sortOrder: number }

/** Date ⇄ value of a datetime-local input, in the editor's time zone. */
const toLocalInput = (date: Date | null) =>
  date ? new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : ''
const fromLocalInput = (value: string) => (value ? new Date(value) : null)

const initialValues = (poi: AdminPoi | undefined): Values => ({
  id: poi?.id ?? '',
  name: poi?.name ?? '',
  summary: poi?.summary ?? '',
  description: poi?.description ?? '',
  area: poi?.area ?? '',
  topic: poi?.topic ?? '',
  imageUrl: poi?.imageUrl ?? '',
  address: poi?.address ?? '',
  phone: poi?.phone ?? '',
  email: poi?.email ?? '',
  website: poi?.website ?? '',
  startsAt: toLocalInput(poi?.startsAt ?? null),
  endsAt: toLocalInput(poi?.endsAt ?? null),
  lat: poi?.lat ?? null,
  lon: poi?.lon ?? null,
  featured: poi?.featured ?? false,
  published: poi?.published ?? true,
  sortOrder: poi?.sortOrder ?? 0,
})

const orNull = (value: string) => value.trim() || null

export function PoiForm({ category: categoryId, poi, areas }: PoiFormProps) {
  const category = poiCategory(categoryId)
  const isEvent = categoryId === 'events'
  const isCulture = categoryId === 'culture'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [values, setValues] = useState(() => initialValues(poi))
  /** The address follows the name until it is edited by hand (new places only). */
  const [idTouched, setIdTouched] = useState(Boolean(poi))
  const [errors, setErrors] = useState<Partial<Record<keyof PoiInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /** Editing a field clears its error. */
  const clearError = (...keys: string[]) =>
    setErrors((prev) => (keys.some((key) => key in prev) ? Object.fromEntries(Object.entries(prev).filter(([key]) => !keys.includes(key))) : prev))
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    clearError(key)
  }
  const setPosition = useCallback((lat: number, lon: number) => {
    setValues((prev) => ({ ...prev, lat, lon }))
    clearError('lat', 'lon')
  }, [])

  const text = (key: keyof Values & keyof PoiInput) => ({
    id: key,
    value: values[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value),
    className: inputClass,
    'aria-invalid': Boolean(errors[key]),
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = poiInput.safeParse({
      ...values,
      category: categoryId,
      lat: values.lat ?? undefined,
      lon: values.lon ?? undefined,
      topic: isCulture ? orNull(values.topic) : null,
      imageUrl: orNull(values.imageUrl),
      address: orNull(values.address),
      phone: orNull(values.phone),
      email: orNull(values.email),
      website: orNull(values.website),
      startsAt: isEvent ? fromLocalInput(values.startsAt) : null,
      endsAt: isEvent ? fromLocalInput(values.endsAt) : null,
    })
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof PoiInput
        fieldErrors[key] ??= issue.message
      }
      setErrors(fieldErrors)
      setFormError('Controlla i campi evidenziati.')
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await (poi ? updatePoi : createPoi)({ data: parsed.data })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] }),
        queryClient.invalidateQueries({ queryKey: ['pois'] }),
      ])
      navigate({ to: '/admin/$category', params: { category: category.slug } })
    } catch (error) {
      setFormError(errorMessage(error))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        {formError && <Alert>{formError}</Alert>}

        <Card title="Contenuto">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="name" error={errors.name} className="sm:col-span-2">
              <input
                {...text('name')}
                onChange={(e) => {
                  set('name', e.target.value)
                  if (!idTouched) set('id', slugify(e.target.value))
                }}
                autoFocus={!poi}
              />
            </Field>
            <Field
              label="Indirizzo della pagina"
              htmlFor="id"
              error={errors.id}
              hint={poi ? "Non si può cambiare dopo la creazione." : `visitcamaiore.it/luoghi/${values.id || '…'}`}
              className="sm:col-span-2"
            >
              <input
                {...text('id')}
                disabled={Boolean(poi)}
                onChange={(e) => {
                  setIdTouched(true)
                  set('id', slugify(e.target.value))
                }}
              />
            </Field>
            <Field
              label="Sommario"
              htmlFor="summary"
              error={errors.summary}
              hint={`Una frase per elenchi e mappa · ${values.summary.length}/160`}
              className="sm:col-span-2"
            >
              <input {...text('summary')} maxLength={160} />
            </Field>
            <Field label="Descrizione" htmlFor="description" error={errors.description} className="sm:col-span-2">
              <textarea {...text('description')} rows={7} />
            </Field>
          </div>
        </Card>

        {isEvent && (
          <Card title="Date">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Inizio" htmlFor="startsAt" error={errors.startsAt}>
                <input {...text('startsAt')} type="datetime-local" />
              </Field>
              <Field label="Fine" htmlFor="endsAt" error={errors.endsAt} hint="Facoltativa">
                <input {...text('endsAt')} type="datetime-local" min={values.startsAt || undefined} />
              </Field>
            </div>
          </Card>
        )}

        <Card title="Posizione">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="h-72">
              <LocationPicker lat={values.lat} lon={values.lon} onChange={setPosition} />
            </div>
            <div className="space-y-4">
              <Field label="Zona" htmlFor="area" error={errors.area} hint="Es. Centro storico, Lido di Camaiore">
                <input {...text('area')} list="areas" />
                <datalist id="areas">
                  {areas.map((area) => (
                    <option key={area} value={area} />
                  ))}
                </datalist>
              </Field>
              {(['lat', 'lon'] as const).map((key) => (
                <Field key={key} label={key === 'lat' ? 'Latitudine' : 'Longitudine'} htmlFor={key} error={errors[key]}>
                  <input
                    id={key}
                    type="number"
                    step="any"
                    value={values[key] ?? ''}
                    onChange={(e) => set(key, e.target.value === '' ? null : Number(e.target.value))}
                    className={inputClass}
                    aria-invalid={Boolean(errors[key])}
                  />
                </Field>
              ))}
              <p className="text-xs font-light text-ink/70">Trascina la mappa per mettere il segnaposto sul luogo.</p>
            </div>
          </div>
        </Card>

        <Card title="Contatti">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Indirizzo" htmlFor="address" error={errors.address} className="sm:col-span-2">
              <input {...text('address')} placeholder="Via, numero civico" />
            </Field>
            {!isEvent && (
              <>
                <Field label="Telefono" htmlFor="phone" error={errors.phone}>
                  <input {...text('phone')} type="tel" />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <input {...text('email')} type="email" />
                </Field>
              </>
            )}
            <Field label="Sito web" htmlFor="website" error={errors.website} className="sm:col-span-2">
              <input {...text('website')} type="url" placeholder="https://" />
            </Field>
          </div>
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card title="Pubblicazione">
          <div className="space-y-3">
            <Toggle
              label="Pubblicato"
              hint="Se spento, resta visibile solo nel backoffice."
              checked={values.published}
              onChange={(v) => set('published', v)}
            />
            <Toggle
              label="In evidenza"
              hint="Tra le principali attrazioni della home."
              checked={values.featured}
              onChange={(v) => set('featured', v)}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={buttonClass.primary}>
              {saving ? 'Salvataggio…' : poi ? 'Salva modifiche' : `Crea ${category.singular}`}
            </button>
            <Link to="/admin/$category" params={{ category: category.slug }} className={buttonClass.secondary}>
              Annulla
            </Link>
          </div>
        </Card>

        {isCulture && (
          <Card title="Sezione di Scopri">
            <Field label="Sezione" htmlFor="topic" hint="Dove compare il luogo nella pagina Scopri.">
              <select {...text('topic')}>
                <option value="">Nessuna</option>
                {scopriTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </Field>
          </Card>
        )}

        <Card title="Immagine">
          <Field label="Indirizzo dell'immagine" htmlFor="imageUrl" error={errors.imageUrl} hint="Senza immagine si usa una foto di prova.">
            <input {...text('imageUrl')} type="url" placeholder="https://" />
          </Field>
          <img
            src={poiImage({ id: values.id || 'nuovo', imageUrl: orNull(values.imageUrl) }, 600)}
            alt=""
            className="mt-4 aspect-[4/3] w-full rounded-md object-cover"
          />
        </Card>
      </div>
    </form>
  )
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-ink/20 transition peer-checked:bg-teal peer-focus-visible:ring-2 peer-focus-visible:ring-mint after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4"
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs font-light text-ink/70">{hint}</span>
      </span>
    </label>
  )
}
