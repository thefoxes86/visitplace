import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { useCategories } from '#/data/categories'
import { poiImage } from '#/data/pois'
import { usePois } from '#/data/use-pois'
import {
  TIME_ZONE,
  dayKey,
  formatOccurrenceTime,
  formatRecurrence,
  nextOccurrence,
  occurrencesBetween,
  parseDay,
  startOfDay,
  weekday,
} from '#/lib/event-dates'

import type { Category } from '#/data/categories'
import type { Poi } from '#/data/pois'
import type { Occurrence } from '#/lib/event-dates'

const FILTERS = {
  upcoming: 'In arrivo',
  today: 'Oggi',
  weekend: 'Prossimo weekend',
  month: 'Prossimo mese',
  custom: 'Scegli le date',
} as const

type FilterId = keyof typeof FILTERS

interface Range {
  from: Date
  to: Date
}

/** The days a filter covers, in Camaiore; null for "In arrivo", the next time of each event. */
function filterRange(filter: FilterId, now: Date, custom: { from: string; to: string }): Range | null {
  switch (filter) {
    case 'upcoming':
      return null
    case 'today':
      return { from: startOfDay(now), to: startOfDay(now, 1) }
    case 'weekend': {
      // During a weekend, what is left of it; otherwise the coming Saturday and Sunday.
      const day = weekday(now)
      if (day === 6 || day === 0) return { from: now, to: startOfDay(now, day === 6 ? 2 : 1) }
      return { from: startOfDay(now, 6 - day), to: startOfDay(now, 8 - day) }
    }
    case 'month':
      return { from: now, to: startOfDay(now, 31) }
    case 'custom': {
      if (!custom.from) return null
      const from = parseDay(custom.from)
      const last = custom.to && custom.to >= custom.from ? parseDay(custom.to) : from
      return { from, to: startOfDay(last, 1) }
    }
  }
}

interface Entry {
  event: Poi
  occurrence: Occurrence
  /** Day it is listed under: its start, or the start of the range for one already going on. */
  day: Date
}

const monthFormat = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric', timeZone: TIME_ZONE })
const weekdayFormat = new Intl.DateTimeFormat('it-IT', { weekday: 'long', timeZone: TIME_ZONE })
const dayNumberFormat = new Intl.DateTimeFormat('it-IT', { day: 'numeric', timeZone: TIME_ZONE })
const shortMonthFormat = new Intl.DateTimeFormat('it-IT', { month: 'short', timeZone: TIME_ZONE })

