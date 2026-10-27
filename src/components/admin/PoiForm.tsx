import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { LocationPicker } from '#/components/admin/LocationPicker'
import { GalleryEditor, TrackEditor, uploadPhoto } from '#/components/admin/MediaEditors'
import { Alert, Card, Field, Toggle, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { categoryTree, useCategories } from '#/data/categories'
import { poiImage } from '#/data/pois'
import { categoryType } from '#/lib/category-types'
import { RECURRENCES, RECURRENCE_IDS, formatRecurrence } from '#/lib/event-dates'
import { poiInputFor, slugify } from '#/lib/poi-input'
import { createPoi, updatePoi } from '#/server/pois'

import type { AdminPoi } from '#/components/admin/queries'
import type { Contact, DetailField, DetailValues } from '#/lib/category-types'
import type { RecurrenceId } from '#/lib/event-dates'
import type { GalleryPhoto, Track } from '#/lib/media'

interface PoiFormProps {
  /** Id in the `categories` table. */
  category: string
  /** The place being edited; left out to create a new one. */
  poi?: AdminPoi
  /** Areas already in use, offered as suggestions. */
  areas: string[]
}

type Values = Record<
  | 'id'
  | 'name'
  | 'summary'
  | 'description'
  | 'area'
  | 'imageUrl'
  | 'address'
  | 'phone'
  | 'email'
  | 'website'
  | 'startsAt'
  | 'endsAt'
  | 'recurrence'
  | 'recurrenceUntil',
  string
> & { lat: number | null; lon: number | null; featured: boolean; published: boolean; allDay: boolean; sortOrder: number }

/** Date ⇄ value of a datetime-local input (or a date input, with `dateOnly`), in the editor's time zone. */
const toLocalInput = (date: Date | null, dateOnly = false) =>
  date ? new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, dateOnly ? 10 : 16) : ''
/** A date alone is taken at midnight. */
const fromLocalInput = (value: string) => (value ? new Date(value.length === 10 ? `${value}T00:00` : value) : null)

