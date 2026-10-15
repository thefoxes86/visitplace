import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { MapButton, PageShell, PoiList, SignpostNav, placesCount } from '#/components/CategoryPage'
import { usePois } from '#/data/use-pois'
import { getScopriTopic, scopriTopics, topicImage, topicPois } from '#/data/scopri'
import { breadcrumbs, seo } from '#/lib/seo'

// Only the ids in src/data/scopri.ts match; anything else is a 404.
export const Route = createFileRoute('/scopri/$topic')({
  loader: ({ params }) => {
    const topic = getScopriTopic(params.topic)
    if (!topic) throw notFound()
    return topic
  },
  head: ({ loaderData: topic, params }) =>
    topic
      ? seo({
          title: `${topic.title} · Scopri`,
          description: topic.intro,
          path: `/scopri/${topic.id}`,
          image: topicImage(topic, 1200),
          jsonLd: breadcrumbs([
            ['Scopri', '/scopri'],
            [topic.title, `/scopri/${topic.id}`],
          ]),
        })
      : seo({ title: 'Pagina non trovata', path: `/scopri/${params.topic}`, noindex: true }),
  component: TopicPage,
  notFoundComponent: () => (
    <main className="grid min-h-dvh place-items-center bg-paper p-8 text-center font-sans text-ink">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase text-coral">Pagina non trovata</h1>
        <Link to="/scopri" className="mt-4 inline-block font-serif italic text-teal underline">
          Torna a Scopri
        </Link>
      </div>
    </main>
  ),
})

function TopicPage() {
  const topic = Route.useLoaderData()
  const pois = usePois()
  const items = topicPois(topic, pois)

  return (
    <PageShell
      back={{ to: '/scopri', label: 'Scopri' }}
      eyebrow={`Scopri · ${items.length > 0 ? placesCount(items.length) : 'in arrivo'}`}
      title={topic.title}
      tagline={topic.tagline}
      aside={
        <SignpostNav
          title="Scopri anche"
          items={scopriTopics
            .map((t, i) => ({
              key: t.id,
              number: i + 1,
              title: t.title,
              tagline: t.tagline,
              link: { to: '/scopri/$topic' as const, params: { topic: t.id } },
            }))
            .filter((t) => t.key !== topic.id)}
        />
      }
    >
      {/* Demo image: replace with real photography of each topic. */}
      <img src={topicImage(topic, 1200)} alt="" className="aspect-[16/7] w-full object-cover" />
      <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed">{topic.intro}</p>

      {items.length > 0 ? (
        <PoiList items={items} />
      ) : (
        <p className="relative mt-14 border-2 border-coral px-5 py-6 font-serif italic text-coral">
          Stiamo raccogliendo i luoghi di questa sezione: torna presto, o intanto esplora la mappa turistica.
        </p>
      )}

      <MapButton />
    </PageShell>
  )
}
