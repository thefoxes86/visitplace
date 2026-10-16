import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { CategoryCards, useSectionCategories } from '#/components/CategoryPage'
import { Skyline } from '#/components/Skyline'
import { Compass } from '#/components/tourist-map/TouristMap'
import { useCategories } from '#/data/categories'
import { formatEventDate, poiImage, poiNumber } from '#/data/pois'
import { usePois } from '#/data/use-pois'
import { sectionLink, sections } from '#/data/sections'
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl, seo } from '#/lib/seo'

import type { Poi } from '#/data/pois'

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      path: '/',
      jsonLd: {
        '@graph': [
          { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/'), inLanguage: 'it-IT' },
          {
            '@type': 'TouristDestination',
            name: 'Camaiore',
            description: DEFAULT_DESCRIPTION,
            url: absoluteUrl('/'),
            geo: { '@type': 'GeoCoordinates', latitude: 43.94, longitude: 10.3 },
            containedInPlace: { '@type': 'AdministrativeArea', name: 'Versilia, Toscana, Italia' },
          },
        ],
      },
    }),
  component: Home,
})

const TITLE = 'Camaiore'

/** Upcoming events and things to do shown on the home page. */
const EVENTS_SHOWN = 4
const THINGS_TO_DO_SHOWN = 6
const PICKS_SHOWN = 4

