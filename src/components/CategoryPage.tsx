import { Link } from '@tanstack/react-router'

import type { LinkComponentProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Skyline } from '#/components/Skyline'
import { CategoryIcon } from '#/components/tourist-map/CategoryIcon'
import { poiCategory, poiImage, poiNumber } from '#/data/pois'
import { usePois } from '#/data/use-pois'
import { getSection, sectionLink, sections } from '#/data/sections'

import type { Poi, PoiCategory } from '#/data/pois'

interface CategoryPageProps {
  /** Id in src/data/sections.ts: gives the title and tagline. */
  sectionId: string
  /** Which points of the map the page lists. */
  category: PoiCategory
  intro: string
}

/** A section page listing every place of one category, grouped by area. */
export function CategoryPage({ sectionId, category: categoryId, intro }: CategoryPageProps) {
  const section = getSection(sectionId)!
  const category = poiCategory(categoryId)
  const items = usePois().filter((poi) => poi.category === categoryId)

  return (
    <PageShell
      back={{ to: '/', label: 'Home' }}
      eyebrow={
        <span className="flex items-center gap-2" style={{ color: category.color }}>
          <span className="grid size-6 place-items-center rounded-sm text-white" style={{ backgroundColor: category.color }}>
            <CategoryIcon id={categoryId} className="size-3.5" />
          </span>
          {category.label} · {placesCount(items.length)}
        </span>
      }
      title={section.title}
      tagline={section.tagline}
      aside={<OtherSections current={section.id} />}
    >
      <p className="max-w-2xl text-lg font-light leading-relaxed">{intro}</p>
      <PoiList items={items} />
      <MapButton />
    </PageShell>
  )
}

export const placesCount = (n: number) => `${n} ${n === 1 ? 'luogo' : 'luoghi'}`

interface PageShellProps {
  back: { label: string } & Pick<LinkComponentProps, 'to' | 'params'>
  eyebrow: ReactNode
  title: string
  tagline: string
  aside: ReactNode
  children: ReactNode
}

/** Skyline header, main column and a signpost column, as on the place pages. */
export function PageShell({ back: { label, ...back }, eyebrow, title, tagline, aside, children }: PageShellProps) {
  return (
    <main className="min-h-dvh bg-paper font-sans text-ink">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-24 sm:px-12">
        <Link {...back} className="hero-fade font-serif text-sm italic text-coral hover:underline">
          ← {label}
        </Link>

        {/* Skyline + title, standing on one baseline, as on the home page */}
        <header className="mt-4 flex flex-col-reverse items-start gap-4 border-b-[3px] border-teal md:flex-row md:items-end md:gap-8">
          <Skyline className="w-28 shrink-0 text-teal md:w-36 lg:w-44" />
          <div className="min-w-0 md:pb-3">
            <div
              className="hero-fade text-xs font-semibold uppercase tracking-[0.2em] text-teal"
              style={{ animationDelay: '300ms' }}
            >
              {eyebrow}
            </div>
            <h1
              className="hero-fade mt-2 font-display text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold uppercase leading-[0.95] tracking-wide text-coral"
              style={{ animationDelay: '450ms' }}
            >
              {title}
            </h1>
            <p
              className="hero-fade mt-2 font-serif text-lg italic text-coral sm:text-xl"
              style={{ animationDelay: '600ms' }}
            >
              {tagline}
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-0">
          <div className="hero-fade lg:pr-12" style={{ animationDelay: '750ms' }}>
            {children}
          </div>
          <div className="hero-fade self-start" style={{ animationDelay: '900ms' }}>
            {aside}
          </div>
        </div>

        <footer className="mt-12 flex flex-wrap justify-between gap-2 text-xs italic text-ink/70">
          <span>Camaiore · Versilia, Toscana</span>
          <span>43.94° N · 10.30° E</span>
        </footer>
      </div>
    </main>
  )
}

/** Places grouped by area, each linking to its own page. */
export function PoiList({ items }: { items: Poi[] }) {
  const areas = [...new Set(items.map((poi) => poi.area))].map((area) => ({
    area,
    list: items.filter((poi) => poi.area === area),
  }))

  return areas.map(({ area, list }) => (
    <section key={area} className="mt-14">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">{area}</h2>
      <ul className="mt-6 space-y-10">
        {list.map((poi) => (
          <li key={poi.id}>
            <Link
              to="/luoghi/$poiId"
              params={{ poiId: poi.id }}
              className="group grid items-start gap-5 sm:grid-cols-[5rem_12rem_minmax(0,1fr)]"
            >
              <span className="hidden border-b-2 border-coral text-right font-display text-6xl font-light leading-none text-coral sm:block">
                {poiNumber(poi)}
              </span>
              <img
                src={poiImage(poi, 480)}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
              />
              <span className="min-w-0">
                <span className="block font-display text-xl font-semibold text-teal transition-colors group-hover:text-coral">
                  <span className="text-coral sm:hidden">{poiNumber(poi)} · </span>
                  {poi.name}
                </span>
                <span className="mt-1 block font-serif italic text-coral">{poi.summary}</span>
                <span className="mt-2 block text-sm font-light leading-relaxed">{poi.description}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                  Scopri di più
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ))
}

export function MapButton() {
  return (
    <Link
      to="/mappa"
      className="signpost-right mt-14 inline-block bg-mint py-3 pl-5 pr-12 font-display font-semibold uppercase tracking-[0.12em] text-teal transition-colors hover:bg-coral hover:text-white"
    >
      Vedi sulla mappa
    </Link>
  )
}

interface SignpostNavProps {
  title: string
  items: { key: string; number: number; title: string; tagline: string; link: Pick<LinkComponentProps, 'to' | 'params' | 'hash'> }[]
}

/** A list of links hanging along the signpost's pole. */
export function SignpostNav({ title, items }: SignpostNavProps) {
  return (
    <nav aria-label={title} className="border-l-[6px] border-mint">
      <h2 className="signpost-right -ml-1.5 bg-mint py-3 pl-6 pr-10 font-display text-xl font-semibold uppercase tracking-[0.12em] whitespace-nowrap text-teal">
        {title}
      </h2>
      <ul className="space-y-4 py-6 pl-6">
        {items.map((item, i) => (
          <li key={item.key}>
            <Link {...item.link} className="group flex items-center gap-3">
              <span
                className={`grid size-9 shrink-0 place-items-center text-xs font-semibold transition-colors group-hover:bg-coral group-hover:text-white ${
                  i % 2 ? 'bg-teal text-white' : 'bg-mint-light text-teal'
                }`}
              >
                {String(item.number).padStart(2, '0')}
              </span>
              <span>
                <span className="block font-semibold text-teal transition-colors group-hover:text-coral">{item.title}</span>
                <span className="block text-xs font-light">{item.tagline}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function OtherSections({ current }: { current: string }) {
  return (
    <SignpostNav
      title="Altre sezioni"
      items={sections
        .map((s, i) => ({ key: s.id, number: i + 1, title: s.title, tagline: s.tagline, link: sectionLink(s.id) }))
        .filter((s) => s.key !== current)}
    />
  )
}
