import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { adminPoisQuery } from '#/components/admin/queries'
import { Alert, PageHeader, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { formatEventDate } from '#/data/pois'
import { scopriTopics } from '#/data/scopri'
import { categoryType } from '#/lib/category-types'
import { deletePoi } from '#/server/pois'

import type { AdminPoi } from '#/components/admin/queries'

export const Route = createFileRoute('/admin/_panel/$category/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminPoisQuery),
  component: PoiList,
})

function PoiList() {
  const { category } = Route.useRouteContext()
  const { data } = useSuspenseQuery(adminPoisQuery)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

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

  return (
    <>
      <PageHeader
        title={category.adminLabel}
        subtitle={`${all.length} in totale`}
        actions={
          <Link to="/admin/$category/nuovo" params={{ category: category.slug }} className={buttonClass.primary}>
            + Nuovo {category.singular}
          </Link>
        }
      />

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
                  {type.topic && <th className="px-4 py-3 font-semibold">Sezione</th>}
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
                        params={{ category: category.slug, id: poi.id }}
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
                    {type.topic && (
                      <td className="px-4 py-3 text-xs">{scopriTopics.find((t) => t.id === poi.topic)?.title ?? '—'}</td>
                    )}
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
                        params={{ category: category.slug, id: poi.id }}
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
