import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { contactMessagesQuery } from '#/components/admin/queries'
import { Alert, PageHeader, buttonClass, errorMessage } from '#/components/admin/ui'
import { CONTACT_TOPICS, CONTACT_TOPIC_IDS } from '#/lib/contact'
import { deleteContactMessage, setContactMessageRead } from '#/server/contact'

import type { AdminContactMessage } from '#/components/admin/queries'
import type { ContactTopic } from '#/lib/contact'

export const Route = createFileRoute('/admin/_panel/messaggi')({
  head: () => ({ meta: [{ title: 'Messaggi · Backoffice' }] }),
  component: MessagesPage,
})

type Filter = 'all' | 'unread' | ContactTopic

const chip = (on: boolean) =>
  `rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition ${on ? 'bg-teal text-white ring-teal' : 'ring-ink/20 hover:ring-teal'}`

const dateFormat = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' })

function MessagesPage() {
  const { data: messages = [], isPending, error } = useQuery(contactMessagesQuery)
  const [filter, setFilter] = useState<Filter>('all')
  const unread = messages.filter((m) => !m.read).length
  const shown = messages.filter((m) => (filter === 'all' ? true : filter === 'unread' ? !m.read : m.topic === filter))

  const filters: [Filter, string][] = [
    ['all', `Tutti (${messages.length})`],
    ['unread', `Da leggere (${unread})`],
    ...CONTACT_TOPIC_IDS.map((id): [Filter, string] => [id, CONTACT_TOPICS[id].label]),
  ]

  return (
    <>
      <PageHeader title="Messaggi" subtitle="Quello che i visitatori scrivono dalla pagina Contatti" />

      <div role="group" aria-label="Mostra" className="mt-6 flex flex-wrap gap-1.5">
        {filters.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={chip(filter === id)}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6">
          <Alert>{errorMessage(error)}</Alert>
        </div>
      )}

      {isPending ? (
        <p className="mt-6 font-serif italic text-teal">Carico i messaggi…</p>
      ) : shown.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-ink/20 p-10 text-center font-serif italic text-teal">
          {messages.length ? 'Nessun messaggio con questo filtro.' : 'Ancora nessun messaggio.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {shown.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </ul>
      )}
    </>
  )
}

function MessageCard({ message }: { message: AdminContactMessage }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(!message.read)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const topic = CONTACT_TOPICS[message.topic]

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      await queryClient.invalidateQueries({ queryKey: contactMessagesQuery.queryKey })
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const markRead = (read: boolean) => run(() => setContactMessageRead({ data: { id: message.id, read } }))

  function toggle() {
    setOpen(!open)
    // Opening a message reads it.
    if (!open && !message.read) markRead(true)
  }

  const reply = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject ?? topic.label} · Visit Camaiore`)}`

  return (
    <li className={`rounded-lg border bg-white shadow-sm ${message.read ? 'border-ink/10' : 'border-coral/50'}`}>
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left">
        {!message.read && <span aria-label="Da leggere" className="size-2.5 shrink-0 rounded-full bg-coral" />}
        <span className="rounded-full bg-mint-light px-2 py-0.5 text-xs font-semibold text-teal">{topic.short}</span>
        <span className={`min-w-0 flex-1 truncate ${message.read ? 'font-normal' : 'font-semibold'}`}>
          {message.subject ? `${message.subject} · ` : ''}
          {message.name}
        </span>
        <span className="text-xs font-light text-ink/70">{dateFormat.format(new Date(message.createdAt))}</span>
      </button>

      {open && (
        <div className="border-t border-ink/10 px-4 py-4">
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
            {(
              [
                [topic.subject ?? 'Oggetto', message.subject],
                ['Quando', message.eventDate],
                [
                  'Sito',
                  message.website && (
                    <a href={message.website} target="_blank" rel="noreferrer noopener" className="text-teal hover:underline">
                      {message.website}
                    </a>
                  ),
                ],
                ['Nome', message.name],
                [
                  'Email',
                  <a href={`mailto:${message.email}`} className="text-teal hover:underline">
                    {message.email}
                  </a>,
                ],
                [
                  'Telefono',
                  message.phone && (
                    <a href={`tel:${message.phone.replace(/\s/g, '')}`} className="text-teal hover:underline">
                      {message.phone}
                    </a>
                  ),
                ],
              ] as const
            )
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="font-semibold text-teal">{label}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-4 whitespace-pre-line rounded-md bg-paper p-3 text-sm">{message.message}</p>
          {error && <p className="mt-2 text-sm font-semibold text-coral-dark">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={reply} className={buttonClass.primary}>
              Rispondi
            </a>
            <button type="button" onClick={() => markRead(!message.read)} disabled={busy} className={buttonClass.secondary}>
              {message.read ? 'Segna da leggere' : 'Segna come letto'}
            </button>
            <button
              type="button"
              onClick={() => (confirming ? run(() => deleteContactMessage({ data: { id: message.id } })) : setConfirming(true))}
              onBlur={() => setConfirming(false)}
              disabled={busy}
              className={buttonClass.danger}
            >
              {confirming ? 'Conferma eliminazione' : 'Elimina'}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
