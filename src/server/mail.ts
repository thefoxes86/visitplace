import nodemailer from 'nodemailer'

import type { Transporter } from 'nodemailer'

/**
 * Email over SMTP, with the credentials in server-only environment variables:
 *
 * - SMTP_HOST, SMTP_PORT (465 uses TLS from the start, others STARTTLS), SMTP_USER, SMTP_PASSWORD
 * - MAIL_FROM: the sender, e.g. "Visit Camaiore <noreply@visitcamaiore.it>"; defaults to SMTP_USER
 * - CONTACT_EMAIL_TO: who receives the messages of the contact page, comma separated
 */
function mailConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, CONTACT_EMAIL_TO } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !CONTACT_EMAIL_TO) return null
  const port = Number(SMTP_PORT) || 587
  return {
    transport: { host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } },
    from: MAIL_FROM || SMTP_USER,
    contactTo: CONTACT_EMAIL_TO,
  }
}

let transporter: Transporter | undefined

interface Mail {
  subject: string
  text: string
  html: string
  /** Where replies go: the visitor who wrote. */
  replyTo?: string
}

/** Sends a mail to the contact address. False when email isn't configured. */
export async function sendToContactAddress(mail: Mail) {
  const config = mailConfig()
  if (!config) return false
  transporter ??= nodemailer.createTransport(config.transport)
  await transporter.sendMail({ from: config.from, to: config.contactTo, ...mail })
  return true
}

/** Text made safe to put in HTML. */
export const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
