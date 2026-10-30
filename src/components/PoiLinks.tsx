import type { PoiLink } from '#/lib/media'

/** "www.versanteapuano.it" → "versanteapuano.it" */
const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Pages about the place on other sites, opening in a new tab. */
export function PoiLinks({ links, title = 'Link utili' }: { links: PoiLink[]; title?: string }) {
  if (!links.length) return null
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">{title}</h2>
      <ul className="mt-6 divide-y divide-coral/30 border-y border-coral/30">
        {links.map((link) => (
          <li key={link.url}>
            <a href={link.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-3">
              <span className="min-w-0">
                <span className="block font-semibold text-teal transition-colors group-hover:text-coral">{link.label}</span>
                <span className="block truncate text-xs font-light">{host(link.url)}</span>
              </span>
              <span aria-hidden className="shrink-0 text-coral transition-transform group-hover:translate-x-1">
                ↗
              </span>
              <span className="sr-only">(si apre in una nuova scheda)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
