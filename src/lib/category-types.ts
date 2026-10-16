import { z } from 'zod'

/**
 * Types of category. Each one decides the fields of the admin form and what the
 * place page shows: the shared columns of `pois` it uses (dates, Scopri section,
 * contacts) and its own fields, stored in `pois.details`.
 *
 * To add a type, add an entry here and its icon in CategoryIcon.tsx.
 */

export type DetailField = {
  /** Key in `pois.details`: never rename it once places use it. */
  key: string
  label: string
  hint?: string
  /** Shown after the value: "12 km". */
  unit?: string
  required?: boolean
} & (
  | { kind: 'text' | 'textarea' | 'url' }
  | { kind: 'number'; min?: number; max?: number; step?: number }
  | { kind: 'select'; options: { value: string; label: string }[] }
  | { kind: 'boolean' }
)

/** Values of `pois.details`, by field key. */
export type DetailValues = Record<string, string | number | boolean>

export type Contact = 'address' | 'phone' | 'email' | 'website'

export interface CategoryType {
  label: string
  description: string
  /** Start (required) and end dates. */
  dates?: boolean
  contacts: Contact[]
  fields: DetailField[]
  /** Holds subcategories instead of places: its page lists them. */
  list?: boolean
}

const openingHours: DetailField = { key: 'openingHours', label: 'Orari di apertura', kind: 'textarea', hint: 'Es. Lun–Ven 9–13, 15–19' }
const services: DetailField = { key: 'services', label: 'Servizi', kind: 'textarea', hint: 'Es. Wi-Fi, parcheggio, piscina, animali ammessi' }
const rooms: DetailField = { key: 'rooms', label: 'Camere', kind: 'number', min: 1, step: 1 }
const checkIn: DetailField = { key: 'checkIn', label: 'Check-in', kind: 'text', hint: 'Es. dalle 15:00' }
const checkOut: DetailField = { key: 'checkOut', label: 'Check-out', kind: 'text', hint: 'Es. entro le 10:30' }
const season: DetailField = { key: 'season', label: 'Periodo consigliato', kind: 'text', hint: 'Es. da aprile a ottobre' }

export const CATEGORY_TYPES = {
  event: {
    label: 'Evento',
    description: 'Feste, mercati, spettacoli: con data di inizio e fine.',
    dates: true,
    contacts: ['address', 'website'],
    fields: [
      { key: 'organizer', label: 'Organizzatore', kind: 'text' },
      { key: 'price', label: 'Prezzo', kind: 'text', hint: 'Es. Ingresso libero, 10 €' },
      { key: 'booking', label: 'Prenotazione obbligatoria', kind: 'boolean' },
    ],
  },
  place: {
    label: 'Luogo',
    description: 'Monumenti, chiese, musei, piazze e luoghi da visitare.',
    contacts: ['address', 'phone', 'website'],
    fields: [
      openingHours,
      { key: 'ticket', label: 'Biglietto', kind: 'text', hint: 'Es. Ingresso libero, 5 €' },
      { key: 'accessible', label: 'Accessibile in sedia a rotelle', kind: 'boolean' },
    ],
  },
  restaurant: {
    label: 'Ristorante',
    description: 'Ristoranti, trattorie, pizzerie, bar.',
    contacts: ['address', 'phone', 'email', 'website'],
    fields: [
      { key: 'cuisine', label: 'Cucina', kind: 'text', hint: 'Es. toscana, di pesce, pizzeria' },
      {
        key: 'priceRange',
        label: 'Fascia di prezzo',
        kind: 'select',
        options: [
          { value: '1', label: '€ · economico' },
          { value: '2', label: '€€ · medio' },
          { value: '3', label: '€€€ · alto' },
          { value: '4', label: '€€€€ · lusso' },
        ],
      },
      openingHours,
      { key: 'closingDay', label: 'Giorno di chiusura', kind: 'text' },
    ],
  },
  bnb: {
    label: 'B&B',
    description: 'Bed & breakfast, affittacamere, case vacanza.',
    contacts: ['address', 'phone', 'email', 'website'],
    fields: [rooms, checkIn, checkOut, { key: 'breakfast', label: 'Colazione inclusa', kind: 'boolean' }, services],
  },
  hotel: {
    label: 'Albergo',
    description: 'Hotel e residence, con stelle e servizi.',
    contacts: ['address', 'phone', 'email', 'website'],
    fields: [
      {
        key: 'stars',
        label: 'Stelle',
        kind: 'select',
        options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: '★'.repeat(n) })),
      },
      rooms,
      checkIn,
      checkOut,
      services,
    ],
  },
  trekking: {
    label: 'Trekking',
    description: 'Sentieri ed escursioni: la posizione è il punto di partenza.',
    contacts: ['website'],
    fields: [
      {
        key: 'difficulty',
        label: 'Difficoltà',
        kind: 'select',
        required: true,
        options: [
          { value: 'T', label: 'T · turistico' },
          { value: 'E', label: 'E · escursionistico' },
          { value: 'EE', label: 'EE · per escursionisti esperti' },
          { value: 'EEA', label: 'EEA · esperti con attrezzatura' },
        ],
      },
      { key: 'length', label: 'Lunghezza', kind: 'number', unit: 'km', min: 0, step: 0.1 },
      { key: 'elevationGain', label: 'Dislivello', kind: 'number', unit: 'm', min: 0, step: 1 },
      { key: 'duration', label: 'Durata', kind: 'text', hint: 'Es. 3 h 30' },
      { key: 'start', label: 'Punto di partenza', kind: 'text', hint: 'Es. Piazza di Casoli, parcheggio' },
      { key: 'loop', label: 'Percorso ad anello', kind: 'boolean' },
      { key: 'gpx', label: 'Traccia GPX', kind: 'url', hint: 'Link al file .gpx o alla traccia online' },
      season,
    ],
  },
  list: {
    label: 'Lista',
    description: 'Raccoglie sottocategorie di qualsiasi tipo e ne mostra l\'elenco, senza contenuti propri.',
    list: true,
    contacts: [],
    fields: [],
  },
  climbing: {
    label: 'Climbing',
    description: 'Falesie e vie di arrampicata.',
    contacts: ['website'],
    fields: [
      { key: 'gradeMin', label: 'Grado minimo', kind: 'text', hint: 'Es. 4c' },
      { key: 'gradeMax', label: 'Grado massimo', kind: 'text', hint: 'Es. 7b+' },
      { key: 'routes', label: 'Numero di vie', kind: 'number', min: 1, step: 1 },
      { key: 'height', label: 'Altezza della parete', kind: 'number', unit: 'm', min: 0, step: 1 },
      { key: 'rock', label: 'Roccia', kind: 'text', hint: 'Es. calcare' },
      {
        key: 'exposure',
        label: 'Esposizione',
        kind: 'select',
        options: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'].map((v) => ({ value: v, label: v })),
      },
      { key: 'approach', label: 'Avvicinamento', kind: 'number', unit: 'min', min: 0, step: 1 },
      season,
    ],
  },
} satisfies Record<string, CategoryType>

