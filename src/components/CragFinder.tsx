import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'

import { useCategories } from '#/data/categories'
import { usePois } from '#/data/use-pois'
import { gradeValue } from '#/lib/outdoor'

import type { Category } from '#/data/categories'
import type { Poi } from '#/data/pois'

/** The compass points of the crags' exposure, as the admin offers them. */
const EXPOSURES = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const

const EXPOSURE_NAMES: Record<string, string> = {
  N: 'Nord',
  NE: 'Nord-est',
  E: 'Est',
  SE: 'Sud-est',
  S: 'Sud',
  SO: 'Sud-ovest',
  O: 'Ovest',
  NO: 'Nord-ovest',
}

/** French grades from 4a to 8c+, for the "from" and "to" lists. */
const GRADE_STEPS = [4, 5, 6, 7, 8].flatMap((n) => ['a', 'b', 'c'].flatMap((l) => [`${n}${l}`, `${n}${l}+`]))

interface Crag {
  poi: Poi
  exposure: string | null
  rain: boolean
  family: boolean
  gradeMin: string | null
  gradeMax: string | null
  min: number | null
  max: number | null
  routes: number | null
  height: number | null
  approach: number | null
  rock: string | null
}

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null)
const number = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null)

function toCrag(poi: Poi): Crag {
  const d = poi.details
  const gradeMin = text(d.gradeMin)
  const gradeMax = text(d.gradeMax)
  const min = gradeValue(gradeMin)
  const max = gradeValue(gradeMax)
  return {
    poi,
    exposure: text(d.exposure),
    rain: d.rain === true,
    family: d.family === true,
    gradeMin,
    gradeMax,
    // A crag with one grade only climbs at that grade.
    min: min ?? max,
    max: max ?? min,
    routes: number(d.routes),
    height: number(d.height),
    approach: number(d.approach),
    rock: text(d.rock),
  }
}

interface Filters {
  exposures: string[]
  rain: boolean
  /** Grades as in GRADE_STEPS, or '' for no bound. */
  from: string
  to: string
}

const NO_FILTERS: Filters = { exposures: [], rain: false, from: '', to: '' }

function matches(crag: Crag, f: Filters) {
  if (f.exposures.length && (!crag.exposure || !f.exposures.includes(crag.exposure))) return false
  if (f.rain && !crag.rain) return false
  if (f.from || f.to) {
    // The crag must have routes somewhere in the chosen range; unknown grades leave it out.
    if (crag.min === null || crag.max === null) return false
    if (f.from && crag.max < gradeValue(f.from)!) return false
    if (f.to && crag.min > gradeValue(f.to)!) return false
  }
  return true
}

const chip = (on: boolean) =>
  `rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition ${on ? 'bg-teal text-white ring-teal' : 'ring-ink/20 hover:ring-teal'}`

const selectClass = 'rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-teal focus:ring-2 focus:ring-mint'

