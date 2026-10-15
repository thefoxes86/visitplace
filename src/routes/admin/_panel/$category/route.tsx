import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'

import { categoriesQuery, categoryBySlug } from '#/data/categories'

// /admin/eventi, /admin/bnb, /admin/ristoranti, /admin/cultura
export const Route = createFileRoute('/admin/_panel/$category')({
  beforeLoad: async ({ context, params }) => {
    const category = categoryBySlug(await context.queryClient.ensureQueryData(categoriesQuery), params.category)
    if (!category) throw notFound()
    return { category }
  },
  component: Outlet,
})
