import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { PageShell } from '#/components/CategoryPage'
import { CONTACT_TOPICS, CONTACT_TOPIC_IDS, contactInput } from '#/lib/contact'
import { breadcrumbs, seo } from '#/lib/seo'
import { sendContactMessage } from '#/server/contact'

import type { ContactTopic } from '#/lib/contact'

export const Route = createFileRoute('/contatti')({
  validateSearch: z.object({
    tema: z.enum(CONTACT_TOPIC_IDS).optional().catch(undefined),
  }),
  head: () =>
    seo({
      title: 'Contatti',
      description:
        'Scrivi a Visit Camaiore: pubblica la tua attività nella guida, suggerisci un evento per il calendario o mandaci una segnalazione.',
      path: '/contatti',
      jsonLd: breadcrumbs([['Contatti', '/contatti']]),
    }),
  component: ContactPage,
})

const fieldClass =
  'w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 text-base font-normal outline-none transition focus:border-teal focus:ring-2 focus:ring-mint aria-[invalid=true]:border-coral'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-teal'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  eventDate: '',
  website: '',
  message: '',
  company: '',
}

type FormValues = typeof EMPTY

function ContactPage() {
  const { tema } = Route.useSearch()
  const navigate = useNavigate({ from: '/contatti' })
  const choose = (id: ContactTopic) => navigate({ search: { tema: id }, replace: true, resetScroll: false })

  return (
    <PageShell
      back={{ label: 'Home', to: '/' }}
      eyebrow="Contatti"
      title="Scrivici"
      tagline="Aiutaci a raccontare Camaiore"
      aside={null}
      wide
    >
      <div className="max-w-3xl">
        <p className="font-serif text-xl italic text-coral sm:text-2xl">
          Visit Camaiore è la guida di chi vive e ama questo territorio: luoghi, sapori, eventi e persone.
        </p>
        <p className="mt-4 text-base font-normal sm:text-lg">
          Hai un'attività o organizzi un evento a Camaiore? Chiedici di inserirlo nella guida: leggiamo ogni segnalazione, la verifichiamo e
          la pubblichiamo con una scheda dedicata. La pubblicazione è{' '}
          <strong className="font-semibold text-coral">completamente gratuita</strong>: niente costi, abbonamenti o commissioni.
        </p>
      </div>

      <h2 className="mt-10 font-display text-sm font-semibold uppercase tracking-[0.2em] text-teal">Di cosa vuoi parlarci?</h2>
      <div role="tablist" aria-label="Argomento" className="mt-4 grid gap-3 sm:grid-cols-3">
        {CONTACT_TOPIC_IDS.map((id) => {
          const on = id === tema
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={on ? 'contact-panel' : undefined}
              onClick={() => choose(id)}
              className={`border-t-[3px] px-5 py-4 text-left transition ${
                on ? 'border-coral bg-white shadow-md' : 'border-teal bg-mint-light/40 hover:border-coral hover:bg-white hover:shadow-sm'
              }`}
            >
              <span className={`block font-display text-lg font-semibold leading-tight ${on ? 'text-coral' : 'text-teal'}`}>
                {CONTACT_TOPICS[id].label}
              </span>
            </button>
          )
        })}
      </div>

      {/* The form appears once a topic is chosen. */}
      {tema && <ContactForm key={tema} topic={tema} />}
    </PageShell>
  )
}

