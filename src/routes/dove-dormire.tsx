import { createFileRoute } from '@tanstack/react-router'

import { CategoryPage } from '#/components/CategoryPage'

export const Route = createFileRoute('/dove-dormire')({
  head: () => ({ meta: [{ title: 'Dove dormire · Visit Camaiore' }] }),
  component: () => (
    <CategoryPage
      sectionId="dove-dormire"
      category="bnb"
      intro="Dormire tra le mura del centro storico, tra gli ulivi delle colline o a pochi passi dal mare: B&B e agriturismi per ogni tipo di soggiorno, dalle Apuane alla Versilia."
    />
  ),
})
