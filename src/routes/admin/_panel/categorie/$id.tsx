import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { CategoryForm } from '#/components/admin/CategoryForm'
import { adminCategoriesQuery } from '#/components/admin/queries'
import { PageHeader } from '#/components/admin/ui'

export const Route = createFileRoute('/admin/_panel/categorie/$id')({
  loader: async ({ context, params }) => {
    const categories = await context.queryClient.ensureQueryData(adminCategoriesQuery)
    if (!categories.some((c) => c.id === params.id)) throw notFound()
  },
  component: EditCategory,
})

function EditCategory() {
  const { id } = Route.useParams()
  const category = useSuspenseQuery(adminCategoriesQuery).data.find((c) => c.id === id)

  return (
    <>
      <Link to="/admin/categorie" className="font-serif text-sm italic text-coral hover:underline">
        ← Categorie
      </Link>
      {category ? (
        <>
          <PageHeader title={category.label} subtitle="Modifica categoria" />
          <CategoryForm key={category.id} category={category} />
        </>
      ) : (
        <PageHeader title="Categoria eliminata" />
      )}
    </>
  )
}
