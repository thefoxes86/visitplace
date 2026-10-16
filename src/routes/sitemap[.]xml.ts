import { createFileRoute } from '@tanstack/react-router'
import { desc, eq } from 'drizzle-orm'

import { sections } from '#/data/sections'
import { db } from '#/db'
import { categories, pois } from '#/db/schema'
import { absoluteUrl } from '#/lib/seo'

interface SitemapEntry {
  path: string
  lastmod?: Date
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: number
}

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)

function toXml(entries: SitemapEntry[]) {
  const urls = entries.map(({ path, lastmod, changefreq, priority }) =>
    [
      '  <url>',
      `    <loc>${escapeXml(absoluteUrl(path))}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod.toISOString()}</lastmod>`] : []),
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority.toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n'),
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

/** Every public page: the sections, the categories' own pages and each published place. */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const places = await db
          .select({ id: pois.id, updatedAt: pois.updatedAt })
          .from(pois)
          .where(eq(pois.published, true))
          .orderBy(desc(pois.updatedAt))
        const categoryPages = await db.select({ slug: categories.slug, updatedAt: categories.updatedAt }).from(categories)
        // Pages listing places change whenever one of them does.
        const lastChange = places[0]?.updatedAt

        const entries: SitemapEntry[] = [
          { path: '/', lastmod: lastChange, changefreq: 'weekly', priority: 1 },
          { path: '/mappa', lastmod: lastChange, changefreq: 'weekly', priority: 0.9 },
          ...sections.map((section) => ({
            path: `/${section.id}`,
            lastmod: section.id === 'info' ? undefined : lastChange,
            changefreq: section.id === 'vivi' ? ('daily' as const) : ('weekly' as const),
            priority: 0.8,
          })),
          ...categoryPages.map((category) => ({
            path: `/categorie/${category.slug}`,
            lastmod: lastChange && lastChange > category.updatedAt ? lastChange : category.updatedAt,
            changefreq: 'weekly' as const,
            priority: 0.7,
          })),
          ...places.map((place) => ({
            path: `/luoghi/${place.id}`,
            lastmod: place.updatedAt,
            changefreq: 'monthly' as const,
            priority: 0.6,
          })),
        ]

        return new Response(toXml(entries), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        })
      },
    },
  },
})
