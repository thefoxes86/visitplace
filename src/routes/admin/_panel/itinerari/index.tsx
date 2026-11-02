import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { adminItinerariesQuery } from '#/components/admin/queries'
import { Alert, PageHeader, buttonClass, errorMessage } from '#/components/admin/ui'
import { formatModes } from '#/lib/itineraries'
import { deleteItinerary } from '#/server/itineraries'

import type { Itinerary } from '#/lib/itineraries'

export const Route = createFileRoute('/admin/_panel/itinerari/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminItinerariesQuery),
  component: ItineraryList,
})

function ItineraryList() {
  const { data: itineraries } = useSuspenseQuery(adminItinerariesQuery)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  /** The itinerary waiting for a second click to be deleted. */
  const [confirming, setConfirming] = useState<string | null>(null)

  async function remove(itinerary: Itinerary) {
    if (confirming !== itinerary.id) return setConfirming(itinerary.id)
    setError(null)
    try {
      await deleteItinerary({ data: { id: itinerary.id } })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'itineraries'] }),
        queryClient.invalidateQueries({ queryKey: ['itineraries'] }),
      ])
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setConfirming(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Itinerari"
        subtitle="Percorsi tematici tra i luoghi del sito"
        actions={
          <Link to="/admin/itinerari/nuovo" className={buttonClass.primary}>
            Nuovo itinerario
          </Link>
        }
      />
      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}
      {itineraries.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-ink/20 p-10 text-center font-serif italic text-teal">Nessun itinerario, per ora.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
          {itineraries.map((itinerary) => (
            <li key={itinerary.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Link to="/admin/itinerari/$id" params={{ id: itinerary.id }} className="group min-w-0 flex-1">
                <span className="block font-semibold text-teal group-hover:text-coral">
                  {itinerary.title}
                  {!itinerary.published && <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink/70">Non pubblicato</span>}
                </span>
                <span className="block text-xs font-light">
                  {formatModes(itinerary.modes)}
                  {itinerary.duration && ` · ${itinerary.duration}`} · {itinerary.stops.length} tappe
                </span>
              </Link>
              <button type="button" onClick={() => remove(itinerary)} onBlur={() => setConfirming(null)} className={buttonClass.danger}>
                {confirming === itinerary.id ? 'Conferma eliminazione' : 'Elimina'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
