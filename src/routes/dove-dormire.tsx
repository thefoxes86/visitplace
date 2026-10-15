import { createFileRoute } from '@tanstack/react-router'

import { CategoryPage } from '#/components/CategoryPage'
import { breadcrumbs, seo } from '#/lib/seo'

const INTRO =
  'Dormire tra le mura del centro storico, tra gli ulivi delle colline o a pochi passi dal mare: B&B e agriturismi per ogni tipo di soggiorno, dalle Apuane alla Versilia.'

export const Route = createFileRoute('/dove-dormire')({
  head: () =>
    seo({
      title: 'Dove dormire',
      description: INTRO,
      path: '/dove-dormire',
      jsonLd: breadcrumbs([['Dove dormire', '/dove-dormire']]),
    }),
  component: () => <CategoryPage sectionId="dove-dormire" category="bnb" intro={INTRO} />,
})
