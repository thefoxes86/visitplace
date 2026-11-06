import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { IMAGE_ACCEPT, formatSize, mediaName, useLibraryUpload, useMediaSearch } from '#/components/admin/MediaLibrary'
import { mediaQuery } from '#/components/admin/queries'
import { Alert, PageHeader, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { useCategories } from '#/data/categories'
import { deleteMedia } from '#/server/media'

import type { MediaItem } from '#/server/media'

export const Route = createFileRoute('/admin/_panel/media')({
  head: () => ({ meta: [{ title: 'Media · Backoffice' }] }),
  component: MediaPage,
})

type Filter = 'all' | 'used' | 'unused'

function MediaPage() {
  // Not a suspense query: without a Blob store the page still opens and says why it is empty.
  const { data: items = [], isPending, error } = useQuery(mediaQuery)
  const [filter, setFilter] = useState<Filter>('all')
  const byUse = items.filter((item) => (filter === 'all' ? true : filter === 'used' ? item.usedBy.length > 0 : item.usedBy.length === 0))
  const { query, setQuery, filtered } = useMediaSearch(byUse)
  const { uploading, error: uploadError, uploadFiles } = useLibraryUpload()
  const [dragging, setDragging] = useState(false)
  const totalSize = items.reduce((sum, item) => sum + item.size, 0)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        uploadFiles([...e.dataTransfer.files].filter((f) => IMAGE_ACCEPT.split(',').includes(f.type)))
      }}
      className={`min-h-[60vh] rounded-lg transition ${dragging ? 'bg-mint-light/60 outline-dashed outline-2 outline-teal' : ''}`}
    >
      <PageHeader
        title="Media"
        subtitle="Le foto salvate nello store: riusale nelle schede dei luoghi"
        actions={
          <>
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="sr-only"
              id="media-files"
              onChange={(e) => uploadFiles(e.target.files ?? []).then(() => (e.target.value = ''))}
            />
            <label htmlFor="media-files" className={`${buttonClass.primary} cursor-pointer`}>
              {uploading ? `Caricamento di ${uploading}…` : 'Carica foto'}
            </label>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome o luogo"
          aria-label="Cerca nella libreria"
          className={`${inputClass} max-w-xs`}
        />
        <div role="group" aria-label="Mostra" className="flex gap-1">
          {(
            [
              ['all', 'Tutte'],
              ['used', 'Usate'],
              ['unused', 'Non usate'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition ${
                filter === id ? 'bg-teal text-white ring-teal' : 'ring-ink/20 hover:ring-teal'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {items.length > 0 && (
          <span className="ml-auto text-sm font-light">
            {items.length} foto · {formatSize(totalSize)}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs font-light text-ink/70">Trascina le foto sulla pagina per caricarle. JPEG, PNG, WebP o AVIF, fino a 15 MB l'una.</p>

      <div className="mt-4 space-y-3">
        {error && <Alert>{errorMessage(error)}</Alert>}
        {uploadError && <Alert>{uploadError}</Alert>}
      </div>

      {isPending ? (
        <p className="mt-6 font-serif italic text-teal">Carico la libreria…</p>
      ) : (
        !error &&
        (filtered.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-ink/20 p-10 text-center font-serif italic text-teal">
            {items.length ? 'Nessuna foto trovata.' : 'La libreria è vuota: carica le prime foto.'}
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
            {filtered.map((item) => (
              <MediaCard key={item.url} item={item} />
            ))}
          </ul>
        ))
      )}
    </div>
  )
}

function MediaCard({ item }: { item: MediaItem }) {
  const queryClient = useQueryClient()
  const { categoryOf } = useCategories()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const places = [...new Map(item.usedBy.map((use) => [use.poiId, use])).values()]

  async function remove() {
    if (!confirming) return setConfirming(true)
    setDeleting(true)
    setError(null)
    try {
      await deleteMedia({ data: { url: item.url, detach: true } })
      // The places that showed it changed too.
      await Promise.all(
        [mediaQuery.queryKey, ['admin', 'pois'], ['pois']].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      )
    } catch (e) {
      setError(errorMessage(e))
      setDeleting(false)
      setConfirming(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(item.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
      <a href={item.url} target="_blank" rel="noreferrer" className="block bg-paper">
        <img src={item.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
      </a>
      <div className="flex flex-1 flex-col p-3">
        <p className="truncate text-sm font-semibold" title={item.pathname}>
          {mediaName(item)}
        </p>
        <p className="text-xs font-light text-ink/70">
          {formatSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString('it-IT')}
        </p>
        <div className="mt-2 flex-1 text-xs">
          {places.length ? (
            <>
              <span className="font-semibold text-teal">Usata in:</span>{' '}
              {places.map((use, i) => (
                <span key={use.poiId}>
                  {i > 0 && ', '}
                  <Link
                    to="/admin/$category/$id"
                    params={{ category: categoryOf(use.category).slug, id: use.poiId }}
                    className="font-semibold hover:text-coral hover:underline"
                  >
                    {use.name}
                  </Link>
                </span>
              ))}
            </>
          ) : (
            <span className="font-light italic text-ink/60">Non usata</span>
          )}
        </div>
        {confirming && places.length > 0 && (
          <p className="mt-2 rounded-md bg-coral/10 p-2 text-xs font-semibold text-coral-dark">
            Verrà tolta anche da {places.length === 1 ? '1 luogo' : `${places.length} luoghi`} (immagine principale e galleria). Clicca
            “Conferma” per eliminarla.
          </p>
        )}
        {error && <p className="mt-2 text-xs font-semibold text-coral-dark">{error}</p>}
        <div className="mt-3 flex flex-wrap gap-1">
          <button type="button" onClick={copy} className={`${buttonClass.secondary} px-3 py-1.5 text-xs`}>
            {copied ? 'Copiato ✓' : 'Copia indirizzo'}
          </button>
          <button
            type="button"
            onClick={remove}
            onBlur={() => setConfirming(false)}
            disabled={deleting}
            className={`${buttonClass.danger} px-3 py-1.5 text-xs`}
          >
            {deleting ? 'Elimino…' : confirming ? 'Conferma' : 'Elimina'}
          </button>
        </div>
      </div>
    </li>
  )
}
