import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { uploadToLibrary } from '#/components/admin/MediaEditors'
import { mediaQuery } from '#/components/admin/queries'
import { Alert, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'

import type { MediaItem } from '#/server/media'

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

/** The file name without the folder and the random suffix Blob adds. */
export function mediaName(item: Pick<MediaItem, 'pathname'>) {
  const file = item.pathname.split('/').pop() ?? item.pathname
  return file.replace(/-[A-Za-z0-9]{20,}(?=\.[a-z0-9]+$)/i, '')
}

export const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toLocaleString('it-IT', { maximumFractionDigits: 1 })} MB`

/** Filters the library by file name, folder or the places using a photo. */
export function useMediaSearch(items: MediaItem[]) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.pathname.toLowerCase().includes(q) || item.usedBy.some((use) => use.name.toLowerCase().includes(q)))
  }, [items, query])
  return { query, setQuery, filtered }
}

/** Uploads photos to the library and refreshes it; returns the new addresses. */
export function useLibraryUpload() {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)
  async function uploadFiles(files: FileList | File[]) {
    const list = [...files]
    if (!list.length) return []
    setError(null)
    setUploading((n) => n + list.length)
    const urls: string[] = []
    await Promise.all(
      list.map(async (file) => {
        try {
          urls.push(await uploadToLibrary(file))
        } catch (e) {
          setError(`${file.name}: ${errorMessage(e)}`)
        } finally {
          setUploading((n) => n - 1)
        }
      }),
    )
    await queryClient.invalidateQueries({ queryKey: mediaQuery.queryKey })
    return urls
  }
  return { uploading, error, uploadFiles }
}

interface MediaPickerProps {
  title: string
  /** Choose several photos at once (the gallery) or one (the main image). */
  multiple?: boolean
  /** At most this many, for the gallery's limit. */
  max?: number
  /** Photos already in use here: shown as taken. */
  taken?: string[]
  onPick: (urls: string[]) => void
  onClose: () => void
}

/** A dialog to choose photos already in the Blob store, or to add new ones to it. */
export function MediaPicker({ title, multiple = false, max = Infinity, taken = [], onPick, onClose }: MediaPickerProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { data: items = [], isPending, error } = useQuery(mediaQuery)
  const { query, setQuery, filtered } = useMediaSearch(items)
  const { uploading, error: uploadError, uploadFiles } = useLibraryUpload()
  const [chosen, setChosen] = useState<string[]>([])
  const takenSet = new Set(taken)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  function toggle(url: string) {
    if (!multiple) return setChosen([url])
    setChosen((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : prev.length < max ? [...prev, url] : prev))
  }

  async function add(files: FileList | null) {
    if (!files) return
    const urls = await uploadFiles(files)
    // New photos come chosen.
    for (const url of urls) toggle(url)
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="media-picker-title"
      className="m-auto flex h-[min(46rem,calc(100dvh-2rem))] w-[min(60rem,calc(100vw-2rem))] flex-col rounded-lg bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-ink/10 p-4">
        <h2 id="media-picker-title" className="mr-auto font-display text-lg font-extrabold uppercase tracking-wide text-coral">
          {title}
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // The picker opens inside the place's form: Enter must not save it.
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          placeholder="Cerca per nome o luogo"
          aria-label="Cerca nella libreria"
          className={`${inputClass} w-56`}
        />
        <input type="file" accept={IMAGE_ACCEPT} multiple className="sr-only" id="picker-files" onChange={(e) => add(e.target.files).then(() => (e.target.value = ''))} />
        <label htmlFor="picker-files" className={`${buttonClass.secondary} cursor-pointer`}>
          {uploading ? `Caricamento di ${uploading}…` : 'Carica nuove'}
        </label>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {error && <Alert>{errorMessage(error)}</Alert>}
        {uploadError && <Alert>{uploadError}</Alert>}
        {isPending && <p className="font-serif italic text-teal">Carico la libreria…</p>}
        {!isPending && !error && filtered.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center font-serif italic text-teal">
            {query ? 'Nessuna foto trovata.' : 'La libreria è vuota: carica le prime foto.'}
          </p>
        )}
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
          {filtered.map((item) => {
            const on = chosen.includes(item.url)
            const isTaken = takenSet.has(item.url)
            return (
              <li key={item.url}>
                <button
                  type="button"
                  disabled={isTaken}
                  aria-pressed={on}
                  onClick={() => toggle(item.url)}
                  onDoubleClick={() => !multiple && onPick([item.url])}
                  className={`group relative block w-full overflow-hidden rounded-md text-left ring-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    on ? 'ring-teal' : 'ring-transparent hover:ring-mint'
                  }`}
                >
                  <img src={item.url} alt="" loading="lazy" className="aspect-square w-full bg-paper object-cover" />
                  {on && (
                    <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-teal text-xs font-bold text-white">
                      {multiple ? chosen.indexOf(item.url) + 1 : '✓'}
                    </span>
                  )}
                  <span className="block truncate px-1 pt-1 text-xs font-semibold">{mediaName(item)}</span>
                  <span className="block truncate px-1 pb-1 text-[11px] font-light text-ink/70">
                    {isTaken ? 'Già presente' : item.usedBy.length ? `Usata in ${item.usedBy.length}` : 'Non usata'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-ink/10 p-4">
        {multiple && Number.isFinite(max) && (
          <span className="mr-auto text-sm font-light">
            {chosen.length} scelte su {max} possibili
          </span>
        )}
        <button type="button" onClick={() => dialog.current?.close()} className={buttonClass.secondary}>
          Annulla
        </button>
        <button type="button" disabled={!chosen.length} onClick={() => onPick(chosen)} className={buttonClass.primary}>
          {multiple && chosen.length > 1 ? `Usa le ${chosen.length} foto` : 'Usa la foto'}
        </button>
      </footer>
    </dialog>
  )
}
