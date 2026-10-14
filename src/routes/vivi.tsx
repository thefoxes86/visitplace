import { createFileRoute } from '@tanstack/react-router'

import { CategoryPage } from '#/components/CategoryPage'

export const Route = createFileRoute('/vivi')({
  head: () => ({ meta: [{ title: 'Vivi · Visit Camaiore' }] }),
  component: () => (
    <CategoryPage
      sectionId="vivi"
      category="events"
      intro="Camaiore si vive tutto l'anno: dalle tradizioni secolari del centro storico alle serate d'estate sul Lido. Mercati, feste e appuntamenti all'aperto per scoprire il comune come lo vivono i camaioresi."
    />
  ),
})
