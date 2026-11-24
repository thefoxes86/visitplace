/**
 * Sends events to /api/events of the site, local or online.
 *
 *   npm run event:add -- --list            event categories and upcoming events
 *   npm run event:add -- evento.json       adds the event in the file (or a JSON array of events)
 *   npm run event:add -- -                 reads the JSON from stdin
 *
 * Reads EVENTS_API_URL (default http://localhost:3000) and EVENTS_API_TOKEN from .env.local.
 * The fields are described in .claude/skills/nuovo-evento/SKILL.md.
 */
import { readFileSync } from 'node:fs'

const base = (process.env.EVENTS_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const token = process.env.EVENTS_API_TOKEN
if (!token) {
  console.error('Manca EVENTS_API_TOKEN in .env.local')
  process.exit(1)
}

const arg = process.argv[2]
if (!arg) {
  console.error('Uso: npm run event:add -- --list | <file.json> | -')
  process.exit(1)
}

async function call(method: 'GET' | 'POST', body?: unknown) {
  const response = await fetch(`${base}/api/events`, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(body !== undefined && { 'content-type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({ error: `Risposta non valida (HTTP ${response.status})` }))
  return { ok: response.ok, data }
}

console.error(`→ ${base}`)

if (arg === '--list') {
  const { ok, data } = await call('GET')
  console.log(JSON.stringify(data, null, 2))
  process.exit(ok ? 0 : 1)
}

const raw = arg === '-' ? readFileSync(0, 'utf8') : readFileSync(arg, 'utf8')
const parsed: unknown = JSON.parse(raw)
const events = Array.isArray(parsed) ? parsed : [parsed]

let failed = 0
for (const event of events) {
  const { ok, data } = await call('POST', event)
  const name = (event as { name?: string }).name ?? '(senza nome)'
  if (ok) console.log(`✓ ${name}: ${data.published ? 'pubblicato' : 'bozza'}${data.onMap ? '' : ', non in mappa'}\n  ${data.page}\n  modifica: ${data.edit}`)
  else {
    failed++
    console.log(`✗ ${name}: ${data.error}`)
  }
}
process.exit(failed ? 1 : 0)
