import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { LocationPicker } from '#/components/admin/LocationPicker'
import { Alert, Card, Field, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { useCategories } from '#/data/categories'
import { poiImage } from '#/data/pois'
import { scopriTopics } from '#/data/scopri'
import { categoryType } from '#/lib/category-types'
import { poiInputFor, slugify } from '#/lib/poi-input'
import { createPoi, updatePoi } from '#/server/pois'

import type { AdminPoi } from '#/components/admin/queries'
import type { Contact, DetailField, DetailValues } from '#/lib/category-types'

interface PoiFormProps {
  /** Id in the `categories` table. */
  category: string
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

/** Form values of the type's own fields: text for inputs, booleans for toggles. */
type DetailInputs = Record<string, string | boolean>

const initialDetails = (fields: DetailField[], details: DetailValues = {}): DetailInputs =>
  Object.fromEntries(
    fields.map((field) => {
      const value = details[field.key]
      return [field.key, field.kind === 'boolean' ? value === true : value === undefined ? '' : String(value)]
    }),
  )

/** Form values → `pois.details`: empty fields and unticked toggles are left out. */
function toDetails(fields: DetailField[], inputs: DetailInputs): DetailValues {
  const details: DetailValues = {}
  for (const field of fields) {
    const value = inputs[field.key]
    if (field.kind === 'boolean') {
      if (value === true) details[field.key] = true
      continue
    }
    const text = String(value ?? '').trim()
    if (!text) continue
    details[field.key] = field.kind === 'number' ? Number(text.replace(',', '.')) : text
  }
  return details
}

const CONTACT_FIELDS: Record<Contact, { label: string; type: string; placeholder?: string; wide?: boolean }> = {
  address: { label: 'Indirizzo', type: 'text', placeholder: 'Via, numero civico', wide: true },
  phone: { label: 'Telefono', type: 'tel' },
  email: { label: 'Email', type: 'email' },
  website: { label: 'Sito web', type: 'url', placeholder: 'https://', wide: true },
}

export function PoiForm({ category: categoryId, poi, areas }: PoiFormProps) {
  const category = useCategories().categoryOf(categoryId)
  const type = categoryType(category.type)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [values, setValues] = useState(() => initialValues(poi))
  const [details, setDetails] = useState(() => initialDetails(type.fields, poi?.details))
  /** The address follows the name until it is edited by hand (new places only). */
  const [idTouched, setIdTouched] = useState(Boolean(poi))
  /** By field: `name`, `startsAt`, `details.difficulty`… */
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /** Editing a field clears its error, and the summary above the form. */
  const clearError = (...keys: string[]) => {
    setFormError(null)
    setErrors((prev) => (keys.some((key) => key in prev) ? Object.fromEntries(Object.entries(prev).filter(([key]) => !keys.includes(key))) : prev))
  }
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    clearError(key)
  }
  const setDetail = (key: string, value: string | boolean) => {
    setDetails((prev) => ({ ...prev, [key]: value }))
    clearError(`details.${key}`)
  }
  const setPosition = useCallback((lat: number, lon: number) => {
    setValues((prev) => ({ ...prev, lat, lon }))
    clearError('lat', 'lon')
  }, [])

  const text = (key: Exclude<keyof Values, 'lat' | 'lon' | 'featured' | 'published' | 'sortOrder'>) => ({
    id: key,
    value: values[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value),
    className: inputClass,
    'aria-invalid': Boolean(errors[key]),
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    // The type's schema clears what the type doesn't use (dates, contacts…).
    const parsed = poiInputFor(type).safeParse({
      ...values,
      category: categoryId,
      lat: values.lat ?? undefined,
      lon: values.lon ?? undefined,
      topic: orNull(values.topic),
      imageUrl: orNull(values.imageUrl),
      address: orNull(values.address),
      phone: orNull(values.phone),
      email: orNull(values.email),
      website: orNull(values.website),
      startsAt: fromLocalInput(values.startsAt),
      endsAt: fromLocalInput(values.endsAt),
      details: toDetails(type.fields, details),
    })
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] === 'details' ? `details.${String(issue.path[1])}` : String(issue.path[0])
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

        {type.dates && (
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

        {type.fields.length > 0 && (
          <Card title={`Dettagli · ${type.label}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {type.fields.map((field) => (
                <DetailInput
                  key={field.key}
                  field={field}
                  value={details[field.key]}
                  error={errors[`details.${field.key}`]}
                  onChange={(value) => setDetail(field.key, value)}
                />
              ))}
            </div>
          </Card>
        )}

        {type.contacts.length > 0 && (
          <Card title="Contatti">
            <div className="grid gap-4 sm:grid-cols-2">
              {type.contacts.map((key) => {
                const contact = CONTACT_FIELDS[key]
                return (
                  <Field key={key} label={contact.label} htmlFor={key} error={errors[key]} className={contact.wide ? 'sm:col-span-2' : ''}>
                    <input {...text(key)} type={contact.type} placeholder={contact.placeholder} />
                  </Field>
                )
              })}
            </div>
          </Card>
        )}
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

        {type.topic && (
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

/** An input for one of the type's own fields. */
function DetailInput({
  field,
  value,
  error,
  onChange,
}: {
  field: DetailField
  value: string | boolean | undefined
  error?: string
  onChange: (value: string | boolean) => void
}) {
  const id = `detail-${field.key}`
  if (field.kind === 'boolean') {
    return (
      <div className="flex items-end sm:col-span-2">
        <Toggle label={field.label} hint={field.hint ?? ''} checked={value === true} onChange={onChange} />
      </div>
    )
  }
  const common = {
    id,
    value: typeof value === 'string' ? value : '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(e.target.value),
    className: inputClass,
    'aria-invalid': Boolean(error),
  }
  const label = `${field.label}${field.unit ? ` (${field.unit})` : ''}${field.required ? ' *' : ''}`
  return (
    <Field label={label} htmlFor={id} hint={field.hint} error={error} className={field.kind === 'textarea' || field.kind === 'url' ? 'sm:col-span-2' : ''}>
      {field.kind === 'textarea' ? (
        <textarea {...common} rows={3} />
      ) : field.kind === 'select' ? (
        <select {...common}>
          <option value="">{field.required ? 'Scegli…' : '—'}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.kind === 'number' ? (
        <input {...common} type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step ?? 'any'} />
      ) : (
        <input {...common} type={field.kind === 'url' ? 'url' : 'text'} placeholder={field.kind === 'url' ? 'https://' : undefined} />
      )}
    </Field>
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
