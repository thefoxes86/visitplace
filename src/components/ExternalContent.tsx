import { Link } from '@tanstack/react-router'

import { openCookiePreferences, saveConsent, useConsent } from '#/lib/consent'

import type { ReactNode } from 'react'

/**
 * Third-party content (Google Maps, webcams), loaded only with the visitor's consent.
 * Without it, a box in its place loads it with one click.
 */
export function ExternalContent({ service, what = 'la mappa', children }: { service: string; what?: string; children: ReactNode }) {
  const consent = useConsent()
  if (consent?.external) return children

  return (
    <div className="grid size-full place-items-center bg-mint-light/50 p-6 text-center font-sans text-ink">
      {/* While hydrating the choice isn't known yet: an empty box, no flash of the message. */}
      {consent !== undefined && (
        <div className="max-w-sm">
          <p className="font-serif text-lg italic text-teal">Per vedere {what} serve il tuo consenso</p>
          <p className="mt-2 text-sm font-light">
            È un contenuto di {service}, che può impostare cookie propri.{' '}
            <Link to="/cookie-policy" className="font-semibold text-teal underline underline-offset-2 hover:text-coral">
              Scopri di più
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={() => saveConsent({ external: true })}
              className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-dark"
            >
              Accetta e mostra
            </button>
            <button type="button" onClick={openCookiePreferences} className="text-sm font-semibold text-teal hover:underline">
              Preferenze
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
