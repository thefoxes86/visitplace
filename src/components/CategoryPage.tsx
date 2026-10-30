import { Link } from '@tanstack/react-router'

import type { LinkComponentProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Skyline } from '#/components/Skyline'
import { CategoryIcon } from '#/components/tourist-map/CategoryIcon'
import { categoryLink, useCategories } from '#/data/categories'
import { isListType } from '#/lib/category-types'
import { poiImage, poiNumber } from '#/data/pois'
import { usePois } from '#/data/use-pois'
import { getSection, sectionLink, sections } from '#/data/sections'

import type { Category } from '#/data/categories'
import type { Poi } from '#/data/pois'

interface CategoryPageProps {
  /** Id in src/data/sections.ts: gives the title and tagline. */
  sectionId: string
  intro: string
}

/** A section page: the cards of the categories put in the section in the admin. */
export function CategoryPage({ sectionId, intro }: CategoryPageProps) {
  const section = getSection(sectionId)!
  const list = useSectionCategories(sectionId)

  return (
    <PageShell
      back={{ to: '/', label: 'Home' }}
      eyebrow={`${list.length} ${list.length === 1 ? 'categoria' : 'categorie'}`}
      title={section.title}
      tagline={section.tagline}
      aside={<OtherSections current={section.id} />}
    >
      <p className="max-w-2xl text-lg font-light leading-relaxed">{intro}</p>
      {list.length > 0 ? (
        <CategoryCards list={list} />
      ) : (
        <p className="relative mt-14 border-2 border-coral px-5 py-6 font-serif italic text-coral">
          Stiamo raccogliendo i luoghi di questa sezione: torna presto, o intanto esplora la mappa turistica.
        </p>
      )}
      <MapButton />
    </PageShell>
  )
}

/** Top-level categories of a section, in menu order. */
export const useSectionCategories = (sectionId: string) => useCategories().roots.filter((c) => c.section === sectionId)

/** Icon, name and size of a category, above a page title. */
export function CategoryEyebrow({ category }: { category: Category }) {
  const { categories, subtree } = useCategories()
  const ids = subtree(category.id)
  const count = usePois().filter((poi) => ids.has(poi.category)).length
  const children = categories.filter((c) => c.parentId === category.id).length
  return (
    <span className="flex items-center gap-2" style={{ color: category.color }}>
      <span className="grid size-6 place-items-center rounded-sm text-white" style={{ backgroundColor: category.color }}>
        <CategoryIcon id={category.id} className="size-3.5" />
      </span>
      {category.label} ·{' '}
      {children > 0 || isListType(category.type) ? `${children} ${children === 1 ? 'categoria' : 'categorie'}` : placesCount(count)}
    </span>
  )
}

/**
 * What a category shows: the cards of its subcategories when it has any (a list always does),
 * then its own places.
 */
export function CategoryContent({ category }: { category: Category }) {
  const children = useCategories().categories.filter((c) => c.parentId === category.id)
  const own = usePois().filter((poi) => poi.category === category.id)
  const comingSoon = (
    <p className="relative mt-14 border-2 border-coral px-5 py-6 font-serif italic text-coral">
      Stiamo raccogliendo i luoghi di questa categoria: torna presto.
    </p>
  )

  if (!children.length && !isListType(category.type)) return own.length ? <PoiList items={own} /> : comingSoon
  return (
    <>
      {children.length ? <CategoryCards list={children} /> : comingSoon}
      {own.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">Luoghi</h2>
          <PoiList items={own} />
        </section>
      )}
    </>
  )
}

/** A card for each category, opening its own page. */
export function CategoryCards({ list, className = 'mt-12 sm:grid-cols-2' }: { list: Category[]; className?: string }) {
  const { categories, subtree } = useCategories()
  const pois = usePois()

  return (
    <ul className={`grid gap-x-8 gap-y-10 ${className}`}>
      {list.map((child, i) => {
        const ids = subtree(child.id)
        const inside = pois.filter((poi) => ids.has(poi.category))
        const nested = categories.filter((c) => c.parentId === child.id).length
        return (
          <li key={child.id}>
            <Link {...categoryLink(child)} className="group block">
              <span className="relative block">
                {/* The photo of its first place, or a demo image. */}
                <img
                  src={inside[0] ? poiImage(inside[0], 600) : `https://picsum.photos/seed/camaiore-categoria-${child.id}/600/600`}
                  alt=""
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                />
                <span className="absolute -bottom-4 left-4 bg-paper px-2 font-display text-5xl font-light leading-none text-coral">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </span>
              <span className="mt-6 block border-b-2 border-coral/30 pb-3 transition-colors group-hover:border-coral">
                <span className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-[0.1em] text-teal transition-colors group-hover:text-coral">
                  <span className="grid size-6 place-items-center rounded-sm text-white" style={{ backgroundColor: child.color }}>
                    <CategoryIcon id={child.id} className="size-3.5" />
                  </span>
                  {child.label}
                </span>
                <span className="mt-2 flex items-center justify-between text-xs font-light">
                  {isListType(child.type)
                    ? `${nested} ${nested === 1 ? 'categoria' : 'categorie'}`
                    : inside.length > 0
                      ? placesCount(inside.length)
                      : 'In arrivo'}
                  <span className="font-semibold text-teal transition-transform group-hover:translate-x-1">→</span>
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export const placesCount = (n: number) => `${n} ${n === 1 ? 'luogo' : 'luoghi'}`

interface PageShellProps {
  back: { label: string } & Pick<LinkComponentProps, 'to' | 'params'>
  eyebrow: ReactNode
  title: string
  tagline: string
  aside: ReactNode
  /** The main column takes the whole page, with no signpost column. */
  wide?: boolean
  children: ReactNode
}

/** Skyline header, main column and a signpost column, as on the place pages. */
export function PageShell({ back: { label, ...back }, eyebrow, title, tagline, aside, wide = false, children }: PageShellProps) {
  return (
    <main className="min-h-dvh bg-paper font-sans text-ink">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-24 sm:px-12">
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

        {wide ? (
          <div className="hero-fade mt-10" style={{ animationDelay: '750ms' }}>
            {children}
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-0">
            <div className="hero-fade lg:pr-12" style={{ animationDelay: '750ms' }}>
              {children}
            </div>
            <div className="hero-fade self-start" style={{ animationDelay: '900ms' }}>
              {aside}
            </div>
          </div>
        )}

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
                {poiNumber(poi) ?? '·'}
              </span>
              <img
                src={poiImage(poi, 480)}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
              />
              <span className="min-w-0">
                <span className="block font-display text-xl font-semibold text-teal transition-colors group-hover:text-coral">
                  {poi.number !== null && <span className="text-coral sm:hidden">{poiNumber(poi)} · </span>}
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
