import { Suspense, lazy, useEffect, useState } from 'react'
import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { PlaceCard } from '#/components/PlaceCard'
import { categoryColors, getPlace, places } from '#/data/places'

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
  // The card only opens once the camera has finished flying to the place.
  const [arrivedId, setArrivedId] = useState<string>()

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
            <CityCanvas selectedId={selected?.id} onSelect={select} onArrive={setArrivedId} />
          </Suspense>
        </ClientOnly>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 pr-20 sm:p-6">
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

      {selected && arrivedId === selected.id && (
        <PlaceCard key={selected.id} place={selected} onClose={() => select()} />
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
