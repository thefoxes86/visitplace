import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { PoiForm } from '#/components/admin/PoiForm'
import { adminPoisQuery } from '#/components/admin/queries'
import { PageHeader } from '#/components/admin/ui'

export const Route = createFileRoute('/admin/_panel/$category/$id')({
  loader: async ({ context, params }) => {
    const pois = await context.queryClient.ensureQueryData(adminPoisQuery)
    const poi = pois.find((p) => p.id === params.id && p.category === context.category.id)
    if (!poi) throw notFound()
  },
  component: EditPoi,
})

function EditPoi() {
  const { category } = Route.useRouteContext()
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery(adminPoisQuery)
  const poi = data.find((p) => p.id === id)
  const areas = [...new Set(data.map((p) => p.area))].sort()

  return (
    <>
      <Link to="/admin/$category" params={{ category: category.slug }} className="font-serif text-sm italic text-coral hover:underline">
        ← {category.adminLabel}
      </Link>
      {poi ? (
        <>
          <PageHeader title={poi.name} subtitle={`Modifica ${category.singular}`} />
          {/* Remount when moving between places, so the form starts from the right values. */}
          <PoiForm key={poi.id} category={category.id} poi={poi} areas={areas} />
        </>
      ) : (
        <PageHeader title="Contenuto eliminato" />
      )}
    </>
  )
}
