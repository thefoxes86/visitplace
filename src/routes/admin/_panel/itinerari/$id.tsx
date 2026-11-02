import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { ItineraryForm } from '#/components/admin/ItineraryForm'
import { adminItinerariesQuery, adminPoisQuery } from '#/components/admin/queries'
import { PageHeader } from '#/components/admin/ui'

export const Route = createFileRoute('/admin/_panel/itinerari/$id')({
  loader: async ({ context, params }) => {
    const [itineraries] = await Promise.all([
      context.queryClient.ensureQueryData(adminItinerariesQuery),
      context.queryClient.ensureQueryData(adminPoisQuery),
    ])
    if (!itineraries.some((i) => i.id === params.id)) throw notFound()
  },
  component: EditItinerary,
})

function EditItinerary() {
  const { id } = Route.useParams()
  const itinerary = useSuspenseQuery(adminItinerariesQuery).data.find((i) => i.id === id)
  return (
    <>
      <Link to="/admin/itinerari" className="font-serif text-sm italic text-coral hover:underline">
        ← Itinerari
      </Link>
      {itinerary ? (
        <>
          <PageHeader title={itinerary.title} subtitle="Modifica itinerario" />
          <ItineraryForm key={itinerary.id} itinerary={itinerary} />
        </>
      ) : (
        <PageHeader title="Itinerario eliminato" />
      )}
    </>
  )
}
