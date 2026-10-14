import { Link, createFileRoute } from '@tanstack/react-router'

import { MapButton, OtherSections, PageShell, placesCount } from '#/components/CategoryPage'
import { scopriTopics, topicImage, topicPois } from '#/data/scopri'
import { usePois } from '#/data/use-pois'
import { getSection } from '#/data/sections'

export const Route = createFileRoute('/scopri/')({
  head: () => ({ meta: [{ title: 'Scopri · Visit Camaiore' }] }),
  component: ScopriPage,
})

function ScopriPage() {
  const section = getSection('scopri')!
  const pois = usePois()

  return (
    <PageShell
      back={{ to: '/', label: 'Home' }}
      eyebrow={`${scopriTopics.length} percorsi`}
      title={section.title}
      tagline={section.tagline}
      aside={<OtherSections current={section.id} />}
    >
      <p className="max-w-2xl text-lg font-light leading-relaxed">
        Dal mare della Versilia alle cime delle Apuane, passando per il borgo medievale e le colline di ulivi:
        Camaiore si scopre un passo alla volta. Scegli da dove cominciare.
      </p>

      <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {scopriTopics.map((topic, i) => {
          const count = topicPois(topic, pois).length
          return (
            <li key={topic.id}>
              <Link to="/scopri/$topic" params={{ topic: topic.id }} className="group block">
                <span className="relative block">
                  <img
                    src={topicImage(topic, 600)}
                    alt=""
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                  />
                  <span className="absolute -bottom-4 left-4 bg-paper px-2 font-display text-5xl font-light leading-none text-coral">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="mt-6 block border-b-2 border-coral/30 pb-3 transition-colors group-hover:border-coral">
                  <span className="block font-display text-xl font-semibold uppercase tracking-[0.1em] text-teal transition-colors group-hover:text-coral">
                    {topic.title}
                  </span>
                  <span className="mt-1 block font-serif italic text-coral">{topic.tagline}</span>
                  <span className="mt-2 flex items-center justify-between text-xs font-light">
                    {count > 0 ? placesCount(count) : 'In arrivo'}
                    <span className="font-semibold text-teal transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <MapButton />
    </PageShell>
  )
}
