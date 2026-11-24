import { createServerFn } from '@tanstack/react-start'
import { and, count, desc, eq, gt } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { contactMessages } from '#/db/schema'
import { CONTACT_TOPICS, contactInput } from '#/lib/contact'
import { absoluteUrl } from '#/lib/seo'
import { escapeHtml, sendToContactAddress } from '#/server/mail'
import { requireEditor } from '#/server/session'

type ContactMessage = typeof contactMessages.$inferSelect

/** Forms sent faster than this after opening are taken for bots. */
const MIN_FILL_TIME = 3000
/** Messages one address can send per hour. */
const MAX_PER_HOUR = 5

/** Saves a message from the contact page; bots get a thank-you too, and nothing is saved. */
export const sendContactMessage = createServerFn({ method: 'POST' })
  .validator(contactInput)
  .handler(async ({ data }) => {
    if (data.company || Date.now() - data.openedAt < MIN_FILL_TIME) return { ok: true }
    const email = data.email.toLowerCase()
    const [{ sent }] = await db
      .select({ sent: count() })
      .from(contactMessages)
      .where(and(eq(contactMessages.email, email), gt(contactMessages.createdAt, new Date(Date.now() - 60 * 60_000))))
    if (sent >= MAX_PER_HOUR) throw new Error('Hai già inviato diversi messaggi: riprova tra un po’.')
    const [saved] = await db
      .insert(contactMessages)
      .values({
      topic: data.topic,
      name: data.name,
      email,
      phone: data.phone,
      subject: data.topic === 'varie' ? null : data.subject,
      eventDate: data.topic === 'evento' ? data.eventDate : null,
      website: data.website,
      message: data.message,
      })
      .returning()
    // The message is saved either way: a failed mail only leaves it to the admin's Messages page.
    try {
      await notify(saved)
    } catch (error) {
      console.error('Contact message saved, but the notification mail failed:', error)
    }
    return { ok: true }
  })

/** Mails the staff about a new message; replying to the mail answers the visitor. */
async function notify(message: ContactMessage) {
  const topic = CONTACT_TOPICS[message.topic]
  const rows = (
    [
      ['Argomento', topic.label],
      [topic.subject ?? 'Oggetto', message.subject],
      ['Quando', message.eventDate],
      ['Sito', message.website],
      ['Nome', message.name],
      ['Email', message.email],
      ['Telefono', message.phone],
    ] as [string, string | null][]
  ).filter((row): row is [string, string] => Boolean(row[1]))
  const link = absoluteUrl('/admin/messaggi')

  const sent = await sendToContactAddress({
    subject: `[Visit Camaiore] ${topic.label}${message.subject ? `: ${message.subject}` : ''} · ${message.name}`,
    replyTo: `"${message.name.replace(/["\\\r\n]/g, '')}" <${message.email}>`,
    text: [...rows.map(([label, value]) => `${label}: ${value}`), '', message.message, '', `Tutti i messaggi: ${link}`].join('\n'),
    html: `<table cellpadding="4" style="font-family:sans-serif;font-size:14px">${rows
      .map(([label, value]) => `<tr><th align="left" style="color:#2a9d8f">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
      .join('')}</table>
<p style="font-family:sans-serif;font-size:14px;white-space:pre-line;background:#f6f1e7;padding:12px">${escapeHtml(message.message)}</p>
<p style="font-family:sans-serif;font-size:13px"><a href="${escapeHtml(link)}">Apri i messaggi nel backoffice</a> · rispondi a questa mail per scrivere a ${escapeHtml(message.name)}.</p>`,
  })
  if (!sent) console.warn('Contact message saved; no mail sent: SMTP_HOST, SMTP_USER, SMTP_PASSWORD or CONTACT_EMAIL_TO is missing.')
}

// ── Admin ────────────────────────────────────────────────────────────────────

export const listContactMessages = createServerFn({ method: 'GET' })
  .middleware([requireEditor])
  .handler(() => db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(500))

export const setContactMessageRead = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(z.object({ id: z.uuid(), read: z.boolean() }))
  .handler(async ({ data }) => {
    await db.update(contactMessages).set({ read: data.read }).where(eq(contactMessages.id, data.id))
  })

export const deleteContactMessage = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await db.delete(contactMessages).where(eq(contactMessages.id, data.id))
  })
