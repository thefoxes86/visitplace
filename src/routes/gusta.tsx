import { createFileRoute } from '@tanstack/react-router'

import { CategoryPage } from '#/components/CategoryPage'
import { breadcrumbs, seo } from '#/lib/seo'

const INTRO =
  'La cucina di Camaiore unisce i sapori della terra e del mare: tordelli, zuppe di farro e olio delle colline nel borgo, pesce fresco e pizza a due passi dalla spiaggia del Lido.'

export const Route = createFileRoute('/gusta')({
  head: () =>
    seo({
      title: 'Gusta',
      description: INTRO,
      path: '/gusta',
      jsonLd: breadcrumbs([['Gusta', '/gusta']]),
    }),
  component: () => <CategoryPage sectionId="gusta" intro={INTRO} />,
})
