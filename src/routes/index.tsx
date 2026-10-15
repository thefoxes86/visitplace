import { Link, createFileRoute } from '@tanstack/react-router'

import { Skyline } from '#/components/Skyline'
import { Compass } from '#/components/tourist-map/TouristMap'
import { useCategories } from '#/data/categories'
import { poiImage, poiNumber } from '#/data/pois'
import { usePois } from '#/data/use-pois'
import { sectionLink, sections } from '#/data/sections'
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl, seo } from '#/lib/seo'

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

function Home() {
  const pois = usePois()
  const { categories } = useCategories()
  const poisByCategory = categories.map((category) => ({
    ...category,
    list: pois.filter((poi) => poi.category === category.id),
  }))
  const featured = pois.filter((poi) => poi.featured)

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

          {/* Every place, by category, along the signpost's pole */}
          <section className="hero-fade border-l-[6px] border-mint" style={{ animationDelay: '1600ms' }}>
            <h2 className="signpost-right -ml-1.5 bg-mint py-3 pl-6 pr-10 font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">
              Luoghi
            </h2>
            <div className="space-y-6 py-6 pl-6">
              {poisByCategory.map(({ id, label, list }) => (
                <div key={id}>
                  <h3 className="font-display text-lg font-semibold text-coral">{label}</h3>
                  <ul className="mt-1 space-y-0.5 text-sm font-light">
                    {list.map((place) => (
                      <li key={place.id}>
                        <Link
                          to="/luoghi/$poiId"
                          params={{ poiId: place.id }}
                          className="transition-colors hover:text-coral focus-visible:text-coral focus-visible:underline"
                        >
                          {poiNumber(place)}-{place.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-12 flex flex-wrap justify-between gap-2 text-xs italic text-ink/70">
          <span>Camaiore · Versilia, Toscana</span>
          <span>43.94° N · 10.30° E</span>
        </footer>
      </div>
    </main>
  )
}
