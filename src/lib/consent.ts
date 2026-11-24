import { useSyncExternalStore } from 'react'

/**
 * The visitor's cookie choices, kept in a first-party cookie for six months.
 *
 * The site has no analytics: the only optional category is external content
 * (Google Maps, the webcams), which loads third-party services that may set
 * their own cookies. Technical cookies (this one, the backoffice session) need no consent.
 */
export interface Consent {
  /** Google Maps and the webcams. */
  external: boolean
  /** When the choice was made, ISO date. */
  date: string
}

const COOKIE = 'vc_consent'
/** Six months, as the Italian Garante suggests before asking again. */
const MAX_AGE = 60 * 60 * 24 * 182
/** Bump when the categories change: older choices are asked again. */
const VERSION = 1

const listeners = new Set<() => void>()
let cached: { raw: string | undefined; consent: Consent | null } | undefined

function read(): Consent | null {
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
  if (cached && cached.raw === raw) return cached.consent
  let consent: Consent | null = null
  try {
    const parsed = raw ? JSON.parse(decodeURIComponent(raw)) : null
    if (parsed?.v === VERSION && typeof parsed.external === 'boolean') consent = { external: parsed.external, date: String(parsed.date) }
  } catch {
    consent = null
  }
  cached = { raw, consent }
  return consent
}

export function saveConsent(choice: Pick<Consent, 'external'>) {
  const value = encodeURIComponent(JSON.stringify({ v: VERSION, external: choice.external, date: new Date().toISOString() }))
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`
  listeners.forEach((notify) => notify())
}

const subscribe = (notify: () => void) => {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

/**
 * The visitor's choice: null when not made yet, undefined while rendering on the
 * server and hydrating, when the cookie can't be read yet.
 */
export const useConsent = (): Consent | null | undefined => useSyncExternalStore(subscribe, read, () => undefined)

// ── Preferences panel ────────────────────────────────────────────────────────

const openListeners = new Set<() => void>()

/** Opens the banner on its preferences, e.g. from the footer. */
export const openCookiePreferences = () => openListeners.forEach((open) => open())

export function onOpenCookiePreferences(open: () => void) {
  openListeners.add(open)
  return () => {
    openListeners.delete(open)
  }
}
