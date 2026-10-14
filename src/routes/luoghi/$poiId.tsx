import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import type { ReactNode } from 'react'

import { Skyline } from '#/components/Skyline'
import { CategoryIcon } from '#/components/tourist-map/CategoryIcon'
import { Compass } from '#/components/tourist-map/TouristMap'
import { distanceKm, formatEventDate, poiCategory, poiImage, poiNumber } from '#/data/pois'
import { poisQuery, usePois } from '#/data/use-pois'

import type { Poi } from '#/data/pois'

export const Route = createFileRoute('/luoghi/$poiId')({
  loader: async ({ context, params }) => {
    const poi = (await context.queryClient.ensureQueryData(poisQuery)).find((p) => p.id === params.poiId)
    if (!poi) throw notFound()
    return poi
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} · Visit Camaiore` : 'Visit Camaiore' },
      ...(loaderData ? [{ name: 'description', content: loaderData.summary }] : []),
    ],
  }),
  component: PoiPage,
  notFoundComponent: () => (
    <main className="grid min-h-dvh place-items-center bg-paper p-8 text-center font-sans text-ink">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase text-coral">Luogo non trovato</h1>
        <Link to="/mappa" className="mt-4 inline-block font-serif italic text-teal underline">
          Torna alla mappa
        </Link>
      </div>
    </main>
  ),
})

/** Label and value of each practical info, leaving out what is not set. */
function infoRows(poi: Poi, categoryLabel: string) {
  const rows: [string, ReactNode][] = [['Categoria', categoryLabel]]
  if (poi.startsAt) rows.push(['Quando', formatEventDate(poi.startsAt)])
  if (poi.endsAt) rows.push(['Fino a', formatEventDate(poi.endsAt)])
  rows.push(['Zona', poi.area])
  if (poi.address) rows.push(['Indirizzo', poi.address])
  if (poi.phone) rows.push(['Telefono', <a href={`tel:${poi.phone.replace(/\s/g, '')}`}>{poi.phone}</a>])
  if (poi.email) rows.push(['Email', <a href={`mailto:${poi.email}`}>{poi.email}</a>])
  if (poi.website)
    rows.push([
      'Sito web',
      <a href={poi.website} target="_blank" rel="noreferrer" className="break-all">
        {poi.website.replace(/^https?:\/\/(www\.)?|\/$/g, '')}
      </a>,
    ])
  rows.push(['Coordinate', `${poi.lat.toFixed(4)}° N · ${poi.lon.toFixed(4)}° E`])
  rows.push(['Sulla mappa', `N. ${poiNumber(poi)}`])
  return rows
}

const km = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1).replace('.', ',')} km`)

function PoiPage() {
  const poi = Route.useLoaderData()
  const category = poiCategory(poi.category)
  const nearby = usePois()
    .filter((p) => p.id !== poi.id)
    .map((p) => ({ poi: p, d: distanceKm(poi, p) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lon}`

  return (
    <main className="min-h-dvh bg-paper font-sans text-ink">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-24 sm:px-12">
        <Link
          to="/mappa"
          search={{ luogo: poi.id }}
          className="hero-fade font-serif text-sm italic text-coral hover:underline"
        >
          ← Mappa turistica
        </Link>

        {/* Skyline + title, standing on one baseline, as on the home page */}
        <header className="mt-4 flex flex-col-reverse items-start gap-4 border-b-[3px] border-teal md:flex-row md:items-end md:gap-8">
          <Skyline className="w-28 shrink-0 text-teal md:w-36 lg:w-44" />
          <div className="min-w-0 md:pb-3">
            <p
              className="hero-fade flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: category.color, animationDelay: '300ms' }}
            >
              <span className="grid size-6 place-items-center rounded-sm text-white" style={{ backgroundColor: category.color }}>
                <CategoryIcon id={poi.category} className="size-3.5" />
              </span>
              {category.label} · {poi.area}
            </p>
            <h1
              className="hero-fade mt-2 font-display text-[clamp(2rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.95] tracking-wide text-coral"
              style={{ animationDelay: '450ms' }}
            >
              {poi.name}
            </h1>
            <p
              className="hero-fade mt-2 font-serif text-lg italic text-coral sm:text-xl"
              style={{ animationDelay: '600ms' }}
            >
              {poi.summary}
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-0">
          <div className="hero-fade lg:pr-12" style={{ animationDelay: '750ms' }}>
            {/* Demo image: replace with real photography of each place. */}
            <img src={poiImage(poi, 1200)} alt="" className="aspect-[16/10] w-full object-cover" />

            <div className="mt-8 grid gap-8 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <span className="block self-start border-b-2 border-coral text-right font-display text-7xl font-light leading-none text-coral">
                {poiNumber(poi)}
              </span>
              <p className="text-lg font-light leading-relaxed">{poi.description}</p>
            </div>

            {/* Practical info, framed like the legend of the map */}
            <section className="relative mt-14 border-2 border-coral px-5 pb-5 pt-8">
              <h2 className="absolute -top-4 left-4 bg-paper px-2 font-display text-2xl font-semibold uppercase tracking-[0.15em] text-coral">
                Informazioni
              </h2>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {infoRows(poi, category.label).map(([label, value], i) => (
                  <div key={label} className="flex items-center gap-3">
                    <span
                      className={`grid size-9 shrink-0 place-items-center text-xs font-semibold ${
                        i % 2 ? 'bg-teal text-white' : 'bg-mint-light text-teal'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <dt className="text-xs font-light">{label}</dt>
                      <dd className="font-semibold text-teal">{value}</dd>
                    </span>
                  </div>
                ))}
              </dl>
            </section>

            <div className="mt-10 flex flex-wrap items-center gap-8">
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="group grid size-48 shrink-0 place-items-center rounded-full bg-mint-light p-8 text-center ring-1 ring-mint ring-offset-8 ring-offset-paper transition hover:bg-mint"
              >
                <span>
                  <span className="block text-sm font-light leading-snug">Come arrivare con Google Maps</span>
                  <span className="mt-2 inline-flex items-center gap-1 font-semibold text-teal">
                    Indicazioni
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </span>
              </a>
              <Link
                to="/mappa"
                search={{ luogo: poi.id }}
                className="signpost-right bg-mint py-3 pl-5 pr-12 font-display font-semibold uppercase tracking-[0.12em] text-teal transition-colors hover:bg-coral hover:text-white"
              >
                Vedi sulla mappa
              </Link>
              <Compass className="hidden size-28 shrink-0 sm:block" />
            </div>
          </div>

          {/* Nearby points, along the signpost's pole */}
          <section className="hero-fade self-start border-l-[6px] border-mint" style={{ animationDelay: '900ms' }}>
            <h2 className="signpost-right -ml-1.5 bg-mint py-3 pl-6 pr-10 font-display text-xl font-semibold uppercase tracking-[0.12em] whitespace-nowrap text-teal">
              Nei dintorni
            </h2>
            <ul className="space-y-4 py-6 pl-6">
              {nearby.map(({ poi: p, d }) => (
                <li key={p.id}>
                  <Link to="/luoghi/$poiId" params={{ poiId: p.id }} className="group flex items-center gap-3">
                    <img
                      src={poiImage(p, 160)}
                      alt=""
                      loading="lazy"
                      className="size-14 shrink-0 object-cover grayscale transition duration-500 group-hover:grayscale-0"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: poiCategory(p.category).color }}>
                        <span
                          className="grid size-5 place-items-center rounded-full text-[9px] text-white"
                          style={{ backgroundColor: poiCategory(p.category).color }}
                        >
                          {poiNumber(p)}
                        </span>
                        {km(d)}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug transition-colors group-hover:text-coral">
                        {p.name}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="mt-12 flex flex-wrap justify-between gap-2 text-xs italic text-ink/70">
          <span>Camaiore · Versilia, Toscana</span>
          <span>43.94° N · 10.30° E</span>
        </footer>
      </div>
    </main>
  )
}
