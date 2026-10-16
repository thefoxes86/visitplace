/**
 * Initial contents of the `categories` and `pois` tables, loaded by `npm run db:seed`.
 * Once seeded, edit them in the admin (/admin), not here.
 */
import type { CategorySectionId } from '../data/sections.ts'
import type { SeedPoi } from '../data/pois.ts'

/** Top-level categories of each section, all lists of categories: add their subcategories in the admin. */
export const seedCategories: Record<CategorySectionId, string[]> = {
  scopri: ['Borghi', 'Musei', 'Luoghi storici', 'Siti naturalistici', 'Palazzi', 'Chiese e luoghi sacri'],
  vivi: ['Esperienze', 'Itinerari culturali', 'Eventi', 'Mercati'],
  gusta: ['Ricette', 'Prodotti tipici', 'I produttori camaioresi'],
  info: [],
}

export const seedPois: SeedPoi[] = [
  {
    id: 'piazza-san-bernardino',
    name: 'Piazza San Bernardino',
    category: 'culture',
    summary: 'Il cuore vivace del centro storico.',
    description:
      "La piazza principale di Camaiore, circondata dalle antiche case del borgo e dai caffè. È il punto di partenza naturale per una passeggiata tra le vie medievali del centro.",
    area: 'Centro storico',
    lat: 43.93831,
    lon: 10.3042,
    featured: true,
  },
  {
    id: 'collegiata',
    name: 'Collegiata di Santa Maria Assunta',
    category: 'culture',
    summary: 'Chiesa romanica con il suo campanile.',
    description:
      'La chiesa principale di Camaiore, del XIII secolo, con una sobria facciata romanica e un alto campanile che domina il profilo del centro storico.',
    area: 'Centro storico',
    lat: 43.938,
    lon: 10.30435,
    featured: true,
  },
  {
    id: 'badia-san-pietro',
    name: 'Badia di San Pietro',
    category: 'culture',
    summary: 'Antica abbazia benedettina appena fuori le mura.',
    description:
      "Uno dei luoghi religiosi più antichi della Versilia: un'abbazia benedettina di origine altomedievale, tra i campi ai margini del paese.",
    area: 'Centro storico',
    lat: 43.93848,
    lon: 10.31051,
  },
  {
    id: 'museo-arte-sacra',
    name: "Museo d'Arte Sacra",
    category: 'culture',
    summary: "La collezione d'arte sacra del territorio di Camaiore.",
    description:
      'Un piccolo museo che raccoglie dipinti, sculture, tessuti e oggetti liturgici provenienti dalle chiese di Camaiore e dei dintorni.',
    area: 'Centro storico',
    lat: 43.93704,
    lon: 10.30472,
  },
  // Demo listings: replace with real restaurants, B&Bs and events.
  {
    id: 'osteria-del-borgo',
    name: 'Osteria del Borgo',
    category: 'restaurant',
    summary: 'Cucina toscana tra i vicoli del centro storico.',
    description:
      'Una piccola osteria a conduzione familiare nascosta tra i vicoli del centro storico. In menù i classici della cucina lucchese e versiliese: tordelli al ragù, zuppa di farro, coniglio in umido e i dolci fatti in casa, accompagnati dai vini delle colline intorno a Camaiore.',
    area: 'Centro storico',
    lat: 43.9389,
    lon: 10.3031,
  },
  {
    id: 'trattoria-la-pieve',
    name: 'Trattoria la Pieve',
    category: 'restaurant',
    summary: 'Tordelli, zuppe e vino delle colline.',
    description:
      "Trattoria dall'atmosfera semplice e accogliente, a due passi dalla Collegiata. La cucina segue le stagioni: zuppe di verdure e legumi in inverno, piatti di funghi in autunno e verdure dell'orto in estate, con olio extravergine delle colline e vino della casa.",
    area: 'Centro storico',
    lat: 43.9371,
    lon: 10.3058,
  },
  {
    id: 'ristorante-sul-mare',
    name: 'Ristorante sul Mare',
    category: 'restaurant',
    summary: 'Pesce fresco affacciato sulla passeggiata.',
    description:
      "Affacciato sulla passeggiata del Lido, propone pesce fresco del Tirreno cucinato in modo semplice: crudi, spaghetti alle arselle, fritture e grigliate. Al tramonto la terrazza si colora d'arancio e si vedono le Apuane alle spalle.",
    area: 'Lido di Camaiore',
    lat: 43.8955,
    lon: 10.2245,
  },
  {
    id: 'pizzeria-del-lido',
    name: 'Pizzeria del Lido',
    category: 'restaurant',
    summary: 'Pizza al forno a legna a due passi dal pontile.',
    description:
      'Pizzeria con forno a legna a pochi passi dal pontile, frequentata da famiglie e ragazzi dopo una giornata in spiaggia. Impasti a lunga lievitazione, ingredienti locali e la classica cecina toscana da gustare calda.',
    area: 'Lido di Camaiore',
    lat: 43.8925,
    lon: 10.2262,
  },
  {
    id: 'bnb-le-mura',
    name: 'B&B Le Mura',
    category: 'bnb',
    summary: 'Camere in una casa del Seicento nel centro.',
    description:
      'Poche camere ricavate in una casa del Seicento lungo le antiche mura del centro storico. Soffitti con travi a vista, colazione con dolci fatti in casa e la possibilità di visitare Camaiore a piedi, tra piazze, chiese e botteghe.',
    area: 'Centro storico',
    lat: 43.9397,
    lon: 10.3046,
  },
  {
    id: 'agriturismo-gli-ulivi',
    name: 'Agriturismo Gli Ulivi',
    category: 'bnb',
    summary: 'Tra gli ulivi delle colline, con vista mare.',
    description:
      "Un agriturismo tra gli uliveti sulle colline sopra Camaiore, con vista sulla piana fino al mare. Camere in pietra, piscina panoramica e prodotti dell'azienda: olio, miele e marmellate. Ideale per chi cerca silenzio a pochi minuti dal centro.",
    area: 'Colline di Camaiore',
    lat: 43.9445,
    lon: 10.2945,
  },
  {
    id: 'bnb-la-pineta',
    name: 'B&B La Pineta',
    category: 'bnb',
    summary: "All'ombra dei pini, a cinque minuti dalla spiaggia.",
    description:
      'Un B&B immerso nella pineta del Lido di Camaiore, a cinque minuti a piedi dalla spiaggia. Biciclette a disposizione degli ospiti per percorrere la passeggiata a mare e raggiungere i paesi vicini della Versilia.',
    area: 'Lido di Camaiore',
    lat: 43.9005,
    lon: 10.2305,
  },
  {
    id: 'tappeti-segatura',
    name: 'Tappeti di segatura',
    category: 'events',
    summary: 'Per il Corpus Domini le vie del centro si coprono di tappeti di segatura colorata.',
    description:
      'Ogni anno, per la festa del Corpus Domini, gli abitanti di Camaiore lavorano tutta la notte per coprire le vie del centro storico con tappeti di segatura colorata: disegni sacri e geometrici che al mattino accompagnano la processione. Una tradizione secolare che richiama visitatori da tutta la Toscana.',
    area: 'Centro storico',
    lat: 43.9378,
    lon: 10.3037,
    featured: true,
  },
  {
    id: 'mercato-centro',
    name: 'Mercato settimanale',
    category: 'events',
    summary: 'Bancarelle di prodotti locali e artigianato in centro.',
    description:
      "Il mercato settimanale anima le piazze e le vie del centro con bancarelle di frutta e verdura delle aziende locali, formaggi, salumi, piante e artigianato. Un'occasione per vivere Camaiore come i suoi abitanti.",
    area: 'Centro storico',
    lat: 43.9393,
    lon: 10.3022,
  },
  {
    id: 'cinema-sotto-le-stelle',
    name: 'Cinema sotto le stelle',
    category: 'events',
    summary: "Proiezioni all'aperto sul lungomare nelle sere d'estate.",
    description:
      "Nelle sere d'estate, sul lungomare del Lido, uno schermo all'aperto propone film per tutte le età: classici, novità della stagione e serate dedicate ai più piccoli. Si porta un telo e si guarda il film con la brezza del mare.",
    area: 'Lido di Camaiore',
    lat: 43.8975,
    lon: 10.2232,
  },
]
