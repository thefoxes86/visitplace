export interface Section {
  /** Also the URL path: /scopri, /vivi, … */
  id: string
  title: string
  tagline: string
  color: string
}

/** Main entries of the site menu. */
export const sections: Section[] = [
  { id: 'scopri', title: 'Scopri', tagline: 'Luoghi, storia e paesaggi', color: '#e76f51' },
  { id: 'vivi', title: 'Vivi', tagline: 'Esperienze, eventi e attività', color: '#2a9d8f' },
  { id: 'gusta', title: 'Gusta', tagline: 'Sapori e tradizioni a tavola', color: '#f4a261' },
  { id: 'info', title: 'Info', tagline: 'Come arrivare e informazioni utili', color: '#118ab2' },
]

/** Every top-level category belongs to one of these sections, chosen in the admin's category form. */
export const CATEGORY_SECTION_IDS = ['scopri', 'vivi', 'gusta', 'info'] as const

export type CategorySectionId = (typeof CATEGORY_SECTION_IDS)[number]

export function getSection(id: string) {
  return sections.find((section) => section.id === id)
}

const ROUTES = {
  scopri: '/scopri',
  vivi: '/vivi',
  gusta: '/gusta',
  info: '/info',
} as const

/** Props for a <Link> to a section. */
export const sectionLink = (id: string) => ({ to: ROUTES[id as keyof typeof ROUTES] })
