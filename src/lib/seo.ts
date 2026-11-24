/**
 * Absolute URL of the public site, used by canonical links, Open Graph and the sitemap.
 * Set by vite.config.ts from VITE_SITE_URL, else the Vercel production domain.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string).replace(/\/$/, '')

export const SITE_NAME = 'Visit Camaiore'

export const DEFAULT_DESCRIPTION =
  'Guida turistica di Camaiore, in Versilia: centro storico, borghi, Lido, sentieri sulle Apuane, eventi, ristoranti e dove dormire. Dalle Apuane al mare.'

/** Shared when a page has no photo of its own (public/og-image.png). */
export const DEFAULT_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'Camaiore: dalle Apuane al mare della Versilia' }

/** The site's logo, for structured data. */
export const LOGO_URL = '/icon-512.png'

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
  const shared = absoluteUrl(image ?? DEFAULT_IMAGE.url)

  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: desc },
      // Large previews in Google Images and Discover.
      { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1' },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: desc },
      { property: 'og:image', content: shared },
      ...(image
        ? [{ property: 'og:image:alt', content: title ?? SITE_NAME }]
        : [
            { property: 'og:image:width', content: String(DEFAULT_IMAGE.width) },
            { property: 'og:image:height', content: String(DEFAULT_IMAGE.height) },
            { property: 'og:image:alt', content: DEFAULT_IMAGE.alt },
          ]),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: shared },
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
