import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'

import { onOpenCookiePreferences, saveConsent, useConsent } from '#/lib/consent'

const button = 'rounded-full px-5 py-2.5 text-sm font-semibold transition'
// Accept and reject look alike: the choice must be as easy either way.
const choice = `${button} border-2 border-teal text-teal hover:bg-teal hover:text-white`

/**
 * Asks for consent on the first visit, and again from the footer's "Preferenze cookie".
 * Closing it with the × keeps the current choice, or only the technical cookies on the first visit.
 */
export function CookieBanner() {
  const consent = useConsent()
  const [reopened, setReopened] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [external, setExternal] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(
    () =>
      onOpenCookiePreferences(() => {
        setReopened(true)
        setCustomizing(true)
      }),
    [],
  )

  // The toggles start from the choice already made.
  useEffect(() => {
    if (!customizing) return
    setExternal(consent?.external ?? false)
    setAnalytics(consent?.analytics ?? false)
  }, [customizing, consent?.external, consent?.analytics])

  useEffect(() => {
    if (reopened) panel.current?.focus()
  }, [reopened])

  // undefined: still hydrating, the cookie isn't read yet.
  const open = consent === null || reopened
  if (consent === undefined || !open) return null

  const decide = (choice: { external: boolean; analytics: boolean }) => {
    saveConsent(choice)
    setReopened(false)
    setCustomizing(false)
  }

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      tabIndex={-1}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl border-t-[6px] border-coral bg-white font-sans text-ink shadow-2xl outline-none ring-1 ring-ink/10 sm:inset-x-6 sm:bottom-6"
    >
      <button
        type="button"
        onClick={() => decide({ external: consent?.external ?? false, analytics: consent?.analytics ?? false })}
        aria-label="Chiudi: continua con i soli cookie tecnici"
        title="Chiudi e continua senza accettare"
        className="absolute right-2 top-2 grid size-9 place-items-center rounded-full text-xl text-ink/70 transition hover:bg-ink/5 hover:text-ink"
      >
        ×
      </button>
      <div className="max-h-[80dvh] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <h2 id="cookie-title" className="pr-8 font-display text-lg font-semibold text-teal">
          Cookie, statistiche e contenuti esterni
        </h2>
        <p className="mt-2 text-sm font-normal leading-relaxed">
          Usiamo cookie tecnici, necessari al funzionamento del sito. Con il tuo consenso usiamo anche{' '}
          <strong className="font-semibold">Google Analytics</strong>, per sapere in forma aggregata quali pagine vengono visitate, e
          carichiamo le mappe di <strong className="font-semibold">Google Maps</strong> e le{' '}
          <strong className="font-semibold">webcam</strong>: sono servizi esterni che possono impostare cookie propri. Niente pubblicità.
          Puoi cambiare idea quando vuoi da «Preferenze cookie» in fondo alla pagina.{' '}
          <Link to="/cookie-policy" className="font-semibold text-teal underline underline-offset-2 hover:text-coral">
            Cookie policy
          </Link>
        </p>

        {customizing && (
          <fieldset className="mt-5 space-y-3 border-t border-ink/10 pt-4">
            <legend className="sr-only">Scegli le categorie</legend>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked disabled className="mt-0.5 size-4 shrink-0 accent-teal" />
              <span>
                <span className="block font-semibold">Tecnici · sempre attivi</span>
                <span className="font-light text-ink/80">Ricordano la tua scelta sui cookie e l'accesso al backoffice.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={external}
                onChange={(e) => setExternal(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-teal"
              />
              <span>
                <span className="block font-semibold">Contenuti esterni</span>
                <span className="font-light text-ink/80">
                  Mappe di Google Maps (Google Ireland Ltd.) e webcam di siti terzi. Senza, al loro posto vedi un riquadro per caricarle.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-teal"
              />
              <span>
                <span className="block font-semibold">Statistiche</span>
                <span className="font-light text-ink/80">
                  Google Analytics (Google Ireland Ltd.): pagine visitate e provenienza delle visite, in forma aggregata, per migliorare il
                  sito.
                </span>
              </span>
            </label>
          </fieldset>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => decide({ external: false, analytics: false })} className={choice}>
            Rifiuta
          </button>
          <button type="button" onClick={() => decide({ external: true, analytics: true })} className={choice}>
            Accetta tutti
          </button>
          {customizing ? (
            <button type="button" onClick={() => decide({ external, analytics })} className={`${button} bg-coral text-white hover:bg-coral-dark`}>
              Salva le scelte
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className={`${button} font-serif italic text-coral underline-offset-4 hover:underline`}
            >
              Personalizza
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
