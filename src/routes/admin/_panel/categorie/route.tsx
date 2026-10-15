import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

// /admin/categorie: admins only.
export const Route = createFileRoute('/admin/_panel/categorie')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'admin') throw redirect({ to: '/admin' })
  },
  component: Outlet,
})
