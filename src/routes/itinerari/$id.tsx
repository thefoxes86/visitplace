import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { ItineraryMap } from '#/components/ItineraryMap'
import { PageShell, SignpostNav } from '#/components/CategoryPage'
import { CategoryIcon } from '#/components/tourist-map/CategoryIcon'
import { useCategories } from '#/data/categories'
import { itinerariesQuery, totalKm, useItineraries, useItineraryStops } from '#/data/itineraries'
import { poiImage } from '#/data/pois'
import { GOOGLE_TRAVEL_MODE, formatModes, mainMode } from '#/lib/itineraries'
import { absoluteUrl, breadcrumbs, seo } from '#/lib/seo'

import type { ResolvedStop } from '#/data/itineraries'
import type { Itinerary } from '#/lib/itineraries'

export const Route = createFileRoute('/itinerari/$id')({
  loader: async ({ context, params }) => {
    const itineraries = await context.queryClient.ensureQueryData(itinerariesQuery)
    const itinerary = itineraries.find((i) => i.id === params.id)
    if (!itinerary) throw notFound()
    return { itinerary }
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? seo({
          title: loaderData.itinerary.title,
          description: `${loaderData.itinerary.summary.replace(/\.?$/, '.')} ${loaderData.itinerary.description}`,
          path: `/itinerari/${loaderData.itinerary.id}`,
          type: 'article',
          jsonLd: {
            '@graph': [
              {
                '@type': 'TouristTrip',
                name: loaderData.itinerary.title,
                description: loaderData.itinerary.summary,
                url: absoluteUrl(`/itinerari/${loaderData.itinerary.id}`),
                touristType: formatModes(loaderData.itinerary.modes),
                itinerary: {
                  '@type': 'ItemList',
                  itemListElement: loaderData.itinerary.stops.map((stop, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    url: absoluteUrl(`/luoghi/${stop.poiId}`),
                  })),
                },
              },
              breadcrumbs([
                ['Itinerari', '/itinerari'],
                [loaderData.itinerary.title, `/itinerari/${loaderData.itinerary.id}`],
              ]),
            ],
          },
        })
      : seo({ title: 'Itinerario non trovato', path: `/itinerari/${params.id}`, noindex: true }),
  component: ItineraryPage,
  notFoundComponent: () => (
    <main className="grid min-h-dvh place-items-center bg-paper p-8 text-center font-sans text-ink">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase text-coral">Itinerario non trovato</h1>
        <Link to="/itinerari" className="mt-4 inline-block font-serif italic text-teal underline">
          Tutti gli itinerari
        </Link>
      </div>
    </main>
  ),
})

const km = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1).replace('.', ',')} km`)

/** The route in Google Maps, through the stops: its links take at most 9 stops between the ends. */
function googleMapsRoute(itinerary: Itinerary, stops: ResolvedStop[]) {
  const at = ({ poi }: ResolvedStop) => `${poi.lat},${poi.lon}`
  const middle = stops.slice(1, -1)
  // Keep the route's shape with more stops than that: an even spread of them.
  const via = middle.length > 9 ? Array.from({ length: 9 }, (_, i) => middle[Math.round((i * (middle.length - 1)) / 8)]) : middle
  const params = new URLSearchParams({
    api: '1',
    origin: at(stops[0]),
    destination: at(stops[stops.length - 1]),
    travelmode: GOOGLE_TRAVEL_MODE[mainMode(itinerary.modes)],
  })
  if (via.length) params.set('waypoints', via.map(at).join('|'))
  return `https://www.google.com/maps/dir/?${params}`
}

/** Label and value of each practical info, leaving out what is not set. */
function infoRows(itinerary: Itinerary, stopCount: number, total: number): [string, string][] {
  const rows: [string, string][] = [['Mezzi', formatModes(itinerary.modes)]]
  if (itinerary.duration) rows.push(['Tempi', itinerary.duration])
  if (itinerary.season) rows.push(['Periodo consigliato', itinerary.season])
  rows.push(['Bambini', itinerary.kidFriendly ? 'Adatto ai bambini' : 'Non adatto ai bambini'])
  rows.push(['Animali', itinerary.petFriendly ? 'Animali ammessi' : 'Meglio senza animali'])
  rows.push(['Tappe', String(stopCount)])
  if (total >= 0.5) rows.push(['Distanza', `circa ${km(total)} in linea d'aria`])
  return rows
}

