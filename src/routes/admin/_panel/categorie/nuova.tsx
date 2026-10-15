import { Link, createFileRoute } from '@tanstack/react-router'

import { CategoryForm } from '#/components/admin/CategoryForm'
import { PageHeader } from '#/components/admin/ui'

export const Route = createFileRoute('/admin/_panel/categorie/nuova')({
  component: () => (
    <>
      <Link to="/admin/categorie" className="font-serif text-sm italic text-coral hover:underline">
        ← Categorie
      </Link>
      <PageHeader title="Nuova categoria" />
      <CategoryForm />
    </>
  ),
})
