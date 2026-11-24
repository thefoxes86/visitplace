import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { adminWebcamsQuery } from '#/components/admin/queries'
import { Alert, Card, Field, PageHeader, Toggle, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { WEBCAM_KINDS, WEBCAM_KIND_IDS, webcamsSetting } from '#/lib/settings'
import { saveWebcams } from '#/server/settings'

import type { Webcam, WebcamKind } from '#/lib/settings'

export const Route = createFileRoute('/admin/_panel/webcam')({
  head: () => ({ meta: [{ title: 'Webcam · Backoffice' }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminWebcamsQuery),
  component: WebcamsPage,
})

const newWebcam = (): Webcam => ({
  id: crypto.randomUUID(),
  name: '',
  area: '',
  kind: 'embed',
  url: '',
  sourceName: '',
  sourceUrl: '',
  published: true,
})

/** "https://www.youtube.com/watch?v=abc" → its embeddable player, which YouTube allows in an iframe. */
function toEmbedUrl(url: string) {
  const match = url.match(/^https:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([\w-]{6,})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

function WebcamsPage() {
  const { data } = useSuspenseQuery(adminWebcamsQuery)
  const queryClient = useQueryClient()
  const [cams, setCams] = useState<Webcam[]>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = JSON.stringify(cams) !== JSON.stringify(data)

  const update = (id: string, patch: Partial<Webcam>) => {
    setSaved(false)
    setCams((prev) => prev.map((cam) => (cam.id === id ? { ...cam, ...patch } : cam)))
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !Object.keys(patch).some((k) => key === `${id}.${k}`))))
  }
  const move = (index: number, by: number) => {
    setSaved(false)
    setCams((prev) => {
      const next = [...prev]
      const [cam] = next.splice(index, 1)
      next.splice(index + by, 0, cam)
      return next
    })
  }
  const remove = (id: string) => {
    setSaved(false)
    setCams((prev) => prev.filter((cam) => cam.id !== id))
  }
  const add = () => {
    setSaved(false)
    const cam = newWebcam()
    setCams((prev) => [...prev, cam])
    // Once rendered, start typing its name.
    requestAnimationFrame(() => document.getElementById(`${cam.id}-name`)?.focus())
  }

  async function save() {
    setFormError(null)
    const cleaned = cams.map((cam) => ({
      ...cam,
      url: cam.kind === 'embed' ? toEmbedUrl(cam.url.trim()) : cam.url.trim(),
      sourceUrl: cam.sourceUrl.trim(),
    }))
    const parsed = webcamsSetting.safeParse(cleaned)
    if (!parsed.success) {
      const found: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const [index, field] = issue.path
        if (typeof index === 'number') found[`${cleaned[index].id}.${String(field)}`] ??= issue.message
        else setFormError(issue.message)
      }
      setErrors(found)
      setFormError((prev) => prev ?? 'Controlla i campi evidenziati.')
      return
    }
    setSaving(true)
    try {
      await saveWebcams({ data: parsed.data })
      setCams(parsed.data)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminWebcamsQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: ['webcams'] }),
      ])
      setSaved(true)
    } catch (e) {
      setFormError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Webcam"
        subtitle="Le webcam della pagina Info, in quest'ordine"
        actions={
          <>
            <button type="button" onClick={add} className={buttonClass.secondary}>
              + Aggiungi webcam
            </button>
            <button type="button" onClick={save} disabled={saving || !dirty} className={buttonClass.primary}>
              {saving ? 'Salvo…' : saved && !dirty ? 'Salvato ✓' : 'Salva'}
            </button>
          </>
        }
      />

      {formError && (
        <div className="mt-6">
          <Alert>{formError}</Alert>
        </div>
      )}
      {dirty && !formError && <p className="mt-4 text-sm font-semibold text-coral-dark">Ci sono modifiche non salvate.</p>}

      {cams.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-ink/20 p-10 text-center font-serif italic text-teal">
          Nessuna webcam: sulla pagina Info la sezione dice che arriveranno presto.
        </p>
      ) : (
        <ol className="mt-6 space-y-4">
          {cams.map((cam, i) => (
            <li key={cam.id}>
              <WebcamEditor
                cam={cam}
                errors={errors}
                onChange={(patch) => update(cam.id, patch)}
                onUp={i > 0 ? () => move(i, -1) : undefined}
                onDown={i < cams.length - 1 ? () => move(i, 1) : undefined}
                onRemove={() => remove(cam.id)}
              />
            </li>
          ))}
        </ol>
      )}
    </>
  )
}

