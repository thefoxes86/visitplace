import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { adminCategoriesQuery } from '#/components/admin/queries'
import { Alert, PageHeader, buttonClass, errorMessage } from '#/components/admin/ui'
import { TypeIcon } from '#/components/tourist-map/CategoryIcon'
import { categoryType } from '#/lib/category-types'
import { deleteCategory } from '#/server/categories'

import type { AdminCategory } from '#/components/admin/queries'

export const Route = createFileRoute('/admin/_panel/categorie/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminCategoriesQuery),
  component: CategoryList,
})

function CategoryList() {
  const { data: categories } = useSuspenseQuery(adminCategoriesQuery)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function remove(category: AdminCategory) {
    if (!confirm(`Eliminare la categoria "${category.label}"?`)) return
    setDeleting(category.id)
    setError(null)
    try {
      await deleteCategory({ data: { id: category.id } })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
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
        title="Categorie"
        subtitle="I tipi di contenuto del sito e i loro campi"
        actions={
          <Link to="/admin/categorie/nuova" className={buttonClass.primary}>
            + Nuova categoria
          </Link>
        }
      />

      <div className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="relative overflow-x-auto rounded-lg border border-ink/10 bg-white shadow-sm">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-teal">
              <tr>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Contenuti</th>
                <th className="px-4 py-3 font-semibold">Ordine</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Azioni</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/categorie/$id"
                      params={{ id: category.id }}
                      className="flex items-center gap-3 font-semibold text-teal hover:text-coral"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-md text-white" style={{ backgroundColor: category.color }}>
                        <TypeIcon type={category.type} className="size-4" />
                      </span>
                      <span>
                        {category.label}
                        <span className="block text-xs font-light text-ink">/admin/{category.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{categoryType(category.type).label}</td>
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/$category"
                      params={{ category: category.slug }}
                      className="text-sm font-semibold text-teal hover:text-coral"
                    >
                      {category.places}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{category.sortOrder}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to="/admin/categorie/$id"
                      params={{ id: category.id }}
                      className="px-3 py-2 text-sm font-semibold text-teal hover:text-coral"
                    >
                      Modifica
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(category)}
                      disabled={deleting === category.id || category.places > 0}
                      title={category.places > 0 ? 'Ha dei contenuti: spostali o eliminali prima' : undefined}
                      className={buttonClass.danger}
                    >
                      {deleting === category.id ? 'Elimino…' : 'Elimina'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