/** The events of a category and its subcategories, on a timeline by day, with filters by date. */
export function EventTimeline({ category }: { category: Category }) {
  const { subtree, categoryOf } = useCategories()
  const ids = subtree(category.id)
  const events = usePois().filter((poi) => ids.has(poi.category))
  const [filter, setFilter] = useState<FilterId>('upcoming')
  const [custom, setCustom] = useState({ from: '', to: '' })

  const now = new Date()
  const range = filterRange(filter, now, custom)
  const entries: Entry[] = events
    .flatMap((event) => {
      const occurrences = range ? occurrencesBetween(event, range.from, range.to) : [nextOccurrence(event, now)].filter((o) => o !== null)
      const from = range?.from ?? now
      return occurrences.map((occurrence) => ({ event, occurrence, day: occurrence.start > from ? occurrence.start : from }))
    })
    .sort((a, b) => a.day.getTime() - b.day.getTime() || a.occurrence.start.getTime() - b.occurrence.start.getTime())

  // Days in order, each under its month.
  const days: { key: string; date: Date; entries: Entry[] }[] = []
  for (const entry of entries) {
    const key = dayKey(entry.day)
    const last = days.at(-1)
    if (last?.key === key) last.entries.push(entry)
    else days.push({ key, date: entry.day, entries: [entry] })
  }

  function choose(id: FilterId) {
    setFilter(id)
    if (id === 'custom' && !custom.from) setCustom({ from: dayKey(now), to: '' })
  }

  return (
    <section className="mt-12">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Quando">
        {(Object.keys(FILTERS) as FilterId[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => choose(id)}
            className={`px-4 py-2 font-display text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
              filter === id ? 'bg-teal text-white' : 'bg-mint-light text-teal hover:bg-mint'
            }`}
          >
            {FILTERS[id]}
          </button>
        ))}
      </div>
      {filter === 'custom' && (
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-teal">
            Dal
            <input
              type="date"
              value={custom.from}
              onChange={(e) => setCustom((prev) => ({ ...prev, from: e.target.value }))}
              className="mt-1 block border-b-2 border-coral bg-transparent py-1 font-sans text-base font-normal normal-case tracking-normal text-ink outline-none focus:border-teal"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-teal">
            Al <span className="font-light normal-case tracking-normal">(facoltativo)</span>
            <input
              type="date"
              value={custom.to}
              min={custom.from || undefined}
              onChange={(e) => setCustom((prev) => ({ ...prev, to: e.target.value }))}
              className="mt-1 block border-b-2 border-coral bg-transparent py-1 font-sans text-base font-normal normal-case tracking-normal text-ink outline-none focus:border-teal"
            />
          </label>
        </div>
      )}
      <p className="mt-4 font-serif italic text-coral" aria-live="polite">
        {entries.length === 0 ? 'Nessun evento' : entries.length === 1 ? '1 evento' : `${entries.length} eventi`}
        {range ? ` · ${formatRange(range)}` : ' · la prossima data di ciascuno'}
      </p>

      {/* Timeline */}
      {days.length === 0 ? (
        <p className="mt-10 border-2 border-coral px-5 py-6 font-serif italic text-coral">
          Nessun evento in questo periodo: prova un'altra data, o guarda tutti quelli in arrivo.
        </p>
      ) : (
        <ol className="mt-10">
          {days.map((day, i) => {
            const month = monthFormat.format(day.date)
            const newMonth = i === 0 || monthFormat.format(days[i - 1].date) !== month
            return (
              <li key={day.key}>
                {newMonth && (
                  <h2 className="mb-6 font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal first-letter:uppercase lg:ml-[11rem] lg:pl-10">
                    {month}
                  </h2>
                )}
                <div className="grid lg:grid-cols-[11rem_minmax(0,1fr)]">
                  {/* The day, beside the line */}
                  <div className="flex items-baseline gap-3 pb-4 lg:block lg:pb-0 lg:pr-8 lg:text-right">
                    <span className="font-display text-6xl font-light leading-none text-coral">{dayNumberFormat.format(day.date)}</span>
                    <span className="font-serif text-lg italic text-coral lg:mt-1 lg:block">
                      {weekdayFormat.format(day.date)} · {shortMonthFormat.format(day.date)}
                    </span>
                  </div>
                  <div className="relative border-l-[3px] border-mint pb-12 pl-6 lg:pl-10">
                    <span aria-hidden className="absolute -left-[11px] top-3 size-5 rounded-full bg-coral ring-4 ring-paper" />
                    <ul className="grid gap-6 xl:grid-cols-2">
                      {day.entries.map((entry) => (
                        <EventCard
                          key={`${entry.event.id}-${entry.occurrence.start.getTime()}`}
                          entry={entry}
                          now={now}
                          category={categoryOf(entry.event.category)}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function EventCard({ entry: { event, occurrence }, now, category }: { entry: Entry; now: Date; category: Category }) {
  const over = occurrence.end < now
  return (
    <li className={over ? 'opacity-60' : ''}>
      <Link to="/luoghi/$poiId" params={{ poiId: event.id }} className="group grid grid-cols-[7rem_minmax(0,1fr)] gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <img
          src={poiImage(event, 400)}
          alt=""
          loading="lazy"
          className="aspect-square w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-teal">
            {formatOccurrenceTime(occurrence, event.allDay)}
            {over && <span className="ml-2 font-light italic text-ink/70">concluso</span>}
          </span>
          <span className="mt-1 block font-display text-xl font-semibold leading-tight text-teal transition-colors group-hover:text-coral">
            {event.name}
          </span>
          <span className="mt-1 block font-serif text-sm italic text-coral">{event.summary}</span>
          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-light">
            <span className="font-semibold uppercase tracking-wider" style={{ color: category.color }}>
              {category.label}
            </span>
            · {event.area}
            {event.recurrence && <span className="rounded-full bg-mint-light px-2 py-0.5 font-semibold text-teal">{formatRecurrence(event)}</span>}
          </span>
        </span>
      </Link>
    </li>
  )
}

const rangeDayFormat = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE })

/** "sabato 17 ottobre – domenica 18 ottobre", or a single day. */
function formatRange({ from, to }: Range) {
  const last = new Date(to.getTime() - 1)
  const first = rangeDayFormat.format(from)
  return dayKey(from) === dayKey(last) ? first : `${first} – ${rangeDayFormat.format(last)}`
}