/** The form for the chosen topic. */
function ContactForm({ topic }: { topic: ContactTopic }) {
  const info = CONTACT_TOPICS[topic]

  const [values, setValues] = useState<FormValues>(EMPTY)
  const [privacy, setPrivacy] = useState(false)
  const [openedAt] = useState(() => Date.now())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [sent, setSent] = useState<ContactTopic | null>(null)

  const field = (key: keyof FormValues) => ({
    id: `contact-${key}`,
    name: key,
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }))
      setErrors((prev) => (key in prev ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)) : prev))
    },
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `contact-${key}-error` : undefined,
    className: fieldClass,
  })

  const error = (key: string) =>
    errors[key] && (
      <p id={`contact-${key}-error`} className="mt-1 text-sm font-semibold text-coral-dark">
        {errors[key]}
      </p>
    )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFailure(null)
    const parsed = contactInput.safeParse({
      ...values,
      topic,
      privacy,
      openedAt,
    })
    if (!parsed.success) {
      const found: Record<string, string> = {}
      for (const issue of parsed.error.issues) found[String(issue.path[0])] ??= issue.message
      setErrors(found)
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setSending(true)
    try {
      await sendContactMessage({
        data: { ...values, topic, privacy: true, openedAt },
      })
      setSent(topic)
      setValues(EMPTY)
      setPrivacy(false)
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Invio non riuscito: riprova tra poco.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact-panel" role="tabpanel" aria-label={info.label} className="mt-10 max-w-2xl border-t-2 border-mint pt-8">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.15em] text-teal">{info.label}</h2>
      <p className="mt-2 font-serif text-lg italic text-coral">{info.intro}</p>
      {topic !== 'varie' && <p className="mt-3 text-sm font-semibold text-teal">✓ La pubblicazione è completamente gratuita.</p>}

      {sent === topic ? (
        <div role="status" className="mt-8 border-2 border-teal bg-white px-6 py-8">
          <p className="font-display text-xl font-semibold text-teal">Grazie, messaggio ricevuto!</p>
          <p className="mt-2 font-normal">Ti risponderemo all'indirizzo email che ci hai lasciato, di solito entro qualche giorno.</p>
          <button type="button" onClick={() => setSent(null)} className="mt-4 font-serif italic text-coral hover:underline">
            Scrivi un altro messaggio
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          {info.subject && (
            <div>
              <label htmlFor="contact-subject" className={labelClass}>
                {info.subject} *
              </label>
              <input {...field('subject')} autoComplete={topic === 'attivita' ? 'organization' : 'off'} />
              {error('subject')}
            </div>
          )}

          {topic === 'evento' && (
            <div>
              <label htmlFor="contact-eventDate" className={labelClass}>
                Quando
              </label>
              <input {...field('eventDate')} placeholder="Es. sabato 14 giugno, dalle 18" />
              {error('eventDate')}
            </div>
          )}

          {topic !== 'varie' && (
            <div>
              <label htmlFor="contact-website" className={labelClass}>
                Sito o pagina social
              </label>
              <input {...field('website')} type="url" inputMode="url" placeholder="https://…" />
              {error('website')}
            </div>
          )}

          <div>
            <label htmlFor="contact-message" className={labelClass}>
              {info.message} *
            </label>
            <textarea {...field('message')} rows={6} />
            {error('message')}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="contact-name" className={labelClass}>
                Il tuo nome *
              </label>
              <input {...field('name')} autoComplete="name" />
              {error('name')}
            </div>
            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email *
              </label>
              <input {...field('email')} type="email" autoComplete="email" />
              {error('email')}
            </div>
            <div>
              <label htmlFor="contact-phone" className={labelClass}>
                Telefono
              </label>
              <input {...field('phone')} type="tel" autoComplete="tel" />
              {error('phone')}
            </div>
          </div>

          {/* Hidden from people: only bots fill it in. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="contact-company">Azienda</label>
            <input {...field('company')} tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm font-normal">
              <input
                id="contact-privacy"
                type="checkbox"
                checked={privacy}
                onChange={(e) => {
                  setPrivacy(e.target.checked)
                  setErrors(({ privacy: _, ...rest }) => rest)
                }}
                aria-invalid={Boolean(errors.privacy)}
                className="mt-0.5 size-4 shrink-0 accent-teal"
              />
              <span>Acconsento all'uso dei miei dati solo per rispondere a questo messaggio. *</span>
            </label>
            {error('privacy')}
          </div>

          {failure && (
            <p role="alert" className="border-l-4 border-coral bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
              {failure}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-coral px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-coral-dark disabled:opacity-60"
            >
              {sending ? 'Invio…' : 'Invia il messaggio'}
            </button>
            <span className="text-xs font-light text-ink/70">* campi obbligatori</span>
          </div>
        </form>
      )}
    </section>
  )
}
