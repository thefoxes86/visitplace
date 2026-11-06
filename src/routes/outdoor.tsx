import { useMemo, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { OutdoorMap } from '#/components/OutdoorMap'
import { TypeIcon } from '#/components/tourist-map/CategoryIcon'
import { itinerariesQuery } from '#/data/itineraries'
import { outdoorTracksQuery, useItineraryRoute, useOutdoorItems } from '#/data/outdoor'
import { ITINERARY_MODES, ITINERARY_MODE_IDS } from '#/lib/itineraries'
import { GRADES, LENGTHS, NO_FILTERS, OUTDOOR_KINDS, OUTDOOR_KIND_IDS, activeFilters, matches } from '#/lib/outdoor'
import { breadcrumbs, seo } from '#/lib/seo'

import type { ReactNode } from 'react'
import type { OutdoorFilters, OutdoorItem, OutdoorKind } from '#/lib/outdoor'

export const Route = createFileRoute('/outdoor')({
  /** ?itinerario=<id> opens the map on that itinerary, its route drawn. */
  validateSearch: (search: Record<string, unknown>): { itinerario?: string } =>
    typeof search.itinerario === 'string' ? { itinerario: search.itinerario } : {},
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(itinerariesQuery), context.queryClient.ensureQueryData(outdoorTracksQuery)]),
  head: () =>
    seo({
      title: 'Mappa outdoor',
      description:
        'Trekking, falesie e itinerari di Camaiore su una mappa, con i filtri: adatti alle famiglie, quando piove, per lunghezza, mezzo, difficoltà e grado.',
      path: '/outdoor',
      jsonLd: breadcrumbs([['Mappa outdoor', '/outdoor']]),
    }),
  component: OutdoorPage,
})

const ICON: Record<OutdoorKind, string> = { trekking: 'trekking', climbing: 'climbing', itinerary: 'list' }

