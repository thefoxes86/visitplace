import { createFileRoute } from '@tanstack/react-router'

import { OtherSections, PageShell } from '#/components/CategoryPage'
import { ItineraryCard } from '#/components/ItineraryCard'
import { itinerariesQuery, useItineraries } from '#/data/itineraries'
import { breadcrumbs, seo } from '#/lib/seo'

const INTRO =
  'Percorsi tematici per scoprire Camaiore tappa dopo tappa: il centro storico a piedi, le pievi della Via Francigena, i borghi e le valli delle Apuane, una giornata con i bambini.'

export const Route = createFileRoute('/itinerari/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(itinerariesQuery),
  head: () => seo({ title: 'Itinerari', description: INTRO, path: '/itinerari', jsonLd: breadcrumbs([['Itinerari', '/itinerari']]) }),
  component: ItinerariesPage,
})

function ItinerariesPage() {
  const itineraries = useItineraries()
  return (
    <PageShell
      back={{ to: '/', label: 'Home' }}
      eyebrow={`${itineraries.length} ${itineraries.length === 1 ? 'itinerario' : 'itinerari'}`}
      title="Itinerari"
      tagline="Camaiore tappa dopo tappa"
      aside={<OtherSections current="" />}
    >
      <p className="max-w-2xl text-lg font-normal leading-relaxed">{INTRO}</p>
      {itineraries.length > 0 ? (
        <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2">
          {itineraries.map((itinerary, i) => (
            <ItineraryCard key={itinerary.id} itinerary={itinerary} index={i} />
          ))}
        </ul>
      ) : (
        <p className="mt-14 border-2 border-coral px-5 py-6 font-serif italic text-coral">Stiamo preparando i primi itinerari: torna presto.</p>
      )}
    </PageShell>
  )
}
