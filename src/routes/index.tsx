import { Suspense, lazy, useEffect } from 'react'
import { ClientOnly, Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { categoryColors, categoryLabels, getPlace, places } from '#/data/places'

// three.js needs WebGL, so the scene is loaded and rendered in the browser only.
const CityCanvas = lazy(() => import('#/components/city-map/CityCanvas'))

export const Route = createFileRoute('/')({
  validateSearch: z.object({ place: z.string().optional() }),
  component: Home,
})

function Home() {
  const { place: selectedId } = Route.useSearch()
  const navigate = Route.useNavigate()
  const selected = selectedId ? getPlace(selectedId) : undefined

  const select = (id?: string) =>
    navigate({ search: id ? { place: id } : {}, replace: true })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void navigate({ search: {}, replace: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#bde0fe] text-slate-900">
      <div className="absolute inset-0 isolate">
        <ClientOnly fallback={<MapLoading />}>
          <Suspense fallback={<MapLoading />}>
            <CityCanvas selectedId={selected?.id} onSelect={select} />
          </Suspense>
        </ClientOnly>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 sm:p-6">
        <div className="pointer-events-auto inline-block max-w-sm rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur">
          <h1 className="text-2xl font-bold tracking-tight">Visit Camaiore</h1>
          <p className="mt-1 text-sm text-slate-600">
            From the Apuan hills to the sea. Tap a marker to explore.
          </p>
        </div>
      </header>

      <nav
        aria-label="Places"
        className="absolute inset-x-0 bottom-0 z-20 flex gap-2 overflow-x-auto p-4 sm:inset-x-auto sm:bottom-auto sm:left-6 sm:top-36 sm:w-64 sm:flex-col sm:overflow-visible sm:p-0"
      >
        {places.map((place) => (
          <button
            key={place.id}
            type="button"
            onClick={() => select(place.id)}
            aria-pressed={place.id === selected?.id}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium shadow backdrop-blur transition ${
              place.id === selected?.id
                ? 'bg-slate-900 text-white'
                : 'bg-white/80 hover:bg-white'
            }`}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColors[place.category] }}
            />
            {place.name}
          </button>
        ))}
      </nav>

      {selected && (
        <aside
          key={selected.id}
          className="absolute inset-x-4 bottom-20 z-30 rounded-2xl bg-white/90 p-5 shadow-xl backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96"
        >
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: categoryColors[selected.category] }}
          >
            {categoryLabels[selected.category]}
          </span>
          <h2 className="mt-2 text-xl font-bold">{selected.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{selected.summary}</p>
          <div className="mt-4 flex gap-2">
            <Link
              to="/places/$placeId"
              params={{ placeId: selected.id }}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700"
            >
              Enter
            </Link>
            <button
              type="button"
              onClick={() => select()}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Back to map
            </button>
          </div>
        </aside>
      )}
    </main>
  )
}

function MapLoading() {
  return (
    <div className="grid h-full place-items-center text-sm font-medium text-slate-600">
      Loading map…
    </div>
  )
}
