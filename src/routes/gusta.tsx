import { createFileRoute } from '@tanstack/react-router'

import { CategoryPage } from '#/components/CategoryPage'

export const Route = createFileRoute('/gusta')({
  head: () => ({ meta: [{ title: 'Gusta · Visit Camaiore' }] }),
  component: () => (
    <CategoryPage
      sectionId="gusta"
      category="restaurant"
      intro="La cucina di Camaiore unisce i sapori della terra e del mare: tordelli, zuppe di farro e olio delle colline nel borgo, pesce fresco e pizza a due passi dalla spiaggia del Lido."
    />
  ),
})
