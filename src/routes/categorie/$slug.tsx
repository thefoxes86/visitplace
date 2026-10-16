import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { CategoryContent, CategoryEyebrow, MapButton, PageShell, SignpostNav } from '#/components/CategoryPage'
import { EventTimeline } from '#/components/EventTimeline'
import { categoriesQuery, categoryBySlug, categoryLink, categoryPath, hiddenIds, useCategories } from '#/data/categories'
import { getSection, sectionLink } from '#/data/sections'
import { breadcrumbs, seo } from '#/lib/seo'
import { isListType } from '#/lib/category-types'

// A category's own page: the cards of its subcategories for a list, else its places.
export const Route = createFileRoute('/categorie/$slug')({
  loader: async ({ context, params }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQuery)
    const category = categoryBySlug(categories, params.slug)
    // A hidden category, or one below it, has no page on the site.
    if (!category || hiddenIds(categories).has(category.id)) throw notFound()
    const path = categoryPath(categories, category.id)
    return { category, path, section: getSection(path[0]?.section ?? '') }
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? seo({
          title: loaderData.category.label,
          description: isListType(loaderData.category.type)
            ? `${loaderData.category.label} a Camaiore, in Versilia: scopri tutte le categorie, dal centro storico al Lido.`
            : `${loaderData.category.label} a Camaiore, in Versilia: tutti i luoghi, con mappa, informazioni e indicazioni.`,
          path: `/categorie/${loaderData.category.slug}`,
          jsonLd: breadcrumbs([
            ...(loaderData.section ? [[loaderData.section.title, `/${loaderData.section.id}`] as [string, string]] : []),
            ...loaderData.path.map((c): [string, string] => [c.label, `/categorie/${c.slug}`]),
          ]),
        })
      : seo({ title: 'Categoria non trovata', path: `/categorie/${params.slug}`, noindex: true }),
  component: CategoryRoute,
  notFoundComponent: () => (
    <main className="grid min-h-dvh place-items-center bg-paper p-8 text-center font-sans text-ink">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase text-coral">Categoria non trovata</h1>
        <Link to="/mappa" className="mt-4 inline-block font-serif italic text-teal underline">
          Torna alla mappa
        </Link>
      </div>
    </main>
  ),
})

function CategoryRoute() {
  const { category: loaded, section } = Route.useLoaderData()
  const { categories, isEventCategory } = useCategories()
  const category = categories.find((c) => c.id === loaded.id) ?? loaded
  const parent = categories.find((c) => c.id === category.parentId)
  const siblings = categories.filter((c) => c.parentId === category.parentId && c.id !== category.id)
  // Events go on a timeline across the whole page.
  const events = isEventCategory(category.id)

  return (
    <PageShell
      back={
        parent
          ? { ...categoryLink(parent), label: parent.label }
          : section
            ? { ...sectionLink(section.id), label: section.title }
            : { to: '/', label: 'Home' }
      }
      eyebrow={<CategoryEyebrow category={category} />}
      title={category.label}
      tagline={parent ? `Una categoria di ${parent.label}` : (section?.tagline ?? 'Dalle Apuane al mare della Versilia')}
      wide={events}
      aside={
        !events &&
        siblings.length > 0 && (
          <SignpostNav
            title={parent ? `Altro in ${parent.label}` : 'Altre categorie'}
            items={siblings.map((c, i) => ({
              key: c.id,
              number: i + 1,
              title: c.label,
              tagline: isListType(c.type) ? 'Raccolta di categorie' : 'Luoghi e indirizzi',
              link: categoryLink(c),
            }))}
          />
        )
      }
    >
      {events ? <EventTimeline category={category} /> : <CategoryContent category={category} />}
      <MapButton />
    </PageShell>
  )
}
