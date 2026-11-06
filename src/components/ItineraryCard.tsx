import { Link } from '@tanstack/react-router'

import { totalKm, useItineraryStops } from '#/data/itineraries'
import { formatModes } from '#/lib/itineraries'

import type { Itinerary } from '#/lib/itineraries'

/** A card opening an itinerary: the photo of its first stop that has one, how it is travelled, how long. */
export function ItineraryCard({ itinerary, index }: { itinerary: Itinerary; index: number }) {
  const stops = useItineraryStops(itinerary)
  const cover = stops.find((s) => s.poi.imageUrl)?.poi.imageUrl
  const km = totalKm(stops)
  return (
    <li>
      <Link to="/itinerari/$id" params={{ id: itinerary.id }} className="group block">
        <span className="relative block">
          {/* The photo of its first stop that has one; without any, just a line. */}
          {cover ? (
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="aspect-[3/2] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
            />
          ) : (
            <span aria-hidden className="block h-12 border-b-[3px] border-mint" />
          )}
          <span className="absolute -bottom-4 left-4 bg-paper px-2 font-display text-5xl font-light leading-none text-coral">
            {String(index + 1).padStart(2, '0')}
          </span>
        </span>
        <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-teal">
          {formatModes(itinerary.modes)}
          {itinerary.duration && ` · ${itinerary.duration}`} · {stops.length} tappe
          {km >= 1 && ` · ${Math.round(km)} km`}
        </span>
        <span className="mt-1 block font-display text-2xl font-semibold uppercase tracking-[0.06em] text-teal transition-colors group-hover:text-coral">
          {itinerary.title}
        </span>
        <span className="mt-1 block font-serif italic text-coral">{itinerary.summary}</span>
        {(itinerary.kidFriendly || itinerary.petFriendly) && (
          <span className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-teal">
            {itinerary.kidFriendly && <span className="rounded-full bg-mint-light px-2.5 py-1">Adatto ai bambini</span>}
            {itinerary.petFriendly && <span className="rounded-full bg-mint-light px-2.5 py-1">Animali ammessi</span>}
          </span>
        )}
      </Link>
    </li>
  )
}
