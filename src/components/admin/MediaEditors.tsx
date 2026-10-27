import { useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { upload } from '@vercel/blob/client'

import { Card, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { MAX_PHOTOS, parseGpx } from '#/lib/media'
import { slugify } from '#/lib/poi-input'

import type { GalleryPhoto, Track } from '#/lib/media'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

/** Sends a photo to Vercel Blob (through /api/upload, which checks the user) and returns its address. */
export async function uploadPhoto(file: File, poiId: string) {
  const dot = file.name.lastIndexOf('.')
  const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name) || 'foto'
  const ext = dot > 0 ? file.name.slice(dot).toLowerCase() : ''
  const blob = await upload(`luoghi/${poiId || 'nuovo'}/${base}${ext}`, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    contentType: file.type,
  })
  return blob.url
}

interface GalleryEditorProps {
  poiId: string
  photos: GalleryPhoto[]
  /** A state setter: uploads finishing together each add their photo. */
  onChange: Dispatch<SetStateAction<GalleryPhoto[]>>
  error?: string
}

/** Photos of a place: upload several at once, caption, reorder and remove them. */
export function GalleryEditor({ poiId, photos, onChange, error }: GalleryEditorProps) {
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  async function add(files: FileList | null) {
    if (!files?.length) return
    setUploadError(null)
    const room = MAX_PHOTOS - photos.length
    const chosen = [...files].slice(0, room)
    if (files.length > room) setUploadError(`Si possono avere al massimo ${MAX_PHOTOS} foto: ne ho caricate ${room}.`)
    setUploading((n) => n + chosen.length)
    await Promise.all(
      chosen.map(async (file) => {
        try {
          const url = await uploadPhoto(file, poiId)
          onChange((prev) => [...prev, { url, caption: '' }])
        } catch (e) {
          setUploadError(`${file.name}: ${errorMessage(e)}`)
        } finally {
          setUploading((n) => n - 1)
        }
      }),
    )
    if (input.current) input.current.value = ''
  }

  const update = (i: number, photo: Partial<GalleryPhoto>) => onChange(photos.map((p, j) => (j === i ? { ...p, ...photo } : p)))
  const move = (i: number, by: number) => {
    const next = [...photos]
    ;[next[i], next[i + by]] = [next[i + by], next[i]]
    onChange(next)
  }

  return (
    <Card title="Galleria fotografica">
      <p className="text-sm font-light">
        Le foto compaiono nella pagina, in quest'ordine, sotto la descrizione. JPEG, PNG, WebP o AVIF, fino a 15 MB l'una.
      </p>
      {photos.length > 0 && (
        <ul className="mt-4 space-y-3">
          {photos.map((photo, i) => (
            <li key={photo.url} className="flex items-start gap-3 rounded-md border border-ink/10 p-2">
              <img src={photo.url} alt="" className="size-20 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor={`caption-${i}`}>
                  Didascalia della foto {i + 1}
                </label>
                <input
                  id={`caption-${i}`}
                  value={photo.caption}
                  maxLength={200}
                  placeholder="Didascalia (facoltativa)"
                  onChange={(e) => update(i, { caption: e.target.value })}
                  className={inputClass}
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={buttonClass.secondary} aria-label="Sposta prima">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === photos.length - 1}
                    onClick={() => move(i, 1)}
                    className={buttonClass.secondary}
                    aria-label="Sposta dopo"
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className={buttonClass.danger}>
                    Rimuovi
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input ref={input} type="file" accept={IMAGE_ACCEPT} multiple className="sr-only" id="gallery-files" onChange={(e) => add(e.target.files)} />
        <label htmlFor="gallery-files" className={`${buttonClass.secondary} cursor-pointer ${photos.length >= MAX_PHOTOS ? 'pointer-events-none opacity-50' : ''}`}>
          Aggiungi foto
        </label>
        {uploading > 0 && (
          <span className="text-sm font-light" aria-live="polite">
            Caricamento di {uploading} foto…
          </span>
        )}
      </div>
      {(uploadError || error) && <p className="mt-2 text-xs font-semibold text-coral-dark">{uploadError ?? error}</p>}
      <p className="mt-3 text-xs font-light text-ink/70">Le foto rimosse spariscono dalla pagina al salvataggio.</p>
    </Card>
  )
}

interface TrackEditorProps {
  track: Track | null
  onChange: (track: Track | null) => void
  /** Moves the place's position to the start of the track. */
  onUseStart: (lat: number, lon: number) => void
  error?: string
}

/** GPS track of a place, read from a .gpx file in the browser. */
export function TrackEditor({ track, onChange, onUseStart, error }: TrackEditorProps) {
  const input = useRef<HTMLInputElement>(null)
  const [readError, setReadError] = useState<string | null>(null)

  async function read(file: File | undefined) {
    if (!file) return
    setReadError(null)
    try {
      onChange(parseGpx(await file.text()))
    } catch (e) {
      setReadError(errorMessage(e))
    }
    if (input.current) input.current.value = ''
  }

  return (
    <Card title="Traccia GPS">
      <p className="text-sm font-light">
        Carica un file .gpx (da Wikiloc, Komoot, Strava, un GPS…): il percorso compare su una mappa nella pagina, con lunghezza,
        dislivello e il file da scaricare.
      </p>
      {track && (
        <div className="mt-4 rounded-md bg-mint-light/60 p-3 text-sm">
          {track.name && <p className="font-semibold text-teal">{track.name}</p>}
          <p className="mt-1">
            {track.length.toLocaleString('it-IT')} km
            {track.gain !== null && ` · ↗ ${track.gain} m · ↘ ${track.loss} m`}
            {track.minEle !== null && ` · quota ${track.minEle}–${track.maxEle} m`}
          </p>
          <p className="mt-1 text-xs font-light">{track.points.length} punti dopo la semplificazione.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={buttonClass.secondary} onClick={() => onUseStart(track.points[0][0], track.points[0][1])}>
              Usa la partenza come posizione
            </button>
            <button type="button" className={buttonClass.danger} onClick={() => onChange(null)}>
              Rimuovi la traccia
            </button>
          </div>
        </div>
      )}
      <div className="mt-4">
        <input ref={input} type="file" accept=".gpx,application/gpx+xml" className="sr-only" id="track-file" onChange={(e) => read(e.target.files?.[0])} />
        <label htmlFor="track-file" className={`${buttonClass.secondary} cursor-pointer`}>
          {track ? 'Sostituisci il file .gpx' : 'Carica un file .gpx'}
        </label>
      </div>
      {(readError || error) && <p className="mt-2 text-xs font-semibold text-coral-dark">{readError ?? error}</p>}
    </Card>
  )
}
