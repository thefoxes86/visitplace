import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { CategoryRows } from '#/components/admin/CategoryRows'
import { adminPoisQuery } from '#/components/admin/queries'
import { PageHeader, buttonClass } from '#/components/admin/ui'
import { sectionOf, useCategories } from '#/data/categories'
import { CATEGORY_SECTION_IDS, getSection } from '#/data/sections'

// /admin/sezione/scopri, /vivi, /gusta, /info: the categories of a section of the site.
export const Route = createFileRoute('/admin/_panel/sezione/$section')({
  beforeLoad: ({ params }) => {
    if (!CATEGORY_SECTION_IDS.includes(params.section as (typeof CATEGORY_SECTION_IDS)[number])) throw notFound()
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(adminPoisQuery),
  component: SectionPage,
})

function SectionPage() {
  const { section: id } = Route.useParams()
  const { user } = Route.useRouteContext()
  const section = getSection(id)!
  const { categories, tree } = useCategories()
  const { data: pois } = useSuspenseQuery(adminPoisQuery)
  const list = tree.filter((c) => sectionOf(categories, c.id) === id)
  const roots = list.filter((c) => c.depth === 0).length

  return (
    <>
      <PageHeader
        title={section.title}
        subtitle={`${roots} ${roots === 1 ? 'categoria' : 'categorie'} · ${section.tagline}`}
        actions={
          user.role === 'admin' && (
            <Link to="/admin/categorie/nuova" search={{ sezione: id }} className={buttonClass.primary}>
              + Nuova categoria
            </Link>
          )
        }
      />
      <div className="mt-6">
        <CategoryRows
          list={list}
          pois={pois}
          empty={`Nessuna categoria in ${section.title} ancora${user.role === 'admin' ? ': aggiungine una.' : '.'}`}
        />
      </div>
    </>
  )
}