const initialValues = (poi: AdminPoi | undefined): Values => ({
  id: poi?.id ?? '',
  name: poi?.name ?? '',
  summary: poi?.summary ?? '',
  description: poi?.description ?? '',
  area: poi?.area ?? '',
  imageUrl: poi?.imageUrl ?? '',
  address: poi?.address ?? '',
  phone: poi?.phone ?? '',
  email: poi?.email ?? '',
  website: poi?.website ?? '',
  startsAt: toLocalInput(poi?.startsAt ?? null, poi?.allDay),
  endsAt: toLocalInput(poi?.endsAt ?? null, poi?.allDay),
  allDay: poi?.allDay ?? false,
  recurrence: poi?.recurrence ?? '',
  recurrenceUntil: toLocalInput(poi?.recurrenceUntil ?? null, true),
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

export function PoiForm({ category: initialCategory, poi, areas }: PoiFormProps) {
  const { categories, categoryOf } = useCategories()
  const [categoryId, setCategoryId] = useState(initialCategory)
  const category = categoryOf(categoryId)
  const type = categoryType(category.type)
  // The place can move to any category of the same type, which has the same fields.
  const categoryOptions = categoryTree(categories).filter((c) => c.type === category.type || c.id === categoryId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [values, setValues] = useState(() => initialValues(poi))
  const [details, setDetails] = useState(() => initialDetails(type.fields, poi?.details))
  const [gallery, setGallery] = useState<GalleryPhoto[]>(() => poi?.gallery ?? [])
  const [track, setTrack] = useState<Track | null>(() => poi?.track ?? null)
  const [imageUploading, setImageUploading] = useState(false)
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

  /** All-day events take dates alone: the times are dropped, or set back to midnight. */
  const setAllDay = (allDay: boolean) => {
    const convert = (value: string) => (!value ? '' : allDay ? value.slice(0, 10) : `${value.slice(0, 10)}T00:00`)
    setValues((prev) => ({ ...prev, allDay, startsAt: convert(prev.startsAt), endsAt: convert(prev.endsAt) }))
    clearError('startsAt', 'endsAt')
  }

  const text = (key: Exclude<keyof Values, 'lat' | 'lon' | 'featured' | 'published' | 'allDay' | 'sortOrder'>) => ({
    id: key,
    value: values[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value),
    className: inputClass,
    'aria-invalid': Boolean(errors[key]),
  })

  const recurrenceLabel = formatRecurrence({
    startsAt: fromLocalInput(values.startsAt),
    endsAt: null,
    allDay: values.allDay,
    recurrence: (values.recurrence || null) as RecurrenceId | null,
    recurrenceUntil: fromLocalInput(values.recurrenceUntil),
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
      imageUrl: orNull(values.imageUrl),
      address: orNull(values.address),
      phone: orNull(values.phone),
      email: orNull(values.email),
      website: orNull(values.website),
      startsAt: fromLocalInput(values.startsAt),
      endsAt: fromLocalInput(values.endsAt),
      recurrence: values.recurrence || null,
      recurrenceUntil: fromLocalInput(values.recurrenceUntil),
      gallery: gallery.map((photo) => ({ ...photo, caption: photo.caption.trim() })),
      track,
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
            <Toggle
              label="Tutto il giorno"
              hint="Solo le date, senza orari: l'evento occupa i giorni interi."
              checked={values.allDay}
              onChange={setAllDay}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Inizio" htmlFor="startsAt" error={errors.startsAt} hint={values.recurrence ? 'La prima volta.' : undefined}>
                <input {...text('startsAt')} type={values.allDay ? 'date' : 'datetime-local'} />
              </Field>
              <Field
                label="Fine"
                htmlFor="endsAt"
                error={errors.endsAt}
                hint={values.recurrence ? 'Facoltativa · fine della prima volta: ogni ripetizione dura uguale.' : 'Facoltativa'}
              >
                <input {...text('endsAt')} type={values.allDay ? 'date' : 'datetime-local'} min={values.startsAt || undefined} />
              </Field>
              <Field label="Ripetizione" htmlFor="recurrence" error={errors.recurrence}>
                <select {...text('recurrence')}>
                  <option value="">Non si ripete</option>
                  {RECURRENCE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {RECURRENCES[id]}
                    </option>
                  ))}
                </select>
              </Field>
              {values.recurrence && (
                <Field label="Ripeti fino al" htmlFor="recurrenceUntil" error={errors.recurrenceUntil} hint="Facoltativa · vuota si ripete sempre.">
                  <input {...text('recurrenceUntil')} type="date" min={values.startsAt.slice(0, 10) || undefined} />
                </Field>
              )}
            </div>
            {recurrenceLabel && <p className="mt-4 rounded-md bg-mint-light px-3 py-2 text-xs font-semibold text-teal">{recurrenceLabel}</p>}
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

        <GalleryEditor poiId={values.id} photos={gallery} onChange={setGallery} error={errors.gallery} />

        <TrackEditor
          track={track}
          onChange={(next) => {
            setTrack(next)
            clearError('track')
          }}
          onUseStart={setPosition}
          error={errors.track}
        />

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
        {categoryOptions.length > 1 && (
          <Card title="Categoria">
            <Field label="Categoria" htmlFor="category" hint="Tra le categorie dello stesso tipo, con gli stessi campi.">
              <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {'\u00a0\u00a0'.repeat(c.depth)}
                    {c.depth > 0 ? '└ ' : ''}
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </Card>
        )}

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

        <Card title="Immagine">
          <Field label="Indirizzo dell'immagine" htmlFor="imageUrl" error={errors.imageUrl} hint="Incolla un indirizzo o carica una foto. Senza immagine si usa una foto di prova.">
            <input {...text('imageUrl')} type="url" placeholder="https://" />
          </Field>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            id="image-file"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              setImageUploading(true)
              try {
                set('imageUrl', await uploadPhoto(file, values.id))
              } catch (error) {
                setErrors((prev) => ({ ...prev, imageUrl: errorMessage(error) }))
              } finally {
                setImageUploading(false)
              }
            }}
          />
          <label htmlFor="image-file" className={`${buttonClass.secondary} mt-3 cursor-pointer ${imageUploading ? 'pointer-events-none opacity-50' : ''}`}>
            {imageUploading ? 'Caricamento…' : 'Carica una foto'}
          </label>
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

