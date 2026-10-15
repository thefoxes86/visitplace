import { createFileRoute } from '@tanstack/react-router'

import { CategoryPage } from '#/components/CategoryPage'
import { breadcrumbs, seo } from '#/lib/seo'

const INTRO =
  "Camaiore si vive tutto l'anno: dalle tradizioni secolari del centro storico alle serate d'estate sul Lido. Mercati, feste e appuntamenti all'aperto per scoprire il comune come lo vivono i camaioresi."

export const Route = createFileRoute('/vivi')({
  head: () =>
    seo({
      title: 'Vivi',
      description: INTRO,
      path: '/vivi',
      jsonLd: breadcrumbs([['Vivi', '/vivi']]),
    }),
  component: () => <CategoryPage sectionId="vivi" category="events" intro={INTRO} />,
})
