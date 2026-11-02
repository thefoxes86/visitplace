import { Link, createFileRoute } from '@tanstack/react-router'

import { ItineraryForm } from '#/components/admin/ItineraryForm'
import { adminPoisQuery } from '#/components/admin/queries'
import { PageHeader } from '#/components/admin/ui'

export const Route = createFileRoute('/admin/_panel/itinerari/nuovo')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminPoisQuery),
  component: () => (
    <>
      <Link to="/admin/itinerari" className="font-serif text-sm italic text-coral hover:underline">
        ← Itinerari
      </Link>
      <PageHeader title="Nuovo itinerario" />
      <ItineraryForm />
    </>
  ),
})