function OutdoorPage() {
  const items = useOutdoorItems()
  const { data: tracks } = useSuspenseQuery(outdoorTracksQuery)
  const [filters, setFilters] = useState<OutdoorFilters>(NO_FILTERS)
  const { itinerario } = Route.useSearch()
  const [selected, setSelected] = useState<OutdoorItem | null>(() => items.find((i) => i.kind === 'itinerary' && i.id === itinerario) ?? null)
  const results = useMemo(() => items.filter((item) => matches(item, filters)), [items, filters])
  const route = useItineraryRoute(selected?.kind === 'itinerary' ? selected.id : null)
  const set = <K extends keyof OutdoorFilters>(key: K, value: OutdoorFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setSelected(null)
  }
  const toggleKind = (kind: OutdoorKind) =>
    set('kinds', filters.kinds.includes(kind) ? filters.kinds.filter((k) => k !== kind) : [...filters.kinds, kind])
  const count = activeFilters(filters)

  const filterPanel = (
    <div className="space-y-4">
      {/* What to show */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Cosa mostrare">
        {OUTDOOR_KIND_IDS.map((kind) => {
          const on = filters.kinds.includes(kind)
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={on}
              onClick={() => toggleKind(kind)}
              className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold ring-1 transition ${
                on ? 'bg-mint-light text-teal ring-teal' : 'opacity-50 ring-ink/20'
              }`}
            >
              <span className={`grid size-7 place-items-center rounded-full ${on ? 'bg-teal text-white' : 'bg-ink/20 text-white'}`}>
                <TypeIcon type={ICON[kind]} className="size-4" />
              </span>
              {OUTDOOR_KINDS[kind]}
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        <Check label="Adatto alle famiglie" checked={filters.family} onChange={(v) => set('family', v)} />
        <Check label="Adatto quando piove" hint="falesie" checked={filters.rain} onChange={(v) => set('rain', v)} />
      </div>

      <Select label="Lunghezza" hint="trekking e itinerari" value={filters.length} onChange={(v) => set('length', v as OutdoorFilters['length'])}>
        {Object.entries(LENGTHS).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </Select>
      <Select label="Mezzo" hint="i trekking sono a piedi" value={filters.mode} onChange={(v) => set('mode', v as OutdoorFilters['mode'])}>
        <option value="any">Qualsiasi</option>
        {ITINERARY_MODE_IDS.map((id) => (
          <option key={id} value={id}>
            {ITINERARY_MODES[id]}
          </option>
        ))}
      </Select>
      <Select label="Difficoltà" hint="trekking" value={filters.difficulty} onChange={(v) => set('difficulty', v as OutdoorFilters['difficulty'])}>
        <option value="any">Qualsiasi</option>
        <option value="T">T · turistico</option>
        <option value="E">E · escursionistico</option>
        <option value="EE">EE · per escursionisti esperti</option>
        <option value="EEA">EEA · esperti con attrezzatura</option>
      </Select>
      <Select label="Grado" hint="falesie" value={filters.grade} onChange={(v) => set('grade', v as OutdoorFilters['grade'])}>
        {Object.entries(GRADES).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </Select>

      {(count > 0 || filters.kinds.length < OUTDOOR_KIND_IDS.length) && (
        <button type="button" onClick={() => setFilters(NO_FILTERS)} className="font-serif text-sm italic text-coral hover:underline">
          Azzera i filtri
        </button>
      )}
    </div>
  )

  return (
    <main className="flex h-dvh flex-col bg-paper font-sans text-ink lg:flex-row">
      <aside className="z-10 flex shrink-0 flex-col border-mint bg-paper lg:h-full lg:w-96 lg:border-r-[6px]">
        <div className="px-5 pb-3 pt-5 pr-20 lg:px-6 lg:pt-8">
          <Link to="/mappa" className="font-serif text-sm italic text-coral hover:underline">
            ← Mappa turistica
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-wide text-coral lg:text-4xl">
            Mappa
            <br className="hidden lg:block" /> outdoor
          </h1>
          <p className="mt-3 hidden text-sm font-normal leading-relaxed text-ink/80 lg:block">
            Trekking, falesie e itinerari: scegli quello che fa per te.
          </p>
        </div>

        {/* Filters: open on wide screens, folded on phones */}
        <details className="group border-y border-mint px-5 py-3 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between font-display font-semibold uppercase tracking-[0.12em] text-teal">
            Filtri{count > 0 && ` · ${count}`}
            <span className="text-sm font-normal normal-case tracking-normal text-ink/70">
              {results.length} risultati <span className="inline-block transition-transform group-open:rotate-180">▾</span>
            </span>
          </summary>
          <div className="mt-4 max-h-[50dvh] overflow-y-auto pb-2">{filterPanel}</div>
        </details>
        <div className="hidden min-h-0 flex-1 flex-col lg:flex">
          <h2 className="signpost-right mr-10 bg-mint py-2 pl-6 pr-10 font-display font-semibold uppercase tracking-[0.15em] text-teal">Filtri</h2>
          <div className="px-6 py-4">{filterPanel}</div>

          <h2 className="signpost-right mr-10 bg-mint py-2 pl-6 pr-10 font-display font-semibold uppercase tracking-[0.15em] text-teal">
            Risultati · {results.length}
          </h2>
          <ol className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3">
            {results.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`flex w-full items-start gap-3 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-mint-light ${
                    selected?.key === item.key ? 'bg-mint-light' : ''
                  }`}
                >
                  <span
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center text-white ${item.kind === 'itinerary' ? 'rounded-sm' : 'rounded-full'}`}
                    style={{ backgroundColor: item.color }}
                  >
                    <TypeIcon type={ICON[item.kind]} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-teal">{item.name}</span>
                    {item.facts && <span className="block text-xs font-normal">{item.facts}</span>}
                  </span>
                </button>
              </li>
            ))}
            {!results.length && <li className="px-2 text-sm font-normal italic">Nessun risultato con questi filtri.</li>}
          </ol>
        </div>
      </aside>

      <div className="relative min-h-0 flex-1">
        <OutdoorMap
          items={results}
          selected={selected}
          onSelect={setSelected}
          tracks={tracks}
          route={route}
          frameKey={results.map((r) => r.key).join('|')}
        />

        {selected && (
          <article key={selected.key} className="place-card-rise absolute inset-x-4 bottom-4 mx-auto max-w-md bg-paper shadow-xl ring-1 ring-mint sm:bottom-6">
            <Link
              {...(selected.kind === 'itinerary'
                ? { to: '/itinerari/$id' as const, params: { id: selected.id } }
                : { to: '/luoghi/$poiId' as const, params: { poiId: selected.id } })}
              className="group flex gap-4 p-3 pr-10 outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              {selected.imageOf?.imageUrl && (
                <img
                  src={selected.imageOf.imageUrl}
                  alt=""
                  className="aspect-square w-24 shrink-0 object-cover grayscale transition duration-500 group-hover:grayscale-0 sm:w-28"
                />
              )}
              <span className="min-w-0 py-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: selected.color }}>
                  {OUTDOOR_KINDS[selected.kind]}
                  {selected.family && ' · per famiglie'}
                  {selected.rain && ' · anche con la pioggia'}
                </span>
                <span className="mt-1 block font-display text-lg font-extrabold leading-tight text-teal transition-colors group-hover:text-coral">
                  {selected.name}
                </span>
                {selected.facts && <span className="mt-1 block text-xs font-semibold text-ink/80">{selected.facts}</span>}
                <span className="mt-1 line-clamp-2 block text-sm font-normal leading-snug">{selected.summary}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-coral">
                  Scopri di più
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Chiudi"
              className="absolute right-1 top-1 grid size-8 place-items-center text-xl leading-none text-ink/60 hover:text-coral"
            >
              ×
            </button>
          </article>
        )}
      </div>
    </main>
  )
}

function Check({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-teal" />
      {label}
      {hint && <span className="font-normal text-ink/60">· {hint}</span>}
    </label>
  )
}

function Select({ label, hint, value, onChange, children }: { label: string; hint?: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-teal">
      {label}
      {hint && <span className="font-normal normal-case tracking-normal text-ink/60"> · {hint}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-sm border-0 bg-mint-light/60 px-3 py-2 font-sans text-sm font-normal normal-case tracking-normal text-ink ring-1 ring-mint focus:ring-2 focus:ring-teal"
      >
        {children}
      </select>
    </label>
  )
}
