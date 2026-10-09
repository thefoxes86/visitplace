import { Link } from '@tanstack/react-router'

import { categoryColors, categoryLabels } from '#/data/places'
import type { Place } from '#/data/places'

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'

interface PlaceCardProps {
  place: Place
  onClose: () => void
}

/**
 * Rounded square that pops open beside the place once the camera has landed
 * on it. The camera always looks at the selected place, so the place sits at
 * the centre of the screen and the card grows out from that side.
 */
export function PlaceCard({ place, onClose }: PlaceCardProps) {
  const color = categoryColors[place.category]

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center sm:bottom-6 lg:inset-x-auto lg:bottom-auto lg:left-[calc(50%+3rem)] lg:top-1/2 lg:-translate-y-1/2">
      <article
        aria-label={place.name}
        className="place-card pointer-events-auto relative aspect-square w-72 origin-top overflow-hidden rounded-[2rem] text-white shadow-2xl ring-1 ring-white/20 sm:w-80 lg:w-96 lg:origin-left"
        style={{ backgroundColor: color }}
      >
        {/* Demo image: replace with real photography of each place. */}
        <img
          src={`https://picsum.photos/seed/camaiore-${place.id}/800/800`}
          alt=""
          className="place-card-image absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Back to map"
          className="place-card-rise absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/30 text-lg leading-none backdrop-blur transition hover:bg-black/50"
          style={{ animationDelay: '450ms' }}
        >
          ×
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
          <span
            className="place-card-rise inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: color, animationDelay: '200ms' }}
          >
            {categoryLabels[place.category]}
          </span>
          <h2 className="place-card-rise mt-2 text-xl font-bold leading-tight lg:text-2xl" style={{ animationDelay: '280ms' }}>
            {place.name}
          </h2>
          <p className="place-card-rise mt-2 line-clamp-3 text-sm text-white/80" style={{ animationDelay: '360ms' }}>
            {LOREM}
          </p>
          <div className="place-card-rise mt-4 flex gap-2" style={{ animationDelay: '440ms' }}>
            <Link
              to="/places/$placeId"
              params={{ placeId: place.id }}
              className="flex-1 rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-slate-900 transition hover:bg-white/85"
            >
              Enter
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Back to map
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}
