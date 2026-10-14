import type { Poi } from './pois'

export interface ScopriTopic {
  /** Also the URL path: /scopri/borghi, … */
  id: string
  title: string
  tagline: string
  intro: string
}

/** Sub-sections of the Scopri page. */
export const scopriTopics: ScopriTopic[] = [
  {
    id: 'borghi',
    title: 'Borghi',
    tagline: 'Paesi di pietra tra colline e monti',
    intro:
      "Oltre al centro storico, il comune di Camaiore è fatto di piccoli borghi sparsi tra le colline e le pendici delle Apuane: Casoli, Montemagno, Valpromaro, Gombitelli e molti altri. Vicoli di pietra, piazzette e panorami che arrivano fino al mare.",
  },
  {
    id: 'musei',
    title: 'Musei',
    tagline: 'Arte, storia e archeologia del territorio',
    intro:
      "I musei di Camaiore raccontano la storia del territorio, dai reperti archeologici alle opere d'arte sacra custodite per secoli nelle chiese del comune.",
  },
  {
    id: 'cibo',
    title: 'Cibo',
    tagline: 'Prodotti tipici e tradizioni della tavola',
    intro:
      "Olio extravergine delle colline, farro, castagne e i celebri tordelli: la tradizione gastronomica di Camaiore unisce i sapori della Lucchesia e della Versilia, dai monti fino al mare.",
  },
  {
    id: 'luoghi-storici',
    title: 'Luoghi storici',
    tagline: 'Piazze, mura e memorie del borgo',
    intro:
      "Camaiore nasce lungo la via Francigena e conserva l'impianto del borgo medievale: piazze, palazzi e le tracce delle antiche mura raccontano secoli di storia.",
  },
  {
    id: 'chiese',
    title: 'Chiese e luoghi sacri',
    tagline: 'Pievi, abbazie e chiese romaniche',
    intro:
      "Dalla Collegiata nel cuore del centro storico all'antica Badia di San Pietro, fino alle pievi dei borghi: un patrimonio di chiese romaniche e luoghi di devozione da scoprire.",
  },
  {
    id: 'trekking',
    title: 'Trekking',
    tagline: 'Sentieri dalle colline alle Apuane',
    intro:
      "Alle spalle di Camaiore salgono sentieri per tutti i livelli: dalle passeggiate tra gli ulivi alle escursioni verso le cime del Monte Prana e del Gabberi, con vista sulla costa della Versilia.",
  },
  {
    id: 'siti-naturalistici',
    title: 'Siti naturalistici',
    tagline: 'Boschi, torrenti e paesaggi',
    intro:
      "Boschi di castagni, torrenti e crinali: il territorio di Camaiore custodisce una natura varia e sorprendente, a pochi chilometri dal mare.",
  },
  {
    id: 'mare',
    title: 'Mare',
    tagline: 'Spiagge e passeggiata del Lido',
    intro:
      "Il Lido di Camaiore offre spiagge di sabbia fine, stabilimenti balneari e tratti di spiaggia libera, il pontile e una lunga passeggiata sul mare con le Apuane sullo sfondo.",
  },
]

export function getScopriTopic(id: string) {
  return scopriTopics.find((topic) => topic.id === id)
}

/** Cultural places of a topic; the topic is set on each place in the admin. */
export const topicPois = (topic: ScopriTopic, pois: Poi[]) =>
  pois.filter((poi) => poi.category === 'culture' && poi.topic === topic.id)

/** Demo image: replace with real photography of each topic. */
export const topicImage = (topic: ScopriTopic, size = 800) =>
  `https://picsum.photos/seed/camaiore-scopri-${topic.id}/${size}/${size}`
