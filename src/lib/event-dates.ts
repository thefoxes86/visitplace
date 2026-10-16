/**
 * Dates of events: all-day events, and events that repeat.
 *
 * Repetitions are computed on the clock of Camaiore (Europe/Rome), so a weekly
 * event at 21:00 stays at 21:00 across daylight saving changes.
 */

export const TIME_ZONE = 'Europe/Rome'
const DAY = 24 * 60 * 60_000

/** How often an event repeats, as labels for the admin. */
export const RECURRENCES = {
  daily: 'Ogni giorno',
  weekly: 'Ogni settimana',
  monthly: 'Ogni mese',
  yearly: 'Ogni anno',
} as const

export type RecurrenceId = keyof typeof RECURRENCES

export const RECURRENCE_IDS = Object.keys(RECURRENCES) as [RecurrenceId, ...RecurrenceId[]]

/** The date fields of an event, as stored in `pois`. */
export interface EventDates {
  startsAt: Date | null
  /** End of the first occurrence; for all-day events, its last day. */
  endsAt: Date | null
  allDay: boolean
  recurrence: RecurrenceId | null
  /** Last day a repetition can start on; null repeats forever. */
  recurrenceUntil: Date | null
}

/** One time the event takes place. */
export interface Occurrence {
  start: Date
  /** When it is over: for all-day events, midnight after its last day. */
  end: Date
}

// ── Clock of Camaiore ────────────────────────────────────────────────────────

interface WallClock {
  year: number
  /** 0–11, as in Date. */
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const partsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
})

function toWallClock(date: Date): WallClock {
  const p = Object.fromEntries(partsFormat.formatToParts(date).map(({ type, value }) => [type, Number(value)]))
  return { year: p.year, month: p.month - 1, day: p.day, hour: p.hour, minute: p.minute, second: p.second }
}

/** The moment the clock of Camaiore shows this time; days past the end of the month roll over. */
function fromWallClock({ year, month, day, hour, minute, second }: WallClock) {
  const asUtc = Date.UTC(year, month, day, hour, minute, second)
  let guess = asUtc
  // Twice, in case the first guess falls on the other side of a daylight saving change.
  for (let i = 0; i < 2; i++) {
    const w = toWallClock(new Date(guess))
    guess = asUtc - (Date.UTC(w.year, w.month, w.day, w.hour, w.minute, w.second) - guess)
  }
  return new Date(guess)
}

/** Midnight after the day of the date, in Camaiore. */
const endOfDay = (date: Date) => startOfDay(date, 1)

/** Midnight starting the day of the date, `addDays` later, in Camaiore. */
export function startOfDay(date: Date, addDays = 0) {
  const w = toWallClock(date)
  return fromWallClock({ ...w, day: w.day + addDays, hour: 0, minute: 0, second: 0 })
}

/** "2026-10-17" → midnight starting that day in Camaiore. */
export function parseDay(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return fromWallClock({ year, month: month - 1, day, hour: 0, minute: 0, second: 0 })
}

