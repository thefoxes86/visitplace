import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { CategoryRows } from '#/components/admin/CategoryRows'
import { adminPoisQuery } from '#/components/admin/queries'
import { Alert, PageHeader, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { categoryPath, sectionOf, subtreeIds, useCategories } from '#/data/categories'
import { getSection } from '#/data/sections'
import { formatEventDate } from '#/data/pois'
import { categoryType } from '#/lib/category-types'
import { deletePoi } from '#/server/pois'

import type { AdminPoi } from '#/components/admin/queries'
import type { Category } from '#/data/categories'

export const Route = createFileRoute('/admin/_panel/$category/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminPoisQuery),
  component: PoiList,
})

function PoiList() {
  const { category, user } = Route.useRouteContext()
  const { data } = useSuspenseQuery(adminPoisQuery)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { categories, tree, categoryOf } = useCategories()
  // Subcategories are listed above; the table holds the category's own places.
  const below = subtreeIds(categories, category.id)
  const subcategories = tree.filter((c) => c.id !== category.id && below.has(c.id))
  const all = data.filter((poi) => poi.category === category.id)
  const query = search.trim().toLowerCase()
  const list = query ? all.filter((poi) => `${poi.name} ${poi.area}`.toLowerCase().includes(query)) : all
  const type = categoryType(category.type)
  const isEvent = Boolean(type.dates)

  async function remove(poi: AdminPoi) {
    if (!confirm(`Eliminare "${poi.name}"? L'operazione non si può annullare.`)) return
    setDeleting(poi.id)
    setError(null)
    try {
      await deletePoi({ data: { id: poi.id } })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] }),
        queryClient.invalidateQueries({ queryKey: ['pois'] }),
      ])
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setDeleting(null)
    }
  }

  if (type.list) return <SubcategoryList category={category} pois={data} canEdit={user.role === 'admin'} />

  return (
    <>
      <PageHeader
        title={category.adminLabel}
        subtitle={`${all.length} in totale`}
        actions={
          <>
            {user.role === 'admin' && (
              <Link to="/admin/categorie/nuova" search={{ padre: category.id }} className={buttonClass.secondary}>
                + Sottocategoria
              </Link>
            )}
            <Link to="/admin/$category/nuovo" params={{ category: category.slug }} className={buttonClass.primary}>
              + Nuovo {category.singular}
            </Link>
          </>
        }
      />

      <nav aria-label="Percorso" className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <Trail category={category} />
      </nav>

      {subcategories.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-teal">Sottocategorie</h2>
          <CategoryRows list={subcategories} pois={data} empty="" />
          <h2 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.15em] text-teal">
            Contenuti di {category.adminLabel}
          </h2>
        </section>
      )}

      <div className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome o zona…"
          aria-label="Cerca"
          className={`${inputClass} max-w-sm`}
        />

        {list.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center font-serif italic text-teal">
            {query ? 'Nessun risultato.' : `Nessun ${category.singular} ancora: aggiungine uno.`}
          </p>
        ) : (
          <div className="relative overflow-x-auto rounded-lg border border-ink/10 bg-white shadow-sm">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-teal">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">{isEvent ? 'Quando' : 'Zona'}</th>
                  <th className="px-4 py-3 font-semibold">Stato</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {list.map((poi) => (
                  <tr key={poi.id} className="hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/$category/$id"
                        params={{ category: categoryOf(poi.category).slug, id: poi.id }}
                        className="font-semibold text-teal hover:text-coral"
                      >
                        {poi.name}
                      </Link>
                      {poi.featured && (
                        <span title="In evidenza" className="ml-2 text-coral">
                          ★
                        </span>
                      )}
                      <span className="block max-w-md truncate text-xs font-light">{poi.summary}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {isEvent ? (poi.startsAt ? formatEventDate(poi.startsAt) : '—') : poi.area}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          poi.published ? 'bg-mint-light text-teal' : 'bg-ink/10 text-ink/70'
                        }`}
                      >
                        {poi.published ? 'Pubblicato' : 'Bozza'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {poi.published && (
                        <Link
                          to="/luoghi/$poiId"
                          params={{ poiId: poi.id }}
                          target="_blank"
                          className="px-3 py-2 text-sm font-semibold text-teal hover:text-coral"
                        >
                          Vedi
                        </Link>
                      )}
                      <Link
                        to="/admin/$category/$id"
                        params={{ category: categoryOf(poi.category).slug, id: poi.id }}
                        className="px-3 py-2 text-sm font-semibold text-teal hover:text-coral"
                      >
                        Modifica
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(poi)}
                        disabled={deleting === poi.id}
                        className={buttonClass.danger}
                      >
                        {deleting === poi.id ? 'Elimino…' : 'Elimina'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

/** A list category has no places of its own: it lists its subcategories. */
function SubcategoryList({ category, pois, canEdit }: { category: Category; pois: AdminPoi[]; canEdit: boolean }) {
  const { categories, tree } = useCategories()
  const below = subtreeIds(categories, category.id)
  const list = tree.filter((c) => c.id !== category.id && below.has(c.id))
  const children = categories.filter((c) => c.parentId === category.id).length

  return (
    <>
      <PageHeader
        title={category.adminLabel}
        subtitle={`Lista · ${children} sottocategori${children === 1 ? 'a' : 'e'}`}
        actions={
          canEdit && (
            <Link to="/admin/categorie/nuova" search={{ padre: category.id }} className={buttonClass.primary}>
              + Sottocategoria
            </Link>
          )
        }
      />
      <nav aria-label="Percorso" className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <Trail category={category} />
      </nav>
      <div className="mt-6">
        <CategoryRows list={list} pois={pois} empty={`Nessuna sottocategoria ancora${canEdit ? ': aggiungine una.' : '.'}`} />
      </div>
    </>
  )
}

/** Links to the section of the site and the parent categories above a category. */
function Trail({ category }: { category: Category }) {
  const { categories } = useCategories()
  const parents = categoryPath(categories, category.id).slice(0, -1)
  const section = getSection(sectionOf(categories, category.id) ?? '')
  const link = 'font-semibold text-teal hover:text-coral'
  return (
    <>
      {section && (
        <Link to="/admin/sezione/$section" params={{ section: section.id }} className={link}>
          {section.title} ›
        </Link>
      )}
      {parents.map((parent) => (
        <Link key={parent.id} to="/admin/$category" params={{ category: parent.slug }} className={link}>
          {parent.adminLabel} ›
        </Link>
      ))}
    </>
  )
}