/** The crags of a climbing category, with filters for exposure, rain and grade, as cards two to a row. */
export function CragFinder({ category }: { category: Category }) {
  const { subtree } = useCategories()
  const pois = usePois()
  const crags = useMemo(() => {
    const ids = subtree(category.id)
    return pois
      .filter((poi) => ids.has(poi.category))
      .map(toCrag)
      .sort((a, b) => a.poi.name.localeCompare(b.poi.name, 'it'))
  }, [pois, category.id, subtree])
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const shown = crags.filter((crag) => matches(crag, filters))
  const active = filters.exposures.length > 0 || filters.rain || Boolean(filters.from || filters.to)
  // Only the compass points some crag faces.
  const exposures = EXPOSURES.filter((e) => crags.some((c) => c.exposure === e))

  const set = (patch: Partial<Filters>) => setFilters((prev) => ({ ...prev, ...patch }))
  const toggleExposure = (e: string) =>
    set({ exposures: filters.exposures.includes(e) ? filters.exposures.filter((x) => x !== e) : [...filters.exposures, e] })

  if (!crags.length) {
    return (
      <p className="relative mt-4 border-2 border-coral px-5 py-6 font-serif italic text-coral">
        Stiamo raccogliendo le falesie: torna presto.
      </p>
    )
  }

  return (
    <>
      <section aria-label="Filtra le falesie" className="border-l-[6px] border-mint bg-mint-light/50 px-5 py-5 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_auto_minmax(0,1fr)] lg:items-start">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-teal">Esposizione</legend>
            <div className="flex flex-wrap gap-1.5">
              {exposures.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-pressed={filters.exposures.includes(e)}
                  title={EXPOSURE_NAMES[e]}
                  onClick={() => toggleExposure(e)}
                  className={`${chip(filters.exposures.includes(e))} min-w-11`}
                >
                  {e}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-teal">Meteo</legend>
            <button type="button" aria-pressed={filters.rain} onClick={() => set({ rain: !filters.rain })} className={chip(filters.rain)}>
              ☂ Con la pioggia
            </button>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-teal">Gradi</legend>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label className="sr-only" htmlFor="grade-from">
                Grado da
              </label>
              <select id="grade-from" value={filters.from} onChange={(e) => set({ from: e.target.value })} className={selectClass}>
                <option value="">da …</option>
                {GRADE_STEPS.map((g) => (
                  <option key={g} value={g} disabled={Boolean(filters.to) && gradeValue(g)! > gradeValue(filters.to)!}>
                    {g}
                  </option>
                ))}
              </select>
              <span aria-hidden>–</span>
              <label className="sr-only" htmlFor="grade-to">
                Grado fino a
              </label>
              <select id="grade-to" value={filters.to} onChange={(e) => set({ to: e.target.value })} className={selectClass}>
                <option value="">a …</option>
                {GRADE_STEPS.map((g) => (
                  <option key={g} value={g} disabled={Boolean(filters.from) && gradeValue(g)! < gradeValue(filters.from)!}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" aria-live="polite">
          <span className="font-semibold text-teal">
            {shown.length === crags.length ? `${crags.length} falesie` : `${shown.length} falesie su ${crags.length}`}
          </span>
          {active && (
            <button type="button" onClick={() => setFilters(NO_FILTERS)} className="font-serif italic text-coral hover:underline">
              Togli i filtri
            </button>
          )}
        </p>
      </section>

      {shown.length ? (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {shown.map((crag) => (
            <CragCard key={crag.poi.id} crag={crag} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 border-2 border-dashed border-coral/50 px-5 py-6 font-serif italic text-coral">
          Nessuna falesia con questi filtri: prova ad allargare i gradi o a togliere un'esposizione.
        </p>
      )}
    </>
  )
}

function CragCard({ crag }: { crag: Crag }) {
  const { poi } = crag
  const grades =
    crag.gradeMin && crag.gradeMax && crag.gradeMin !== crag.gradeMax ? `${crag.gradeMin} – ${crag.gradeMax}` : (crag.gradeMin ?? crag.gradeMax)
  const facts = [
    crag.routes !== null && `${crag.routes} vie`,
    crag.height !== null && `parete ${crag.height} m`,
    crag.approach !== null && `avvicinamento ${crag.approach} min`,
    crag.rock,
  ].filter(Boolean)

  return (
    <li>
      <Link
        to="/luoghi/$poiId"
        params={{ poiId: poi.id }}
        className="group flex h-full flex-col border-t-[3px] border-teal bg-white p-5 shadow-sm ring-1 ring-ink/5 transition hover:border-coral hover:shadow-md"
      >
        <span className="flex items-start justify-between gap-4">
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-ink/70">{poi.area}</span>
            <span className="mt-1 block font-display text-xl font-semibold leading-tight text-teal transition-colors group-hover:text-coral">
              {poi.name}
            </span>
          </span>
          {grades && (
            <span className="shrink-0 text-right">
              <span className="block font-display text-2xl font-light leading-none text-coral">{grades}</span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/60">gradi</span>
            </span>
          )}
        </span>

        {poi.summary && <span className="mt-3 block font-serif italic text-coral">{poi.summary}</span>}

        <span className="mt-4 flex flex-wrap gap-1.5">
          {crag.exposure && (
            <span className="rounded-sm bg-mint-light px-2 py-1 text-xs font-semibold text-teal" title="Esposizione">
              ◐ {EXPOSURE_NAMES[crag.exposure] ?? crag.exposure}
            </span>
          )}
          {crag.rain && <span className="rounded-sm bg-mint-light px-2 py-1 text-xs font-semibold text-teal">☂ Anche con la pioggia</span>}
          {crag.family && <span className="rounded-sm bg-mint-light px-2 py-1 text-xs font-semibold text-teal">Per famiglie</span>}
        </span>

        {facts.length > 0 && <span className="mt-3 block text-sm font-normal text-ink/80">{facts.join(' · ')}</span>}

        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-teal">
          Scopri di più
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </Link>
    </li>
  )
}