/** The day of the date in Camaiore, as "2026-10-17". */
export function dayKey(date: Date) {
  const { year, month, day } = toWallClock(date)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Day of the week in Camaiore: 0 is Sunday, 6 Saturday. */
export function weekday(date: Date) {
  const { year, month, day } = toWallClock(date)
  return new Date(Date.UTC(year, month, day)).getUTCDay()
}

const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

/** The time `n` repetitions later; on the 31st, a monthly event falls on the last day of shorter months. */
function repeat(w: WallClock, recurrence: RecurrenceId, n: number): WallClock {
  if (recurrence === 'daily') return { ...w, day: w.day + n }
  if (recurrence === 'weekly') return { ...w, day: w.day + 7 * n }
  const months = w.month + (recurrence === 'monthly' ? n : 12 * n)
  const year = w.year + Math.floor(months / 12)
  const month = months % 12
  return { ...w, year, month, day: Math.min(w.day, daysInMonth(year, month)) }
}

/** Fewest days between two repetitions, to skip ahead without missing one. */
const MAX_DAYS_APART: Record<RecurrenceId, number> = { daily: 1, weekly: 7, monthly: 31, yearly: 366 }

// ── Occurrences ──────────────────────────────────────────────────────────────

/** The `n`-th time the event takes place, the first being 0. */
function occurrence(event: EventDates & { startsAt: Date }, n: number): Occurrence {
  const start = n === 0 || !event.recurrence ? event.startsAt : fromWallClock(repeat(toWallClock(event.startsAt), event.recurrence, n))
  const last = new Date(start.getTime() + Math.max(0, (event.endsAt ?? event.startsAt).getTime() - event.startsAt.getTime()))
  return { start, end: event.allDay ? endOfDay(last) : last }
}

/** The times the event takes place that are not over at `now`, in order; endless for events that always repeat. */
function* occurrencesFrom(event: EventDates, now: Date): Generator<Occurrence> {
  if (!event.startsAt) return
  const dated = { ...event, startsAt: event.startsAt }
  const first = occurrence(dated, 0)
  if (!event.recurrence) {
    if (first.end >= now) yield first
    return
  }

  const until = event.recurrenceUntil ? endOfDay(event.recurrenceUntil) : null
  // Jump close to now, one step short, so an old daily event doesn't walk through years.
  const behind = now.getTime() - first.end.getTime()
  let n = Math.max(0, Math.floor(behind / (MAX_DAYS_APART[event.recurrence] * DAY)) - 1)
  for (let skipped = 0; skipped < 1000; n++) {
    const o = occurrence(dated, n)
    if (until && o.start >= until) return
    if (o.end >= now) yield o
    else skipped++
  }
}

/** The first time the event takes place that is not over yet, or null when there is none left. */
export function nextOccurrence(event: EventDates, now = new Date()): Occurrence | null {
  for (const o of occurrencesFrom(event, now)) return o
  return null
}

/** Every time the event takes place between `from` and `to`, including those already going on at `from`. */
export function occurrencesBetween(event: EventDates, from: Date, to: Date, limit = 100): Occurrence[] {
  const list: Occurrence[] = []
  for (const o of occurrencesFrom(event, from)) {
    if (o.start >= to || list.length >= limit) break
    if (o.end > from) list.push(o)
  }
  return list
}

/** The next time the event takes place, or its first one once it is over. */
export const currentOccurrence = (event: EventDates & { startsAt: Date }) => nextOccurrence(event) ?? occurrence(event, 0)

// ── Labels ───────────────────────────────────────────────────────────────────

const dayFormat = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE })
const timeFormat = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })

const sameDay = (a: Date, b: Date) => dayFormat.format(a) === dayFormat.format(b)

/** "12 giugno 2026, 21:00 – 23:30", "12 giugno 2026, tutto il giorno", "12 giugno 2026 – 14 giugno 2026". */
export function formatOccurrence({ start, end }: Occurrence, allDay: boolean) {
  if (allDay) {
    const last = new Date(end.getTime() - 1)
    return sameDay(start, last) ? `${dayFormat.format(start)}, tutto il giorno` : `${dayFormat.format(start)} – ${dayFormat.format(last)}`
  }
  const from = `${dayFormat.format(start)}, ${timeFormat.format(start)}`
  if (end.getTime() === start.getTime()) return from
  return `${from} – ${sameDay(start, end) ? timeFormat.format(end) : `${dayFormat.format(end)}, ${timeFormat.format(end)}`}`
}

/** The hours of an occurrence, for a list already grouped by day: "21:00 – 23:30", "Tutto il giorno", "Fino al 17 ottobre 2026". */
export function formatOccurrenceTime({ start, end }: Occurrence, allDay: boolean) {
  if (allDay) {
    const last = new Date(end.getTime() - 1)
    return sameDay(start, last) ? 'Tutto il giorno' : `Fino al ${dayFormat.format(last)}`
  }
  if (end.getTime() === start.getTime()) return timeFormat.format(start)
  if (sameDay(start, end)) return `${timeFormat.format(start)} – ${timeFormat.format(end)}`
  return `${timeFormat.format(start)} · fino al ${dayFormat.format(end)}, ${timeFormat.format(end)}`
}

/** "Ogni sabato, fino al 30 settembre 2026" */
export function formatRecurrence(event: EventDates) {
  if (!event.startsAt || !event.recurrence) return null
  const start = event.startsAt
  const rule = {
    daily: 'Ogni giorno',
    weekly: `Ogni ${start.toLocaleDateString('it-IT', { weekday: 'long', timeZone: TIME_ZONE })}`,
    monthly: `Ogni mese, il giorno ${start.toLocaleDateString('it-IT', { day: 'numeric', timeZone: TIME_ZONE })}`,
    yearly: `Ogni anno, il ${start.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', timeZone: TIME_ZONE })}`,
  }[event.recurrence]
  return event.recurrenceUntil ? `${rule}, fino al ${dayFormat.format(event.recurrenceUntil)}` : rule
}
