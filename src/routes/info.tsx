import { Link, createFileRoute } from '@tanstack/react-router'

import type { ReactNode } from 'react'

import { OtherSections, PageShell, SignpostNav } from '#/components/CategoryPage'
import { gettingAround, gettingHere, guides, touristOffices, webcams } from '#/data/info'
import { getSection } from '#/data/sections'
import { breadcrumbs, seo } from '#/lib/seo'

import type { InfoItem } from '#/data/info'

export const Route = createFileRoute('/info')({
  head: () =>
    seo({
      title: 'Info',
      description:
        'Informazioni utili per visitare Camaiore: uffici turistici, come arrivare in auto, treno e aereo, come muoversi tra centro, borghi e Lido, guide e webcam.',
      path: '/info',
      jsonLd: breadcrumbs([['Info', '/info']]),
    }),
  component: InfoPage,
})

const BLOCKS = [
  { id: 'uffici-turistici', title: 'Uffici turistici', tagline: 'Dove chiedere informazioni' },
  { id: 'come-arrivare', title: 'Come arrivare', tagline: 'In auto, in treno, in aereo' },
  { id: 'come-muoversi', title: 'Come muoversi', tagline: 'Autobus, bici e a piedi' },
  { id: 'guide', title: 'Guide', tagline: 'Visite ed escursioni guidate' },
  { id: 'webcam', title: 'Webcam', tagline: 'Camaiore in diretta' },
] as const

type BlockId = (typeof BLOCKS)[number]['id']

const mapsSearch = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

function InfoPage() {
  const section = getSection('info')!

  const content: Record<BlockId, ReactNode> = {
    'uffici-turistici': (
      <ul className="grid gap-6 sm:grid-cols-2">
        {touristOffices.map((office) => (
          <li key={office.name}>
            <p className="font-display text-lg font-semibold text-teal">{office.name}</p>
            <p className="font-serif italic text-coral">{office.area}</p>
            <dl className="mt-3 space-y-1 text-sm font-light">
              {(
                [
                  ['Indirizzo', office.address],
                  ['Orari', office.hours],
                  ['Telefono', office.phone && <a href={`tel:${office.phone.replace(/\s/g, '')}`}>{office.phone}</a>],
                  ['Email', office.email && <a href={`mailto:${office.email}`}>{office.email}</a>],
                ] as const
              )
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="w-20 shrink-0 font-semibold">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
            <a
              href={mapsSearch(`${office.name}, ${office.area}`)}
              target="_blank"
              rel="noreferrer"
              className="group mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal hover:text-coral"
            >
              Indicazioni
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </li>
        ))}
      </ul>
    ),
    'come-arrivare': <ItemList items={gettingHere} />,
    'come-muoversi': <ItemList items={gettingAround} />,
    guide: (
      <>
        <ItemList items={guides} />
        <Link
          to="/scopri/$topic"
          params={{ topic: 'trekking' }}
          className="group mt-6 inline-flex items-center gap-1 text-sm font-semibold text-teal hover:text-coral"
        >
          Sentieri ed escursioni
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </>
    ),
    webcam: (
      <ul className="grid gap-6 sm:grid-cols-3">
        {webcams.map((cam) => (
          <li key={cam.name}>
            <div className="relative aspect-video overflow-hidden bg-mint-light">
              {cam.url ? (
                <iframe src={cam.url} title={`Webcam ${cam.name}`} className="size-full" loading="lazy" allowFullScreen />
              ) : (
                <span className="grid size-full place-items-center font-serif text-sm italic text-teal">In arrivo</span>
              )}
              {cam.url && (
                <span className="absolute left-2 top-2 flex items-center gap-1 bg-coral px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                  <span className="size-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </span>
              )}
            </div>
            <p className="mt-2 font-semibold text-teal">{cam.name}</p>
            <p className="text-xs font-light">{cam.area}</p>
          </li>
        ))}
      </ul>
    ),
  }

  return (
    <PageShell
      back={{ to: '/', label: 'Home' }}
      eyebrow="Informazioni utili"
      title={section.title}
      tagline={section.tagline}
      aside={
        <div className="space-y-10 lg:sticky lg:top-24">
          <SignpostNav
            title="In questa pagina"
            items={BLOCKS.map((block, i) => ({ key: block.id, number: i + 1, ...block, link: { to: '/info', hash: block.id } }))}
          />
          <OtherSections current={section.id} />
        </div>
      }
    >
      <p className="max-w-2xl text-lg font-light leading-relaxed">
        Tutto quello che serve per organizzare la visita: dove chiedere informazioni, come raggiungere Camaiore e
        spostarsi tra il centro, i borghi e il Lido.
      </p>

      {BLOCKS.map((block) => (
        // Framed like the legend of the map
        <section key={block.id} id={block.id} className="relative mt-14 scroll-mt-24 border-2 border-coral px-5 pb-6 pt-10">
          <h2 className="absolute -top-4 left-4 bg-paper px-2 font-display text-2xl font-semibold uppercase tracking-[0.15em] text-coral">
            {block.title}
          </h2>
          {content[block.id]}
        </section>
      ))}
    </PageShell>
  )
}

function ItemList({ items }: { items: InfoItem[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={item.title} className="flex gap-3">
          <span
            className={`grid size-9 shrink-0 place-items-center text-xs font-semibold ${
              i % 2 ? 'bg-teal text-white' : 'bg-mint-light text-teal'
            }`}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <dt className="font-semibold text-teal">{item.title}</dt>
            <dd className="mt-1 text-sm font-light leading-relaxed">{item.text}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