function shuffle<T>(list: T[]) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function Home() {
  const pois = usePois()
  const { categories, categoryOf, subtree } = useCategories()
  const featured = pois.filter((poi) => poi.featured)
  const isEvent = (poi: Poi) => categoryOf(poi.category).type === 'event'

  // The first place of each category, from categories in random order.
  const firstOfEach = categories.flatMap((c) => pois.find((poi) => poi.category === c.id) ?? [])
  // Shuffled after hydration, so the server and the first client render agree.
  const [picks, setPicks] = useState(() => firstOfEach.slice(0, PICKS_SHOWN))
  useEffect(() => setPicks(shuffle(firstOfEach).slice(0, PICKS_SHOWN)), [pois, categories])

  const now = new Date()
  const upcoming = pois
    .filter((poi) => isEvent(poi) && poi.startsAt && (poi.endsAt ?? poi.startsAt) >= now)
    .sort((a, b) => a.startsAt!.getTime() - b.startsAt!.getTime())
    .slice(0, EVENTS_SHOWN)

  const scopriIds = new Set(useSectionCategories('scopri').flatMap((c) => [...subtree(c.id)]))
  const thingsToDo = pois.filter((poi) => scopriIds.has(poi.category) && !isEvent(poi)).slice(0, THINGS_TO_DO_SHOWN)

  const featuredCategories = categories.filter((c) => c.featured)

  return (
    <main className="min-h-dvh bg-paper font-sans text-ink">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-24 sm:px-12">
        {/* Skyline + title, standing on one baseline */}
        <header className="flex flex-col-reverse items-start gap-4 border-b-[3px] border-teal md:flex-row md:items-end md:gap-8">
          <Skyline className="w-36 shrink-0 text-teal md:w-40 lg:w-60" />
          <div className="min-w-0 md:pb-3">
            <h1
              aria-label={`Visit ${TITLE}`}
              className="font-display text-[min(13vw,4.5rem)] md:text-[7vw] xl:text-[6.5rem] font-extrabold uppercase leading-none tracking-wide text-coral"
            >
              <span aria-hidden className="block">
                {[...TITLE].map((letter, i) => (
                  // Each letter rises out of its own mask.
                  <span key={i} className="inline-block overflow-hidden align-bottom">
                    <span className="hero-letter inline-block" style={{ animationDelay: `${600 + i * 60}ms` }}>
                      {letter}
                    </span>
                  </span>
                ))}
              </span>
            </h1>
            <p
              className="hero-fade mt-1 font-serif text-lg italic text-coral sm:text-2xl"
              style={{ animationDelay: '1200ms' }}
            >
              Dalle Apuane al mare della Versilia
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem_16rem] lg:gap-0">
          {/* Intro, sections and the map */}
          <div className="hero-fade lg:pr-10" style={{ animationDelay: '1300ms' }}>
            <p className="max-w-xl font-light leading-relaxed">
              Camaiore è una delle perle della Versilia. Il centro storico medievale, raccolto attorno alla
              Collegiata e a Piazza San Bernardino, si apre su colline di ulivi e borghi di pietra che salgono
              verso le Alpi Apuane. A pochi chilometri, il Lido di Camaiore offre spiagge di sabbia fine, il
              pontile e la passeggiata sul mare. Un solo comune, dal mare ai monti.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Link
                to="/mappa"
                className="group grid size-52 shrink-0 place-items-center rounded-full bg-mint-light p-8 text-center ring-1 ring-mint ring-offset-8 ring-offset-paper transition hover:bg-mint"
              >
                <span>
                  <span className="block text-sm font-light leading-snug">Ristoranti, B&B, cultura ed eventi, dal centro al Lido</span>
                  <span className="mt-2 inline-flex items-center gap-1 font-semibold text-teal">
                    La mappa turistica
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </span>
              </Link>
              <Compass className="size-36 shrink-0" />
            </div>

            {/* Sections, framed like the legend of the map */}
            <section className="relative mt-14 border-2 border-coral px-5 pb-5 pt-8">
              <h2 className="absolute -top-4 left-4 bg-paper px-2 font-display text-2xl font-semibold uppercase tracking-[0.15em] text-coral">
                Sezioni
              </h2>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <Link
                      {...sectionLink(section.id)}
                      className="group flex items-center gap-3 rounded-sm py-1 outline-none focus-visible:ring-2 focus-visible:ring-coral"
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center text-xs font-semibold transition-colors group-hover:bg-coral group-hover:text-white ${
                          i % 2 ? 'bg-teal text-white' : 'bg-mint-light text-teal'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <span className="block font-semibold text-teal transition-colors group-hover:text-coral">
                          {section.title}
                        </span>
                        <span className="block text-xs font-light">{section.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Main attractions, hanging off the signpost */}
          <section className="hero-fade" style={{ animationDelay: '1450ms' }}>
            <h2 className="signpost-left mt-16 bg-mint py-2 pl-10 pr-4 text-center font-display text-lg font-semibold uppercase leading-tight tracking-[0.12em] text-teal lg:mt-20">
              Principali attrazioni
            </h2>
            <ul className="mt-8 space-y-8 lg:pr-4">
              {featured.map((place) => (
                <li key={place.id}>
                  <Link
                    to="/luoghi/$poiId"
                    params={{ poiId: place.id }}
                    className="group grid grid-cols-[1fr_7rem] items-center gap-4"
                  >
                    <span className="text-right">
                      <span className="block border-b-2 border-coral font-display text-6xl font-light leading-none text-coral">
                        {poiNumber(place)}
                      </span>
                      <span className="mt-2 block text-sm leading-snug transition-colors group-hover:text-coral">
                        {place.name}
                      </span>
                    </span>
                    <img
                      src={poiImage(place, 300)}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* A few places from random categories, along the signpost's pole */}
          <section className="hero-fade border-l-[6px] border-mint" style={{ animationDelay: '1600ms' }}>
            <h2 className="signpost-right -ml-1.5 bg-mint py-3 pl-6 pr-10 font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">
              Da scoprire
            </h2>
            <ul className="space-y-6 py-6 pl-6">
              {picks.map((place) => {
                const category = categoryOf(place.category)
                return (
                  <li key={place.id}>
                    <Link to="/luoghi/$poiId" params={{ poiId: place.id }} className="group block">
                      <img
                        src={poiImage(place, 400)}
                        alt=""
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                      />
                      <span className="mt-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: category.color }}>
                        {category.label}
                      </span>
                      <span className="block font-display text-lg font-semibold leading-tight text-teal transition-colors group-hover:text-coral">
                        {place.name}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>

      {/* Upcoming events, on a band of their own */}
      {upcoming.length > 0 && (
        <section className="bg-teal text-paper">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-mint/40 pb-4">
              <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.15em] sm:text-4xl">Prossimi eventi</h2>
              <Link {...sectionLink('vivi')} className="group font-serif italic text-mint hover:underline">
                Tutti gli eventi <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <Link to="/luoghi/$poiId" params={{ poiId: event.id }} className="group block">
                    <img
                      src={poiImage(event, 400)}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                    />
                    <span className="mt-4 block font-serif text-sm italic text-mint">{formatEventDate(event.startsAt!)}</span>
                    <span className="mt-1 block font-display text-xl font-semibold leading-tight transition-colors group-hover:text-coral">
                      {event.name}
                    </span>
                    <span className="mt-1 block text-sm font-light text-paper/80">{event.area}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-6 pb-12 sm:px-12">
        {/* Things to do, from the categories of the Scopri section */}
        {thingsToDo.length > 0 && (
          <section className="pt-20">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-teal pb-4">
              <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.15em] text-coral sm:text-4xl">Cosa fare</h2>
              <Link {...sectionLink('scopri')} className="group font-serif italic text-coral hover:underline">
                Scopri Camaiore <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {thingsToDo.map((place) => (
                <li key={place.id}>
                  <Link to="/luoghi/$poiId" params={{ poiId: place.id }} className="group block">
                    <span className="relative block">
                      <img
                        src={poiImage(place, 600)}
                        alt=""
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                      />
                      <span className="absolute -bottom-4 left-4 bg-paper px-2 font-display text-5xl font-light leading-none text-coral">
                        {poiNumber(place)}
                      </span>
                    </span>
                    <span className="mt-6 block font-display text-xl font-semibold text-teal transition-colors group-hover:text-coral">
                      {place.name}
                    </span>
                    <span className="mt-1 block font-serif italic text-coral">{place.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Categories featured in the admin */}
        {featuredCategories.length > 0 && (
          <section className="pt-20">
            <h2 className="border-b-[3px] border-teal pb-4 font-display text-3xl font-semibold uppercase tracking-[0.15em] text-coral sm:text-4xl">
              In evidenza
            </h2>
            <CategoryCards list={featuredCategories} className="mt-10 sm:grid-cols-2 lg:grid-cols-3" />
          </section>
        )}

        <footer className="mt-16 flex flex-wrap justify-between gap-2 text-xs italic text-ink/70">
          <span>Camaiore · Versilia, Toscana</span>
          <span>43.94° N · 10.30° E</span>
        </footer>
      </div>
    </main>
  )
}
