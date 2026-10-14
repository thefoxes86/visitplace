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
  { id: 'dove-dormire', title: 'Dove dormire', tagline: 'Hotel, agriturismi e case vacanza', color: '#9b5de5' },
  { id: 'info', title: 'Info', tagline: 'Come arrivare e informazioni utili', color: '#118ab2' },
]

export function getSection(id: string) {
  return sections.find((section) => section.id === id)
}

const ROUTES = {
  scopri: '/scopri',
  vivi: '/vivi',
  gusta: '/gusta',
  'dove-dormire': '/dove-dormire',
  info: '/info',
} as const

/** Props for a <Link> to a section. */
export const sectionLink = (id: string) => ({ to: ROUTES[id as keyof typeof ROUTES] })
