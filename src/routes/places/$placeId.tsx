import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { categoryColors, categoryLabels, getPlace, places } from '#/data/places'

export const Route = createFileRoute('/places/$placeId')({
  loader: ({ params }) => {
    const place = getPlace(params.placeId)
    if (!place) throw notFound()
    return place
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Visit Camaiore` : 'Visit Camaiore' }],
  }),
  component: PlacePage,
  notFoundComponent: () => (
    <div className="grid min-h-dvh place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold">Place not found</h1>
        <Link to="/" className="mt-4 inline-block font-semibold underline">
          Back to the map
        </Link>
      </div>
    </div>
  ),
})

function PlacePage() {
  const place = Route.useLoaderData()
  const color = categoryColors[place.category]
  const others = places.filter((p) => p.id !== place.id)

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <section
        className="px-6 pb-16 pt-8 text-white sm:px-12"
        style={{ background: `linear-gradient(135deg, ${color}, #1e293b)` }}
      >
        <Link
          to="/"
          search={{ place: place.id }}
          className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold backdrop-blur hover:bg-white/30"
        >
          ← Back to the map
        </Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-widest opacity-80">
          {categoryLabels[place.category]}
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">{place.name}</h1>
        <p className="mt-3 max-w-2xl text-lg opacity-90">{place.summary}</p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-lg leading-relaxed text-slate-700">{place.description}</p>

        <h2 className="mt-12 text-sm font-semibold uppercase tracking-widest text-slate-500">
          More to explore
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {others.map((p) => (
            <li key={p.id}>
              <Link
                to="/places/$placeId"
                params={{ placeId: p.id }}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: categoryColors[p.category] }}
                />
                <span>
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-sm text-slate-500">{p.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
