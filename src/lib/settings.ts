import { z } from 'zod'

/** Maintenance mode: while on, visitors who aren't signed in only see the maintenance page. */
export const maintenanceSetting = z.object({
  enabled: z.boolean(),
  /** Shown on the maintenance page; empty uses DEFAULT_MAINTENANCE_MESSAGE. */
  message: z.string().trim().max(500, 'Al massimo 500 caratteri'),
})

export type MaintenanceSetting = z.infer<typeof maintenanceSetting>

export const DEFAULT_MAINTENANCE: MaintenanceSetting = { enabled: false, message: '' }

export const DEFAULT_MAINTENANCE_MESSAGE =
  'Stiamo lavorando per rendere Visit Camaiore ancora più bello. Torna a trovarci tra poco.'

// ── Webcams ──────────────────────────────────────────────────────────────────

/** How a webcam shows on the Info page. */
export const WEBCAM_KINDS = {
  embed: { label: 'Video incorporato', hint: "Indirizzo del player da incorporare (iframe), es. quello di YouTube o del sito della webcam." },
  image: { label: 'Immagine', hint: "Indirizzo di un'immagine .jpg che la webcam aggiorna: la pagina la ricarica ogni minuto." },
  link: { label: 'Solo link', hint: 'Per le webcam che non si possono incorporare: mostra un bottone che apre il loro sito.' },
} as const

export type WebcamKind = keyof typeof WEBCAM_KINDS

export const WEBCAM_KIND_IDS = Object.keys(WEBCAM_KINDS) as [WebcamKind, ...WebcamKind[]]

const httpsUrl = z.url({ protocol: /^https$/, error: 'Serve un indirizzo https://' })

export const webcamSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Obbligatorio').max(80, 'Al massimo 80 caratteri'),
  area: z.string().trim().max(80, 'Al massimo 80 caratteri'),
  kind: z.enum(WEBCAM_KIND_IDS),
  /** Player, image or page, by kind; empty shows the camera as coming soon. */
  url: z.union([z.literal(''), httpsUrl]),
  /** Who runs the camera, credited under it. */
  sourceName: z.string().trim().max(80, 'Al massimo 80 caratteri'),
  sourceUrl: z.union([z.literal(''), httpsUrl]),
  published: z.boolean(),
})

export type Webcam = z.infer<typeof webcamSchema>

export const webcamsSetting = z.array(webcamSchema).max(30, 'Al massimo 30 webcam')

/** Until the admin saves its own list. */
export const DEFAULT_WEBCAMS: Webcam[] = [
  { id: 'pontile', name: 'Pontile', area: 'Lido di Camaiore' },
  { id: 'spiaggia', name: 'Spiaggia', area: 'Lido di Camaiore' },
  { id: 'piazza-san-bernardino', name: 'Piazza San Bernardino', area: 'Centro storico' },
].map((cam) => ({ ...cam, kind: 'embed' as const, url: '', sourceName: '', sourceUrl: '', published: true }))
