export type PlaceCategory = 'history' | 'faith' | 'culture' | 'nature' | 'sea'

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  summary: string
  description: string
  /** Real-world location (WGS84). */
  lat: number
  lon: number
  /** Featured places keep their label visible from the overview. */
  featured?: boolean
}

export const categoryColors: Record<PlaceCategory, string> = {
  history: '#e76f51',
  faith: '#f4a261',
  culture: '#9b5de5',
  nature: '#2a9d8f',
  sea: '#118ab2',
}

export const categoryLabels: Record<PlaceCategory, string> = {
  history: 'History',
  faith: 'Faith',
  culture: 'Culture',
  nature: 'Nature',
  sea: 'Sea',
}

export const places: Place[] = [
  {
    id: 'piazza-san-bernardino',
    name: 'Piazza San Bernardino',
    category: 'history',
    summary: 'The lively heart of the historic centre.',
    description:
      'The main square of Camaiore, framed by the old town houses and cafés. It is the natural starting point for a walk through the medieval streets of the centre.',
    lat: 43.93831,
    lon: 10.3042,
    featured: true,
  },
  {
    id: 'collegiata',
    name: 'Collegiata di Santa Maria Assunta',
    category: 'faith',
    summary: 'Romanesque collegiate church with its bell tower.',
    description:
      'The principal church of Camaiore, dating back to the 13th century, with a sober Romanesque façade and a tall bell tower that dominates the skyline of the old town.',
    lat: 43.938,
    lon: 10.30435,
  },
  {
    id: 'badia-san-pietro',
    name: 'Badia di San Pietro',
    category: 'faith',
    summary: 'Ancient Benedictine abbey just outside the walls.',
    description:
      'One of the oldest religious sites in Versilia: a Benedictine abbey whose origins go back to the early Middle Ages, set among the fields at the edge of town.',
    lat: 43.93848,
    lon: 10.31051,
  },
  {
    id: 'museo-arte-sacra',
    name: "Museo d'Arte Sacra",
    category: 'culture',
    summary: 'Sacred art collection of the Camaiore area.',
    description:
      'A small museum gathering paintings, sculptures, textiles and liturgical objects from the churches of Camaiore and its surroundings.',
    lat: 43.93704,
    lon: 10.30472,
  },
  {
    id: 'lido-pontile',
    name: 'Pontile di Lido di Camaiore',
    category: 'sea',
    summary: 'The pier reaching into the Tyrrhenian Sea.',
    description:
      'The pier of Lido di Camaiore stretches out over the water from the seafront promenade — the perfect spot for a sunset walk along the Versilia coast.',
    lat: 43.89171,
    lon: 10.22216,
    featured: true,
  },
  {
    id: 'lido-passeggiata',
    name: 'Passeggiata a mare',
    category: 'sea',
    summary: 'Seafront promenade with beach clubs.',
    description:
      'The long promenade of Lido di Camaiore, lined with beach establishments, shops and restaurants, ideal by bike or on foot.',
    lat: 43.89895,
    lon: 10.22101,
  },
  {
    id: 'monte-prana',
    name: 'Monte Prana',
    category: 'nature',
    summary: 'Panoramic peak of the Apuan foothills.',
    description:
      'Rising behind the town, Monte Prana offers hiking trails through chestnut woods and wide views over Versilia, the coast and, on clear days, the islands.',
    lat: 43.95269,
    lon: 10.3554,
    featured: true,
  },
]

export function getPlace(id: string) {
  return places.find((place) => place.id === id)
}
