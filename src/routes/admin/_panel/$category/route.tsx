import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'

import { poiCategoryBySlug } from '#/data/pois'

// /admin/eventi, /admin/bnb, /admin/ristoranti, /admin/cultura
export const Route = createFileRoute('/admin/_panel/$category')({
  beforeLoad: ({ params }) => {
    const category = poiCategoryBySlug(params.category)
    if (!category) throw notFound()
    return { category }
  },
  component: Outlet,
})
