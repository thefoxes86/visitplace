/**
 * Absolute URL of the public site, used by canonical links, Open Graph and the sitemap.
 * Set by vite.config.ts from VITE_SITE_URL, else the Vercel production domain.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string).replace(/\/$/, '')

export const SITE_NAME = 'Visit Camaiore'

export const DEFAULT_DESCRIPTION =
  'Guida turistica di Camaiore, in Versilia: centro storico, borghi, Lido, sentieri sulle Apuane, eventi, ristoranti e dove dormire. Dalle Apuane al mare.'

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`)

/** Shortens a text to fit a meta description, cutting on a word. */
export function clip(text: string, max = 160) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, clean.lastIndexOf(' ', max - 1)).replace(/[,;:.]$/, '')}…`
}

interface SeoOptions {
  /** Page title, without the site name; omit on the home page. */
  title?: string
  description?: string
  /** Path of the page, e.g. /scopri: becomes the canonical URL. */
  path: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
  /** Structured data (schema.org) for this page. */
  jsonLd?: Record<string, unknown>
}

/** Title, description, canonical, Open Graph and Twitter tags of a page, for a route's head(). */
export function seo({ title, description = DEFAULT_DESCRIPTION, path, image, type = 'website', noindex, jsonLd }: SeoOptions) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Dalle Apuane al mare della Versilia`
  const url = absoluteUrl(path)
  const desc = clip(description)

  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: desc },
      ...(noindex ? [{ name: 'robots', content: 'noindex, follow' }] : []),
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: desc },
      ...(image ? [{ property: 'og:image', content: absoluteUrl(image) }] : []),
      { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: desc },
      ...(image ? [{ name: 'twitter:image', content: absoluteUrl(image) }] : []),
      ...(jsonLd ? [{ 'script:ld+json': { '@context': 'https://schema.org', ...jsonLd } }] : []),
    ],
    links: noindex ? [] : [{ rel: 'canonical', href: url }],
  }
}

/** Breadcrumb trail for structured data: [name, path] from the home page down. */
export const breadcrumbs = (trail: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'] as [string, string], ...trail].map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: absoluteUrl(path),
  })),
})
