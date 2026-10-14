import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { PoiForm } from '#/components/admin/PoiForm'
import { adminPoisQuery } from '#/components/admin/queries'
import { PageHeader } from '#/components/admin/ui'

export const Route = createFileRoute('/admin/_panel/$category/nuovo')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminPoisQuery),
  component: NewPoi,
})

function NewPoi() {
  const { category } = Route.useRouteContext()
  const { data } = useSuspenseQuery(adminPoisQuery)
  const areas = [...new Set(data.map((poi) => poi.area))].sort()

  return (
    <>
      <Link to="/admin/$category" params={{ category: category.slug }} className="font-serif text-sm italic text-coral hover:underline">
        ← {category.adminLabel}
      </Link>
      <PageHeader title={`Nuovo ${category.singular}`} />
      <PoiForm category={category.id} areas={areas} />
    </>
  )
}
