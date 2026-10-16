import { createFileRoute } from '@tanstack/react-router'

import { CategoryPage } from '#/components/CategoryPage'
import { breadcrumbs, seo } from '#/lib/seo'

const INTRO =
  'Dal mare della Versilia alle cime delle Apuane, passando per il borgo medievale e le colline di ulivi: Camaiore si scopre un passo alla volta. Scegli da dove cominciare.'

export const Route = createFileRoute('/scopri/')({
  head: () =>
    seo({
      title: 'Scopri',
      description:
        'Cosa vedere a Camaiore: borghi, musei, chiese romaniche, luoghi storici, trekking sulle Apuane, natura e il mare del Lido.',
      path: '/scopri',
      jsonLd: breadcrumbs([['Scopri', '/scopri']]),
    }),
  component: () => <CategoryPage sectionId="scopri" intro={INTRO} />,
})
