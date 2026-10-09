import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'

import { categoryColors, categoryLabels, places } from '#/data/places'

// The overlay grows as a circle from the centre of the toggle button
// (top-4 right-4, size-14 → 2.75rem from the corner).
const ORIGIN = 'at calc(100% - 2.75rem) 2.75rem'
const EASE_OUT = 'ease-[cubic-bezier(0.22,1,0.36,1)]'

export function SiteMenu() {
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
  const items = [
    { key: 'map', label: 'The map', note: 'Explore', color: '#ffffff', to: '/' as const },
    ...places.map((place) => ({
      key: place.id,
      label: place.name,
      note: categoryLabels[place.category],
      color: categoryColors[place.category],
      placeId: place.id,
    })),
  ]

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
          open ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/80 text-slate-900 hover:bg-white'
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
        className={`fixed inset-0 z-40 overflow-y-auto bg-slate-950 text-white transition-[clip-path] duration-700 ease-[cubic-bezier(0.77,0,0.18,1)] motion-reduce:transition-none ${
          open ? '' : 'pointer-events-none'
        }`}
      >
        {/* Soft sea-and-sunset glows behind the links */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_40rem_at_100%_0%,rgba(17,138,178,0.35),transparent),radial-gradient(50rem_35rem_at_0%_100%,rgba(231,111,81,0.25),transparent)]"
        />

        <nav className="relative mx-auto flex min-h-full max-w-6xl flex-col px-6 pb-10 pt-24 sm:px-12">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.3em] text-white/50 transition duration-700 ${EASE_OUT} ${
              open ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0'
            }`}
          >
            Visit Camaiore
          </p>

          <ul className="mt-6">
            {items.map((item, i) => {
              const className =
                'group flex items-baseline gap-4 border-b border-white/10 py-3 outline-none focus-visible:bg-white/5 sm:gap-6'
              const content = (
                <>
                  <span className="w-8 shrink-0 font-mono text-xs text-white/40">{String(i).padStart(2, '0')}</span>
                  <span className="flex-1 text-3xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-2 group-focus-visible:translate-x-2 sm:text-5xl">
                    {item.label}
                  </span>
                  <span className="hidden items-center gap-2 text-sm text-white/50 sm:flex">
                    <span
                      className="size-2.5 scale-0 rounded-full transition-transform duration-300 group-hover:scale-100 group-focus-visible:scale-100"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.note}
                  </span>
                </>
              )
              return (
                <li
                  key={item.key}
                  // Links rise in one after another once the circle has opened.
                  style={{ transitionDelay: open ? `${250 + i * 60}ms` : '0ms' }}
                  className={`transition duration-700 motion-reduce:transition-none ${EASE_OUT} ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  {'placeId' in item ? (
                    <Link
                      to="/places/$placeId"
                      params={{ placeId: item.placeId! }}
                      onClick={close}
                      className={className}
                      activeProps={{ 'aria-current': 'page' }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <Link
                      ref={firstLink}
                      to={item.to}
                      onClick={close}
                      className={className}
                      activeOptions={{ exact: true, includeSearch: false }}
                    >
                      {content}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          <footer
            style={{ transitionDelay: open ? `${300 + items.length * 60}ms` : '0ms' }}
            className={`mt-auto flex flex-wrap justify-between gap-2 pt-12 text-sm text-white/50 transition duration-700 ${EASE_OUT} ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span>Camaiore · Versilia, Tuscany</span>
            <span className="font-mono">43.94° N · 10.30° E</span>
          </footer>
        </nav>
      </div>
    </>
  )
}
