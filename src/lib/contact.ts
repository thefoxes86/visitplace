import { z } from 'zod'

/** What a message from the contact page is about. */
export const CONTACT_TOPICS = {
  attivita: {
    label: 'Pubblica la tua attività',
    short: 'La tua attività',
    intro: 'Hai un ristorante, una struttura, un negozio o offri esperienze a Camaiore? Raccontaci chi sei: valuteremo come inserirti nella guida.',
    subject: "Nome dell'attività",
    message: "Raccontaci l'attività: cosa offri, dove si trova, orari",
  },
  evento: {
    label: 'Suggerisci un evento',
    short: 'Un evento',
    intro: 'Una sagra, un concerto, una mostra, una festa di paese? Segnalaci l’evento e lo aggiungeremo al calendario.',
    subject: "Nome dell'evento",
    message: 'Descrivi l’evento: programma, luogo, costi, organizzatori',
  },
  varie: {
    label: 'Varie',
    short: 'Altro',
    intro: 'Una correzione, un consiglio, una domanda o una collaborazione: scrivici quello che vuoi.',
    subject: null,
    message: 'Il tuo messaggio',
  },
} as const

export type ContactTopic = keyof typeof CONTACT_TOPICS

export const CONTACT_TOPIC_IDS = Object.keys(CONTACT_TOPICS) as [ContactTopic, ...ContactTopic[]]

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Al massimo ${max} caratteri`)
    .transform((value) => value || null)

/** What the contact form sends. */
export const contactInput = z
  .object({
    topic: z.enum(CONTACT_TOPIC_IDS),
    name: z.string().trim().min(2, 'Scrivi il tuo nome').max(100, 'Al massimo 100 caratteri'),
    email: z.email('Email non valida').max(200),
    phone: optional(40),
    subject: optional(150),
    eventDate: optional(100),
    website: optional(300).refine((value) => !value || z.url({ protocol: /^https?$/ }).safeParse(value).success, 'Indirizzo non valido (es. https://…)'),
    message: z.string().trim().min(10, 'Scrivi almeno qualche parola').max(4000, 'Al massimo 4000 caratteri'),
    privacy: z.literal(true, 'Serve il tuo consenso per risponderti'),
    /** Anti-spam: a field people don't see, which bots fill in. */
    company: z.string().max(200).default(''),
    /** Anti-spam: when the form was opened, in ms. */
    openedAt: z.number().int(),
  })
  .refine((data) => data.topic === 'varie' || data.subject, { path: ['subject'], error: 'Obbligatorio' })

export type ContactInput = z.input<typeof contactInput>
