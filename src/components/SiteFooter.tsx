import { Link } from '@tanstack/react-router'

import { Skyline } from '#/components/Skyline'
import { sectionLink, sections } from '#/data/sections'
import { openCookiePreferences } from '#/lib/consent'
import { CONTACT_TOPICS, CONTACT_TOPIC_IDS } from '#/lib/contact'
import { SITE_NAME } from '#/lib/seo'

const heading = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-mint'
const link = 'font-normal text-white/85 transition hover:text-white hover:underline underline-offset-4'

/** Useful pages of /info, by their anchors. */
const INFO_LINKS = [
  ['uffici-turistici', 'Uffici turistici'],
  ['come-arrivare', 'Come arrivare'],
  ['come-muoversi', 'Come muoversi'],
  ['guide', 'Guide'],
  ['webcam', 'Webcam'],
] as const

/** The footer of every page of the site: sections, useful info and contacts. */
export function SiteFooter() {
  return (
    <footer className="bg-teal font-sans text-white">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-14 sm:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Link to="/" className="inline-flex items-end gap-3">
              <Skyline animate={false} className="w-20 shrink-0 text-mint" />
              <span className="pb-0.5 font-display text-xl font-extrabold uppercase leading-none tracking-wide">{SITE_NAME}</span>
            </Link>
            <p className="mt-4 font-serif text-lg italic text-mint">Dalle Apuane al mare della Versilia</p>
            <p className="mt-3 max-w-sm text-sm font-light text-white/80">
              Luoghi, sapori, eventi e sentieri di Camaiore: dal centro storico ai borghi di collina, fino al Lido.
            </p>
          </div>

          <nav aria-label="Esplora">
            <h2 className={heading}>Esplora</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link {...sectionLink(section.id)} className={link}>
                    {section.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/itinerari" className={link}>
                  Itinerari
                </Link>
              </li>
              <li>
                <Link to="/mappa" className={link}>
                  Mappa
                </Link>
              </li>
              <li>
                <Link to="/outdoor" className={link}>
                  Outdoor
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Informazioni utili">
            <h2 className={heading}>Info utili</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {INFO_LINKS.map(([hash, label]) => (
                <li key={hash}>
                  <Link to="/info" hash={hash} className={link}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Contatti">
            <h2 className={heading}>Contatti</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {CONTACT_TOPIC_IDS.map((id) => (
                <li key={id}>
                  <Link to="/contatti" search={{ tema: id }} className={link}>
                    {CONTACT_TOPICS[id].label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/contatti"
              className="mt-5 inline-flex items-center gap-1 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral-dark"
            >
              Scrivici <span aria-hidden>→</span>
            </Link>
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/20 pt-6 text-xs italic text-white/70">
          <span>Camaiore · Versilia, Toscana</span>
          <span>43.94° N · 10.30° E</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 not-italic">
            <Link to="/cookie-policy" className="hover:text-white hover:underline">
              Cookie policy
            </Link>
            <button type="button" onClick={openCookiePreferences} className="hover:text-white hover:underline">
              Preferenze cookie
            </button>
            <span>
              © {new Date().getFullYear()} {SITE_NAME}
            </span>
          </span>
        </div>
      </div>
    </footer>
  )
}
