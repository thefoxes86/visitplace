import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Skyline } from '#/components/Skyline'
import { useCategories } from '#/data/categories'
import { poiNumber } from '#/data/pois'
import { usePois } from '#/data/use-pois'
import { sectionLink, sections } from '#/data/sections'

// The overlay grows as a circle from the centre of the toggle button
// (top-4 right-4, size-14 → 2.75rem from the corner).
const ORIGIN = 'at calc(100% - 2.75rem) 2.75rem'
const EASE_OUT = 'ease-[cubic-bezier(0.22,1,0.36,1)]'

export function SiteMenu() {
  const pois = usePois()
  const { categoryOf } = useCategories()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Capture phase: keep Escape from also reaching page-level handlers.
      e.stopImmediatePropagation()
      setOpen(false)
      toggle.current?.focus()
    }
    window.addEventListener('keydown', onKey, true)
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    firstLink.current?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('keydown', onKey, true)
      root.style.overflow = overflow
    }
  }, [open])

  const close = () => setOpen(false)
  /** Staggered rise-in for the n-th element once the circle has opened. */
  const rise = (n: number) => ({
    style: { transitionDelay: open ? `${250 + n * 60}ms` : '0ms' },
    className: `transition duration-700 motion-reduce:transition-none ${EASE_OUT} ${
      open ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`,
  })

  return (
    <>
      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className={`fixed right-4 top-4 z-50 grid size-14 place-items-center rounded-full shadow-lg backdrop-blur transition-colors duration-500 ${
          open ? 'bg-mint text-teal hover:bg-mint-light' : 'bg-coral text-white hover:bg-coral-dark'
        }`}
      >
        <span className="relative block h-4 w-6" aria-hidden>
          {[
            open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0',
            open ? 'top-1/2 -translate-y-1/2 scale-x-0 opacity-0' : 'top-1/2 -translate-y-1/2',
            open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0',
          ].map((position, i) => (
            <span
              key={i}
              className={`absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-500 ${EASE_OUT} ${position}`}
            />
          ))}
        </span>
      </button>

      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        style={{ clipPath: `circle(${open ? '150%' : '0%'} ${ORIGIN})` }}
        className={`fixed inset-0 z-40 overflow-y-auto bg-paper font-sans text-ink transition-[clip-path] duration-700 ease-[cubic-bezier(0.77,0,0.18,1)] motion-reduce:transition-none ${
          open ? '' : 'pointer-events-none'
        }`}
      >
        <nav className="relative mx-auto flex min-h-full max-w-6xl flex-col px-6 pb-10 pt-24 sm:px-12">
          <Link
            to="/"
            onClick={close}
            className={`flex items-end gap-3 border-b-[3px] border-teal outline-none transition duration-700 focus-visible:ring-2 focus-visible:ring-coral ${EASE_OUT} ${
              open ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0'
            }`}
          >
            <Skyline animate={false} className="w-20 shrink-0 text-teal" />
            <span className="pb-2">
              <span className="block font-display text-2xl font-extrabold uppercase leading-none tracking-wide text-coral">
                Camaiore
              </span>
              <span className="block font-serif text-sm italic text-coral">Visit</span>
            </span>
          </Link>

          <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_17rem]">
            {/* Main sections */}
            <ul>
              {sections.map((section, i) => {
                const { style, className } = rise(i)
                return (
                  <li key={section.id} style={style} className={className}>
                    <Link
                      ref={i === 0 ? firstLink : undefined}
                      {...sectionLink(section.id)}
                      onClick={close}
                      className="group flex items-end gap-4 border-b-2 border-coral/30 py-3 outline-none transition-colors hover:border-coral focus-visible:border-coral sm:gap-6"
                    >
                      <span className="w-14 shrink-0 font-display text-4xl font-light leading-none text-coral sm:w-20 sm:text-5xl">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-display text-3xl font-extrabold uppercase tracking-wide text-teal transition duration-300 group-hover:translate-x-2 group-hover:text-coral group-focus-visible:translate-x-2 group-focus-visible:text-coral sm:text-5xl">
                        {section.title}
                      </span>
                      <span className="hidden pb-1 font-serif text-sm italic text-ink/70 md:block">
                        {section.tagline}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* The map and its places */}
            <div {...rise(sections.length)}>
              <Link
                to="/mappa"
                onClick={close}
                activeOptions={{ includeSearch: false }}
                className="group signpost-left flex items-center justify-center gap-2 bg-mint py-3 pl-10 pr-4 font-display text-lg font-semibold uppercase tracking-[0.12em] text-teal outline-none transition-colors hover:bg-coral hover:text-white focus-visible:bg-coral focus-visible:text-white"
              >
                Mappa turistica
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <div className="mt-6 border-l-[6px] border-mint">
                <p className="signpost-right -ml-1.5 bg-mint py-2 pl-5 pr-10 font-display font-semibold uppercase tracking-[0.15em] text-teal">
                  Luoghi
                </p>
                <ul className="space-y-2 py-4 pl-5">
                  {pois.map((place) => (
                    <li key={place.id}>
                      <Link
                        to="/luoghi/$poiId"
                        params={{ poiId: place.id }}
                        onClick={close}
                        className="group flex items-center gap-2 text-sm font-light outline-none transition-colors hover:text-coral focus-visible:text-coral focus-visible:underline"
                      >
                        <span
                          className="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: categoryOf(place.category).color }}
                        >
                          {poiNumber(place)}
                        </span>
                        {place.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <footer
            style={{ transitionDelay: open ? `${300 + (sections.length + 1) * 60}ms` : '0ms' }}
            className={`mt-auto flex flex-wrap justify-between gap-2 pt-12 text-xs italic text-ink/70 transition duration-700 ${EASE_OUT} ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span>Camaiore · Versilia, Toscana</span>
            <span>43.94° N · 10.30° E</span>
          </footer>
        </nav>
      </div>
    </>
  )
}
