import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { CategoryForm } from '#/components/admin/CategoryForm'
import { adminCategoriesQuery } from '#/components/admin/queries'
import { PageHeader } from '#/components/admin/ui'

export const Route = createFileRoute('/admin/_panel/categorie/nuova')({
  /** ?padre=<id> creates a subcategory of that category; ?sezione=<id> preselects the section. */
  validateSearch: (search: Record<string, unknown>): { padre?: string; sezione?: string } => ({
    ...(typeof search.padre === 'string' ? { padre: search.padre } : {}),
    ...(typeof search.sezione === 'string' ? { sezione: search.sezione } : {}),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminCategoriesQuery),
  component: NewCategory,
})

function NewCategory() {
  const { padre, sezione } = Route.useSearch()
  const parent = useSuspenseQuery(adminCategoriesQuery).data.find((c) => c.id === padre)

  return (
    <>
      <Link to="/admin/categorie" className="font-serif text-sm italic text-coral hover:underline">
        ← Categorie
      </Link>
      <PageHeader title={parent ? 'Nuova sottocategoria' : 'Nuova categoria'} subtitle={parent && `Dentro ${parent.label}`} />
      <CategoryForm parentId={parent?.id} section={sezione} />
    </>
  )
}
