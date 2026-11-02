import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { adminPoisQuery } from '#/components/admin/queries'
import { Alert, Card, Field, Toggle, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { categoryTree, useCategories } from '#/data/categories'
import { ITINERARY_MODES, ITINERARY_MODE_IDS, MAX_STOPS, itineraryInput } from '#/lib/itineraries'
import { slugify } from '#/lib/poi-input'
import { createItinerary, updateItinerary } from '#/server/itineraries'

import type { Itinerary, ItineraryModeId, ItineraryStop } from '#/lib/itineraries'

/** Creates an itinerary, or edits the one given. */
export function ItineraryForm({ itinerary }: { itinerary?: Itinerary }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: pois } = useSuspenseQuery(adminPoisQuery)
  const { categories } = useCategories()
  const [values, setValues] = useState({
    id: itinerary?.id ?? '',
    title: itinerary?.title ?? '',
    summary: itinerary?.summary ?? '',
    description: itinerary?.description ?? '',
    modes: itinerary?.modes ?? (['walk'] as ItineraryModeId[]),
    duration: itinerary?.duration ?? '',
    season: itinerary?.season ?? '',
    kidFriendly: itinerary?.kidFriendly ?? false,
    petFriendly: itinerary?.petFriendly ?? false,
    published: itinerary?.published ?? true,
    sortOrder: itinerary?.sortOrder ?? 0,
  })
  const [stops, setStops] = useState<ItineraryStop[]>(() => itinerary?.stops ?? [{ poiId: '', note: '' }, { poiId: '', note: '' }])
  const [idTouched, setIdTouched] = useState(Boolean(itinerary))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors(({ [key]: _, ...rest }) => rest)
    setFormError(null)
  }
  const setStop = (i: number, stop: Partial<ItineraryStop>) => {
    setStops((prev) => prev.map((s, j) => (j === i ? { ...s, ...stop } : s)))
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith('stops'))))
  }
  const move = (i: number, by: number) =>
    setStops((prev) => {
      const next = [...prev]
      ;[next[i], next[i + by]] = [next[i + by], next[i]]
      return next
    })

  // Places by category, in menu order, for the stop pickers.
  const groups = categoryTree(categories)
    .map((category) => ({ category, places: pois.filter((p) => p.category === category.id) }))
    .filter((g) => g.places.length > 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = itineraryInput.safeParse({ ...values, id: itinerary?.id ?? values.id, stops: stops.map((s) => ({ ...s, note: s.note.trim() })) })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] === 'stops' && issue.path.length > 1 ? `stops.${String(issue.path[1])}` : String(issue.path[0])
        fieldErrors[key] ??= issue.message
      }
      setErrors(fieldErrors)
      setFormError('Controlla i campi evidenziati.')
      return
    }
    setSaving(true)
    try {
      await (itinerary ? updateItinerary : createItinerary)({ data: parsed.data })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'itineraries'] }),
        queryClient.invalidateQueries({ queryKey: ['itineraries'] }),
      ])
      navigate({ to: '/admin/itinerari' })
    } catch (error) {
      setFormError(errorMessage(error))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        {formError && <Alert>{formError}</Alert>}

        <Card title="Itinerario">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titolo" htmlFor="title" error={errors.title} className="sm:col-span-2">
              <input
                id="title"
                value={values.title}
                onChange={(e) => {
                  set('title', e.target.value)
                  if (!idTouched) set('id', slugify(e.target.value))
                }}
                className={inputClass}
                autoFocus={!itinerary}
              />
            </Field>
            <Field
              label="Indirizzo della pagina"
              htmlFor="id"
              error={errors.id}
              hint={itinerary ? 'Non si può cambiare dopo la creazione.' : `visitcamaiore.it/itinerari/${values.id || '…'}`}
              className="sm:col-span-2"
            >
              <input
                id="id"
                value={values.id}
                disabled={Boolean(itinerary)}
                onChange={(e) => {
                  setIdTouched(true)
                  set('id', slugify(e.target.value))
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Sommario" htmlFor="summary" error={errors.summary} hint={`Una frase per l'elenco · ${values.summary.length}/160`} className="sm:col-span-2">
              <input id="summary" value={values.summary} maxLength={160} onChange={(e) => set('summary', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Descrizione" htmlFor="description" error={errors.description} className="sm:col-span-2">
              <textarea id="description" rows={6} value={values.description} onChange={(e) => set('description', e.target.value)} className={inputClass} />
            </Field>
            <fieldset className="sm:col-span-2">
              <legend className="mb-1 block text-xs font-semibold uppercase tracking-wider text-teal">Mezzi</legend>
              <div className="flex flex-wrap gap-2">
                {ITINERARY_MODE_IDS.map((id) => {
                  const on = values.modes.includes(id)
                  return (
                    <label
                      key={id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                        on ? 'border-teal bg-mint-light/60 text-teal ring-1 ring-teal' : 'border-ink/15 hover:border-teal'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => set('modes', on ? values.modes.filter((m) => m !== id) : [...values.modes, id])}
                        className="size-4 accent-teal"
                      />
                      {ITINERARY_MODES[id]}
                    </label>
                  )
                })}
              </div>
              <p className="mt-1 text-xs font-light text-ink/70">Il percorso in Google Maps usa il mezzo più adatto alle distanze: auto, poi mezzi pubblici, bici, a piedi.</p>
              {errors.modes && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.modes}</p>}
            </fieldset>
            <Field label="Tempi" htmlFor="duration" error={errors.duration} hint="Es. Mezza giornata, 3 ore">
              <input id="duration" value={values.duration} onChange={(e) => set('duration', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Periodo consigliato" htmlFor="season" error={errors.season} hint="Es. Da maggio a ottobre, tutto l'anno">
              <input id="season" value={values.season} maxLength={80} onChange={(e) => set('season', e.target.value)} className={inputClass} />
            </Field>
            <div className="space-y-3 sm:col-span-2">
              <Toggle label="Adatto ai bambini" hint="Percorso facile e tappe adatte anche ai più piccoli." checked={values.kidFriendly} onChange={(v) => set('kidFriendly', v)} />
              <Toggle label="Adatto agli animali" hint="Si può fare con il cane, nei luoghi all'aperto." checked={values.petFriendly} onChange={(v) => set('petFriendly', v)} />
            </div>
          </div>
        </Card>

        <Card title={`Tappe · ${stops.length}`}>
          <p className="text-sm font-light">
            I luoghi nell'ordine del percorso, ognuno con una nota su cosa vedere o fare lì. Senza nota, sul sito compare il sommario del luogo.
          </p>
          <ol className="mt-4 space-y-3">
            {stops.map((stop, i) => (
              <li key={i} className="flex gap-3 rounded-md border border-ink/10 p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coral font-display text-sm font-semibold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="sr-only" htmlFor={`stop-${i}`}>
                    Luogo della tappa {i + 1}
                  </label>
                  <select
                    id={`stop-${i}`}
                    value={stop.poiId}
                    onChange={(e) => setStop(i, { poiId: e.target.value })}
                    className={inputClass}
                    aria-invalid={Boolean(errors[`stops.${i}`])}
                  >
                    <option value="">Scegli un luogo…</option>
                    {groups.map(({ category, places }) => (
                      <optgroup key={category.id} label={category.adminLabel}>
                        {places.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.published ? '' : ' (non pubblicato)'}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor={`stop-note-${i}`}>
                    Nota della tappa {i + 1}
                  </label>
                  <textarea
                    id={`stop-note-${i}`}
                    rows={2}
                    maxLength={500}
                    value={stop.note}
                    placeholder="Cosa vedere o fare qui (facoltativo)"
                    onChange={(e) => setStop(i, { note: e.target.value })}
                    className={inputClass}
                  />
                  {errors[`stops.${i}`] && <p className="text-xs font-semibold text-coral-dark">{errors[`stops.${i}`]}</p>}
                  <div className="flex flex-wrap gap-1">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={buttonClass.secondary} aria-label="Sposta prima">
                      ↑
                    </button>
                    <button type="button" disabled={i === stops.length - 1} onClick={() => move(i, 1)} className={buttonClass.secondary} aria-label="Sposta dopo">
                      ↓
                    </button>
                    <button type="button" onClick={() => setStops((prev) => prev.filter((_, j) => j !== i))} className={buttonClass.danger}>
                      Rimuovi
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            disabled={stops.length >= MAX_STOPS}
            onClick={() => setStops((prev) => [...prev, { poiId: '', note: '' }])}
            className={`${buttonClass.secondary} mt-4`}
          >
            Aggiungi una tappa
          </button>
          {errors.stops && <p className="mt-2 text-xs font-semibold text-coral-dark">{errors.stops}</p>}
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card title="Pubblicazione">
          <Toggle label="Pubblicato" hint="Se spento, resta visibile solo nel backoffice." checked={values.published} onChange={(v) => set('published', v)} />
          <Field label="Ordine" htmlFor="sortOrder" hint="Posizione nell'elenco: prima i numeri più bassi. Lascia 0 per metterlo in fondo." className="mt-4">
            <input id="sortOrder" type="number" min={0} step={1} value={values.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value) || 0)} className={inputClass} />
          </Field>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={buttonClass.primary}>
              {saving ? 'Salvataggio…' : itinerary ? 'Salva modifiche' : 'Crea itinerario'}
            </button>
            <Link to="/admin/itinerari" className={buttonClass.secondary}>
              Annulla
            </Link>
          </div>
          {itinerary?.published && (
            <a href={`/itinerari/${itinerary.id}`} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-teal hover:underline">
              Vedi sul sito ↗
            </a>
          )}
        </Card>
      </div>
    </form>
  )
}
