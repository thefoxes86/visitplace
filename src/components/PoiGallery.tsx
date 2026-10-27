import { useEffect, useRef, useState } from 'react'

import type { GalleryPhoto } from '#/lib/media'

/** The photos of a place: a grid of thumbnails, each opening a full-screen viewer. */
export function PoiGallery({ photos, name }: { photos: GalleryPhoto[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open !== null && !el.open) el.showModal()
    if (open === null && el.open) el.close()
  }, [open])

  if (!photos.length) return null
  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + photos.length) % photos.length))
  const current = open === null ? null : photos[open]

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">Galleria</h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <li key={photo.url} className={i === 0 && photos.length > 2 ? 'col-span-2 row-span-2' : ''}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block size-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-coral"
              aria-label={photo.caption ? `Apri la foto: ${photo.caption}` : `Apri la foto ${i + 1} di ${photos.length}`}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                loading="lazy"
                className="aspect-square size-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={`Foto di ${name}`}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/90"
      >
        {current && (
          <figure className="flex h-dvh w-screen flex-col items-center justify-center gap-3 p-4 sm:p-10">
            <img src={current.url} alt={current.caption} className="max-h-[80dvh] max-w-full object-contain" />
            <figcaption className="text-center font-serif italic text-paper">
              {current.caption}
              <span className="ml-2 text-sm not-italic text-paper/70">
                {open! + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        )}
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="fixed right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] grid size-11 place-items-center rounded-full bg-paper/10 text-2xl text-paper hover:bg-paper/20"
          aria-label="Chiudi"
        >
          ×
        </button>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              className="fixed left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-2xl text-paper hover:bg-paper/20 sm:left-4"
              aria-label="Foto precedente"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="fixed right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-2xl text-paper hover:bg-paper/20 sm:right-4"
              aria-label="Foto successiva"
            >
              ›
            </button>
          </>
        )}
      </dialog>
    </section>
  )
}
