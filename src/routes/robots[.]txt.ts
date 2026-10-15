import { createFileRoute } from '@tanstack/react-router'

import { absoluteUrl } from '#/lib/seo'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () => {
        // Vercel preview deployments must not end up in search results.
        const preview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production'
        const body = preview
          ? 'User-agent: *\nDisallow: /\n'
          : [
              'User-agent: *',
              'Allow: /',
              'Disallow: /admin',
              'Disallow: /api/',
              // The map opened on a place duplicates /mappa: the place has its own page.
              'Disallow: /mappa?luogo=',
              '',
              `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
              '',
            ].join('\n')

        return new Response(body, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
        })
      },
    },
  },
})
