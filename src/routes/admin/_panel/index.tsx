import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { adminPoisQuery } from '#/components/admin/queries'
import { Card, PageHeader } from '#/components/admin/ui'
import { CategoryIcon } from '#/components/tourist-map/CategoryIcon'
import { useCategories } from '#/data/categories'

export const Route = createFileRoute('/admin/_panel/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminPoisQuery),
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()
  const { data: pois } = useSuspenseQuery(adminPoisQuery)
  const { categories, categoryOf } = useCategories()
  const recent = [...pois].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 6)

  return (
    <>
      <PageHeader title={`Ciao, ${user.name.split(' ')[0]}`} subtitle="I contenuti di Visit Camaiore" />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => {
          const list = pois.filter((poi) => poi.category === category.id)
          const drafts = list.filter((poi) => !poi.published).length
          return (
            <li key={category.id}>
              <Link
                to="/admin/$category"
                params={{ category: category.slug }}
                className="group block rounded-lg border border-ink/10 bg-white p-5 shadow-sm transition hover:border-teal"
              >
                <span className="flex items-center justify-between">
                  <span
                    className="grid size-9 place-items-center rounded-md text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <CategoryIcon id={category.id} className="size-5" />
                  </span>
                  <span className="font-display text-4xl font-light text-coral">{list.length}</span>
                </span>
                <span className="mt-4 block font-semibold text-teal group-hover:text-coral">{category.adminLabel}</span>
                <span className="block text-xs font-light">
                  {drafts ? `${drafts} non pubblicat${drafts === 1 ? 'o' : 'i'}` : 'Tutti pubblicati'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <Card title="Modificati di recente" className="mt-8">
        {recent.length ? (
          <ul className="divide-y divide-ink/10">
            {recent.map((poi) => (
              <li key={poi.id}>
                <Link
                  to="/admin/$category/$id"
                  params={{ category: categoryOf(poi.category).slug, id: poi.id }}
                  className="flex items-center justify-between gap-4 py-3 text-sm hover:text-coral"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: categoryOf(poi.category).color }} />
                    <span className="truncate font-semibold">{poi.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-light">
                    {poi.updatedAt.toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-light">Ancora nessun contenuto.</p>
        )}
      </Card>
    </>
  )
}