interface EditorProps {
  cam: Webcam
  errors: Record<string, string>
  onChange: (patch: Partial<Webcam>) => void
  onUp?: () => void
  onDown?: () => void
  onRemove: () => void
}

function WebcamEditor({ cam, errors, onChange, onUp, onDown, onRemove }: EditorProps) {
  const [confirming, setConfirming] = useState(false)
  const id = (field: string) => `${cam.id}-${field}`
  const error = (field: keyof Webcam) => errors[`${cam.id}.${field}`]
  const input = (field: 'name' | 'area' | 'url' | 'sourceName' | 'sourceUrl') => ({
    id: id(field),
    value: cam[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [field]: e.target.value }),
    'aria-invalid': Boolean(error(field)),
    className: inputClass,
  })
  const preview = cam.kind === 'embed' ? toEmbedUrl(cam.url.trim()) : cam.url.trim()

  return (
    <Card className={cam.published ? '' : 'opacity-80'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-teal">
          {cam.name || 'Nuova webcam'}
          {!cam.published && (
            <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-[11px] normal-case tracking-normal text-ink/70">Nascosta</span>
          )}
        </h2>
        <div className="flex gap-1">
          <button type="button" onClick={onUp} disabled={!onUp} aria-label="Sposta su" className={`${buttonClass.secondary} px-2.5 py-1.5`}>
            ↑
          </button>
          <button
            type="button"
            onClick={onDown}
            disabled={!onDown}
            aria-label="Sposta giù"
            className={`${buttonClass.secondary} px-2.5 py-1.5`}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => (confirming ? onRemove() : setConfirming(true))}
            onBlur={() => setConfirming(false)}
            className={buttonClass.danger}
          >
            {confirming ? 'Conferma' : 'Elimina'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor={id('name')} error={error('name')}>
            <input {...input('name')} placeholder="Es. Pontile" />
          </Field>
          <Field label="Zona" htmlFor={id('area')} error={error('area')}>
            <input {...input('area')} placeholder="Es. Lido di Camaiore" />
          </Field>
          <Field label="Tipo" htmlFor={id('kind')} hint={WEBCAM_KINDS[cam.kind].hint} className="sm:col-span-2">
            <select
              id={id('kind')}
              value={cam.kind}
              onChange={(e) => onChange({ kind: e.target.value as WebcamKind })}
              className={inputClass}
            >
              {WEBCAM_KIND_IDS.map((kind) => (
                <option key={kind} value={kind}>
                  {WEBCAM_KINDS[kind].label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={cam.kind === 'link' ? 'Pagina della webcam' : cam.kind === 'image' ? "Indirizzo dell'immagine" : 'Indirizzo del player'}
            htmlFor={id('url')}
            error={error('url')}
            hint="Vuoto: sulla pagina compare «In arrivo». I link di YouTube vengono convertiti nel player."
            className="sm:col-span-2"
          >
            <input {...input('url')} type="url" placeholder="https://…" />
          </Field>
          <Field label="Fonte" htmlFor={id('sourceName')} error={error('sourceName')} hint="Facoltativa · chi gestisce la webcam">
            <input {...input('sourceName')} />
          </Field>
          <Field label="Link della fonte" htmlFor={id('sourceUrl')} error={error('sourceUrl')} hint="Facoltativo">
            <input {...input('sourceUrl')} type="url" placeholder="https://…" />
          </Field>
          <div className="sm:col-span-2">
            <Toggle
              label="Pubblicata"
              hint="Spenta, la webcam resta qui ma non compare sul sito."
              checked={cam.published}
              onChange={(published) => onChange({ published })}
            />
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal">Anteprima</p>
          <div className="aspect-video overflow-hidden rounded-md bg-mint-light ring-1 ring-ink/10">
            {!/^https:\/\/\S+$/.test(preview) ? (
              <span className="grid size-full place-items-center p-3 text-center font-serif text-sm italic text-teal">In arrivo</span>
            ) : cam.kind === 'image' ? (
              <img src={preview} alt="" className="size-full object-cover" />
            ) : cam.kind === 'embed' ? (
              <iframe src={preview} title={`Anteprima ${cam.name}`} className="size-full" loading="lazy" />
            ) : (
              <a
                href={preview}
                target="_blank"
                rel="noreferrer noopener"
                className="grid size-full place-items-center bg-teal text-sm font-semibold text-white"
              >
                Guarda la webcam ↗
              </a>
            )}
          </div>
          {cam.kind === 'embed' && (
            <p className="mt-1 text-xs font-light text-ink/70">
              Se l'anteprima resta vuota o dà errore, il sito non permette di incorporarla: usa «Solo link».
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
