import { useEffect, useRef, useState } from 'react'

import { Alert, Field, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { categoryTree, subtreeIds } from '#/lib/category-tree'
import { isListType } from '#/lib/category-types'
import { deleteCategory } from '#/server/categories'

import type { AdminCategory } from '#/components/admin/queries'

interface DeleteCategoryDialogProps {
  category: AdminCategory
  /** Every category, to count what is inside and offer where to move it. */
  all: AdminCategory[]
  onClose: () => void
  onDeleted: () => Promise<void>
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Deleting a category that still holds places or subcategories: move them or delete them too. */
export function DeleteCategoryDialog({ category, all, onClose, onDeleted }: DeleteCategoryDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const subtree = subtreeIds(all, category.id)
  const directChildren = all.filter((c) => c.parentId === category.id).length
  const parent = all.find((c) => c.id === category.parentId)

  const [children, setChildren] = useState<'up' | 'delete'>('up')
  const removed = children === 'delete' ? subtree : new Set([category.id])
  const places = all.filter((c) => removed.has(c.id)).reduce((sum, c) => sum + c.places, 0)
  const subcategories = subtree.size - 1

  // Places can move to any category that stays and is not a list, preferably one of the same type.
  const targets = categoryTree(all).filter((c) => !removed.has(c.id) && !isListType(c.type))
  const [placesTo, setPlacesTo] = useState(() => targets.find((c) => c.type === category.type)?.id ?? '')
  const [movePlaces, setMovePlaces] = useState(true)
  // Deleting the subcategories too can take the chosen category away: fall back to the first left.
  const target = targets.find((c) => c.id === placesTo) ?? targets[0]
  const moveTo = movePlaces ? target : undefined

  const deletesMore = (places > 0 && !moveTo) || (children === 'delete' && subcategories > 0)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setDeleting(true)
    setError(null)
    try {
      await deleteCategory({ data: { id: category.id, children, placesTo: places > 0 && moveTo ? moveTo.id : null } })
      await onDeleted()
      onClose()
    } catch (err) {
      setError(errorMessage(err))
      setDeleting(false)
    }
  }

  const radio = 'mt-0.5 accent-teal'

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="delete-category-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <form onSubmit={submit} className="space-y-5 p-6">
        <h2 id="delete-category-title" className="font-display text-xl font-extrabold uppercase tracking-wide text-coral">
          Eliminare “{category.label}”?
        </h2>
        {error && <Alert>{error}</Alert>}

        {subcategories > 0 && (
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal">
              {plural(subcategories, 'sottocategoria', 'sottocategorie')}
            </legend>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="children" checked={children === 'up'} onChange={() => setChildren('up')} className={radio} />
              <span>
                Tienile e spostale {parent ? `dentro “${parent.label}”` : 'tra le categorie principali'}
                {subcategories > directChildren && (
                  <span className="block text-xs font-light">Salgono di un livello con le loro sottocategorie.</span>
                )}
              </span>
            </label>
            <label className="mt-2 flex items-start gap-2 text-sm">
              <input type="radio" name="children" checked={children === 'delete'} onChange={() => setChildren('delete')} className={radio} />
              <span>Eliminale insieme alla categoria</span>
            </label>
          </fieldset>
        )}

        {places > 0 && (
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal">
              {plural(places, 'contenuto', 'contenuti')}
              {children === 'delete' && subcategories > 0 ? ' (con quelli delle sottocategorie)' : ''}
            </legend>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="places"
                checked={movePlaces}
                onChange={() => setMovePlaces(true)}
                disabled={!targets.length}
                className={radio}
              />
              <span className="flex-1">
                Spostali in un'altra categoria
                {movePlaces && targets.length > 0 && (
                  <Field label="Categoria" htmlFor="placesTo" className="mt-2">
                    <select id="placesTo" value={target?.id} onChange={(e) => setPlacesTo(e.target.value)} className={inputClass}>
                      {targets.map((c) => (
                        <option key={c.id} value={c.id}>
                          {'  '.repeat(c.depth)}
                          {c.depth > 0 ? '└ ' : ''}
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                {movePlaces && target && target.type !== category.type && (
                  <span className="mt-2 block rounded-md bg-coral/10 px-3 py-2 text-xs font-semibold text-coral-dark">
                    “{target.label}” è di un altro tipo: i dettagli che non prevede non saranno più mostrati.
                  </span>
                )}
              </span>
            </label>
            <label className="mt-2 flex items-start gap-2 text-sm">
              <input type="radio" name="places" checked={!movePlaces} onChange={() => setMovePlaces(false)} className={radio} />
              <span>Eliminali definitivamente</span>
            </label>
          </fieldset>
        )}

        {deletesMore && (
          <label className="flex items-start gap-2 rounded-md bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 accent-coral" />
            Ho capito: quello che elimino non si può recuperare.
          </label>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-ink/10 pt-4">
          <button type="button" onClick={() => dialog.current?.close()} className={buttonClass.secondary}>
            Annulla
          </button>
          <button
            type="submit"
            disabled={deleting || (deletesMore && !confirmed)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-coral-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral-dark/90 disabled:opacity-50"
          >
            {deleting ? 'Elimino…' : 'Elimina categoria'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