function ItineraryPage() {
  const { itinerary: loaded } = Route.useLoaderData()
  const itineraries = useItineraries()
  const itinerary = itineraries.find((i) => i.id === loaded.id) ?? loaded
  const stops = useItineraryStops(itinerary)
  const { categoryOf } = useCategories()
  const others = itineraries.filter((i) => i.id !== itinerary.id)
  const total = totalKm(stops)

  return (
    <PageShell
      back={{ to: '/itinerari', label: 'Itinerari' }}
      eyebrow={
        <>
          {formatModes(itinerary.modes)}
          {itinerary.duration && ` · ${itinerary.duration}`} · {stops.length} tappe
        </>
      }
      title={itinerary.title}
      tagline={itinerary.summary}
      aside={
        others.length > 0 && (
          <SignpostNav
            title="Altri itinerari"
            items={others.map((other, i) => ({
              key: other.id,
              number: i + 1,
              title: other.title,
              tagline: `${formatModes(other.modes)}${other.duration ? ` · ${other.duration}` : ''}`,
              link: { to: '/itinerari/$id', params: { id: other.id } },
            }))}
          />
        )
      }
    >
      <p className="max-w-2xl whitespace-pre-line text-lg font-normal leading-relaxed">{itinerary.description}</p>

      {/* Practical info, framed like the legend of the map */}
      <section className="relative mt-14 border-2 border-coral px-5 pb-5 pt-8">
        <h2 className="absolute -top-4 left-4 bg-paper px-2 font-display text-2xl font-semibold uppercase tracking-[0.15em] text-coral">
          Informazioni
        </h2>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {infoRows(itinerary, stops.length, total).map(([label, value], i) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className={`grid size-9 shrink-0 place-items-center text-xs font-semibold ${i % 2 ? 'bg-teal text-white' : 'bg-mint-light text-teal'}`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <dt className="text-xs font-normal">{label}</dt>
                <dd className="font-semibold text-teal">{value}</dd>
              </span>
            </div>
          ))}
        </dl>
      </section>

      {stops.length > 0 && (
        <>
          <div className="mt-10 aspect-[4/3] w-full overflow-hidden border-2 border-teal sm:aspect-[16/9]">
            <ItineraryMap stops={stops} />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
            {stops.length > 1 && (
              <a
                href={googleMapsRoute(itinerary, stops)}
                target="_blank"
                rel="noreferrer"
                className="signpost-right inline-block bg-mint py-3 pl-5 pr-12 font-display font-semibold uppercase tracking-[0.12em] text-teal transition-colors hover:bg-coral hover:text-white"
              >
                Apri il percorso in Google Maps
              </a>
            )}
            <Link to="/outdoor" search={{ itinerario: itinerary.id }} className="group font-serif italic text-coral hover:underline">
              Vedi sulla mappa outdoor <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* The stops, along a line */}
          <ol className="mt-14">
            {stops.map((stop, i) => {
              const category = categoryOf(stop.poi.category)
              return (
                <li key={`${stop.poi.id}-${i}`} id={`tappa-${i + 1}`} className="relative scroll-mt-24 border-l-[3px] border-mint pb-12 pl-8 last:border-transparent sm:pl-10">
                  <span className="absolute -left-[19px] top-0 grid size-9 place-items-center rounded-full bg-coral font-display text-sm font-semibold text-white ring-4 ring-paper">
                    {i + 1}
                  </span>
                  {stop.fromPrevious !== null && (
                    <p className="-mt-1 mb-3 font-serif text-sm italic text-ink/70">a {km(stop.fromPrevious)} dalla tappa precedente</p>
                  )}
                  <Link to="/luoghi/$poiId" params={{ poiId: stop.poi.id }} className="group grid gap-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
                    <img
                      src={poiImage(stop.poi, 480)}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: category.color }}>
                        <span className="grid size-5 place-items-center rounded-sm text-white" style={{ backgroundColor: category.color }}>
                          <CategoryIcon id={category.id} className="size-3" />
                        </span>
                        {category.label} · {stop.poi.area}
                      </span>
                      <span className="mt-1 block font-display text-2xl font-semibold text-teal transition-colors group-hover:text-coral">
                        {stop.poi.name}
                      </span>
                      <span className="mt-2 block font-normal leading-relaxed">{stop.note || stop.poi.summary}</span>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                        Scopri di più
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </PageShell>
  )
}