export type CategoryTypeId = keyof typeof CATEGORY_TYPES

export const CATEGORY_TYPE_IDS = Object.keys(CATEGORY_TYPES) as [CategoryTypeId, ...CategoryTypeId[]]

/** Whether a category of this type holds subcategories rather than places. */
export const isListType = (id: string) => categoryType(id).list === true

/** The type of a category, falling back to a plain place for an unknown one. */
export const categoryType = (id: string): CategoryType => CATEGORY_TYPES[id as CategoryTypeId] ?? CATEGORY_TYPES.place

const fieldSchema = (field: DetailField) => {
  const schema = (() => {
    switch (field.kind) {
      case 'number': {
        let n = z.number({ error: 'Deve essere un numero' })
        if (field.min !== undefined) n = n.min(field.min, `Almeno ${field.min}`)
        if (field.max !== undefined) n = n.max(field.max, `Al massimo ${field.max}`)
        return n
      }
      case 'select':
        return z.enum(field.options.map((o) => o.value) as [string, ...string[]], { error: 'Scegli un valore' })
      case 'boolean':
        return z.boolean()
      case 'url':
        return z.url('Indirizzo non valido')
      default:
        return z.string().trim().min(1).max(2000, 'Al massimo 2000 caratteri')
    }
  })()
  return field.required ? schema : schema.optional()
}

/** Validates `pois.details` for a type: unknown keys are dropped, empty values left out. */
export const detailsSchema = (type: CategoryType) =>
  // Built from a list, so TypeScript can't see the keys: every value is a field's primitive.
  z.object(Object.fromEntries(type.fields.map((field) => [field.key, fieldSchema(field)]))) as unknown as z.ZodType<DetailValues>

/** A detail value as shown on the site: "12 km", "Sì", "EE · per escursionisti esperti". */
export function formatDetail(field: DetailField, value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  switch (field.kind) {
    case 'boolean':
      return value ? 'Sì' : 'No'
    case 'select':
      return field.options.find((o) => o.value === value)?.label ?? String(value)
    case 'number':
      return `${Number(value).toLocaleString('it-IT')}${field.unit ? ` ${field.unit}` : ''}`
    default:
      return String(value)
  }
}
