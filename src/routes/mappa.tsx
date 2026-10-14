import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { CategoryIcon } from '#/components/tourist-map/CategoryIcon'
import { TouristMap } from '#/components/tourist-map/TouristMap'
import { poiCategories, poiCategory, poiImage, poiNumber } from '#/data/pois'
import { usePois } from '#/data/use-pois'

import type { MapTarget } from '#/components/tourist-map/TouristMap'
import type { Poi, PoiCategory } from '#/data/pois'

export const Route = createFileRoute('/mappa')({
  /** ?luogo=<id> opens the map on that point. */
  validateSearch: (search: Record<string, unknown>): { luogo?: string } =>
    typeof search.luogo === 'string' ? { luogo: search.luogo } : {},
  head: () => ({ meta: [{ title: 'Mappa turistica · Visit Camaiore' }] }),
  component: MapPage,
})

/** Map numbers stay the same whatever the filter, like on a printed map. */
const numberOf = (poi: Poi) => poi.number

function MapPage() {
  const pois = usePois()
  const [active, setActive] = useState<Set<PoiCategory>>(() => new Set(poiCategories.map((c) => c.id)))
  const { luogo } = Route.useSearch()
  const [selected, setSelected] = useState<Poi | null>(() => (luogo && pois.find((p) => p.id === luogo)) || null)
  const [target, setTarget] = useState<MapTarget | null>(() => (selected ? { poi: selected } : null))

  const visible = useMemo(() => pois.filter((poi) => active.has(poi.category)), [active, pois])

  // Frame what is on the map whenever the filter changes (but not over a place opened by link).
  const initialVisible = useRef(visible)
  useEffect(() => {
    if (luogo && visible === initialVisible.current) return
    if (!visible.length) return
    setTarget({ fit: visible })
  }, [visible])

  const toggle = (id: PoiCategory) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
    if (selected?.category === id) setSelected(null)
  }

  const select = (poi: Poi) => {
    setSelected(poi)
    setTarget({ poi })
  }

  return (
    <main className="flex h-dvh flex-col bg-paper font-sans text-ink lg:flex-row">
      <aside className="z-10 flex shrink-0 flex-col border-mint bg-paper lg:h-full lg:w-80 lg:border-r-[6px]">
        <div className="px-5 pb-3 pt-5 pr-20 lg:px-6 lg:pt-8">
          <Link to="/" className="font-serif text-sm italic text-coral hover:underline">
            ← Visit Camaiore
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-wide text-coral lg:text-4xl">
            Mappa
            <br className="hidden lg:block" /> turistica
          </h1>
          <p className="mt-3 hidden text-sm font-light leading-relaxed text-ink/80 lg:block">
            Dal centro storico al Lido: scegli cosa vuoi vedere sulla mappa.
          </p>
        </div>

        <h2 className="signpost-right mr-10 hidden bg-mint py-2 pl-6 pr-10 font-display font-semibold uppercase tracking-[0.15em] text-teal lg:block">
          Categorie
        </h2>

        {/* Category filter: chips on phones, a legend on wide screens */}
        <ul className="flex gap-2 overflow-x-auto px-5 pb-3 lg:flex-col lg:gap-1 lg:px-6 lg:py-4">
          {poiCategories.map((category) => {
            const on = active.has(category.id)
            const count = pois.filter((p) => p.category === category.id).length
            return (
              <li key={category.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(category.id)}
                  className={`group flex w-full items-center gap-3 rounded-full py-1 pl-1 pr-3 text-left ring-1 transition lg:rounded-sm lg:pr-2 lg:ring-0 lg:hover:bg-mint-light ${
                    on ? 'ring-mint' : 'opacity-45 ring-ink/20'
                  }`}
                >
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full text-white transition-colors lg:rounded-sm"
                    style={{ backgroundColor: on ? category.color : '#9aa5a1' }}
                  >
                    <CategoryIcon id={category.id} />
                  </span>
                  <span className="flex-1 whitespace-nowrap text-sm font-semibold">{category.label}</span>
                  <span className="hidden text-xs tabular-nums text-ink/60 lg:block">{count}</span>
                  <span
                    aria-hidden
                    className={`hidden size-4 shrink-0 place-items-center rounded-sm border-2 text-[10px] leading-none lg:grid ${
                      on ? 'border-teal bg-teal text-white' : 'border-ink/30'
                    }`}
                  >
                    {on && '✓'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Numbered index of what is on the map */}
        <div className="hidden min-h-0 flex-1 flex-col lg:flex">
          <h2 className="signpost-right mr-10 bg-mint py-2 pl-6 pr-10 font-display font-semibold uppercase tracking-[0.15em] text-teal">
            Luoghi
          </h2>
          <ol className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-4 py-3">
            {visible.map((poi) => (
              <li key={poi.id}>
                <button
                  type="button"
                  onClick={() => select(poi)}
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm transition-colors hover:bg-mint-light ${
                    selected?.id === poi.id ? 'bg-mint-light font-semibold text-teal' : 'font-light'
                  }`}
                >
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: poiCategory(poi.category).color }}
                  >
                    {String(numberOf(poi)).padStart(2, '0')}
                  </span>
                  {poi.name}
                </button>
              </li>
            ))}
            {!visible.length && <li className="px-2 text-sm font-light italic">Nessuna categoria selezionata.</li>}
          </ol>
        </div>
      </aside>

      <div className="relative min-h-0 flex-1">
        <TouristMap pois={visible} selected={selected} onSelect={select} target={target} numberOf={numberOf} />

        {selected && (
          <article
            key={selected.id}
            className="place-card-rise absolute inset-x-4 bottom-4 mx-auto max-w-md bg-paper shadow-xl ring-1 ring-mint sm:bottom-6"
          >
            <Link
              to="/luoghi/$poiId"
              params={{ poiId: selected.id }}
              className="group flex gap-4 p-3 pr-10 outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <img
                src={poiImage(selected, 300)}
                alt=""
                className="aspect-square w-24 shrink-0 object-cover grayscale transition duration-500 group-hover:grayscale-0 sm:w-28"
              />
              <span className="min-w-0 py-1">
                <span
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]"
                  style={{ color: poiCategory(selected.category).color }}
                >
                  <span className="font-display text-2xl font-light leading-none">{poiNumber(selected)}</span>
                  {poiCategory(selected.category).label}
                </span>
                <span className="mt-1 block font-display text-lg font-extrabold leading-tight text-teal transition-colors group-hover:text-coral">
                  {selected.name}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm font-light leading-snug">{selected.summary}</span>
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
