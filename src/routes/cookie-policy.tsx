import { Link, createFileRoute } from '@tanstack/react-router'

import { PageShell } from '#/components/CategoryPage'
import { openCookiePreferences, useConsent } from '#/lib/consent'
import { breadcrumbs, seo } from '#/lib/seo'

import type { ReactNode } from 'react'

export const Route = createFileRoute('/cookie-policy')({
  head: () =>
    seo({
      title: 'Cookie policy',
      description: 'Quali cookie usa Visit Camaiore, a cosa servono e come cambiare le tue scelte su Google Maps e sugli altri contenuti esterni.',
      path: '/cookie-policy',
      jsonLd: breadcrumbs([['Cookie policy', '/cookie-policy']]),
    }),
  component: CookiePolicy,
})

/** Last change to this text: update it with the text. */
const UPDATED = '24 novembre 2026'

const COOKIES: { name: string; who: string; purpose: string; duration: string }[] = [
  {
    name: 'vc_consent',
    who: 'Visit Camaiore (tecnico)',
    purpose: 'Ricorda le tue scelte su cookie e contenuti esterni.',
    duration: '6 mesi',
  },
  {
    name: 'better-auth.*',
    who: 'Visit Camaiore (tecnico)',
    purpose: "Tiene aperto l'accesso al backoffice, solo per chi gestisce i contenuti.",
    duration: 'Fino all’uscita, al massimo 7 giorni',
  },
  {
    name: 'Cookie di Google',
    who: 'Google Ireland Ltd. (terza parte, solo con consenso)',
    purpose: 'Impostati da Google Maps quando carichi una mappa.',
    duration: 'Decisa da Google',
  },
  {
    name: 'Cookie dei siti delle webcam',
    who: 'Gestori delle webcam (terze parti, solo con consenso)',
    purpose: 'Impostati dai siti esterni che trasmettono le webcam, quando le carichi.',
    duration: 'Decisa da ciascun gestore',
  },
]

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold uppercase tracking-[0.12em] text-teal">{title}</h2>
      <div className="mt-3 space-y-3 text-base font-normal leading-relaxed">{children}</div>
    </section>
  )
}

const outLink = 'font-semibold text-teal underline underline-offset-2 hover:text-coral'

function CookiePolicy() {
  const consent = useConsent()

  return (
    <PageShell
      back={{ label: 'Home', to: '/' }}
      eyebrow="Informazioni legali"
      title="Cookie policy"
      tagline="Pochi cookie, e solo se servono"
      aside={null}
      wide
    >
      <div className="max-w-3xl">
        <p className="text-sm font-light text-ink/70">Ultimo aggiornamento: {UPDATED}</p>

        <Block title="In breve">
          <p>
            Visit Camaiore non usa cookie di profilazione, pubblicità o statistiche. Usa solo cookie tecnici, necessari al funzionamento
            del sito, e, se lo accetti, carica contenuti esterni come le mappe di Google Maps e le webcam, che possono impostare cookie
            propri.
          </p>
        </Block>

        <Block title="Cosa sono i cookie">
          <p>
            I cookie sono piccoli file che un sito salva nel tuo browser per ricordare informazioni tra una pagina e l'altra o tra una
            visita e la successiva. I cookie tecnici servono a far funzionare il sito e non richiedono il consenso; gli altri vengono
            usati solo se li accetti.
          </p>
        </Block>

        <Block title="I cookie che usiamo">
          <div className="overflow-x-auto border border-ink/10 bg-white">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-teal">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cookie</th>
                  <th className="px-4 py-3 font-semibold">Di chi</th>
                  <th className="px-4 py-3 font-semibold">A cosa serve</th>
                  <th className="px-4 py-3 font-semibold">Durata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {COOKIES.map((cookie) => (
                  <tr key={cookie.name}>
                    <td className="px-4 py-3 font-semibold">{cookie.name}</td>
                    <td className="px-4 py-3">{cookie.who}</td>
                    <td className="px-4 py-3">{cookie.purpose}</td>
                    <td className="px-4 py-3">{cookie.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <Block title="Contenuti esterni">
          <p>
            Le mappe sono fornite da <strong className="font-semibold">Google Maps</strong>. Finché non dai il consenso, al loro posto vedi
            un riquadro e il sito non contatta Google per caricarle. Quando le carichi, Google tratta i dati secondo la propria{' '}
            <a href="https://policies.google.com/privacy?hl=it" target="_blank" rel="noreferrer noopener" className={outLink}>
              informativa privacy
            </a>{' '}
            e la sua{' '}
            <a href="https://policies.google.com/technologies/cookies?hl=it" target="_blank" rel="noreferrer noopener" className={outLink}>
              pagina sui cookie
            </a>
            .
          </p>
          <p>Lo stesso vale per le webcam trasmesse da siti esterni: si caricano solo con il tuo consenso.</p>
          <p>
            I caratteri del sito sono scaricati da Google Fonts: non impostano cookie, ma il tuo browser si collega ai server di Google per
            scaricarli.
          </p>
        </Block>

        <Block title="Come cambiare le tue scelte">
          <p>
            {consent === undefined
              ? 'Puoi cambiare le tue scelte quando vuoi.'
              : consent === null
                ? 'Non hai ancora fatto una scelta.'
                : consent.external
                  ? 'Al momento hai accettato i contenuti esterni.'
                  : 'Al momento hai scelto i soli cookie tecnici.'}{' '}
            Puoi cambiarla quando vuoi da «Preferenze cookie» in fondo a ogni pagina, o da qui:
          </p>
          <p>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-dark"
            >
              Preferenze cookie
            </button>
          </p>
          <p>
            Puoi anche cancellare o bloccare i cookie dalle impostazioni del browser: in questo caso il sito ti chiederà di nuovo le tue
            scelte alla prossima visita.
          </p>
        </Block>

        <Block title="Contatti">
          <p>
            Per domande su questa cookie policy o sui tuoi dati puoi scriverci dalla{' '}
            <Link to="/contatti" search={{ tema: 'varie' }} className={outLink}>
              pagina Contatti
            </Link>
            .
          </p>
        </Block>
      </div>
    </PageShell>
  )
}
