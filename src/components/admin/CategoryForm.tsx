import { useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { adminCategoriesQuery } from '#/components/admin/queries'
import { Alert, Card, Field, buttonClass, errorMessage, inputClass } from '#/components/admin/ui'
import { TypeIcon } from '#/components/tourist-map/CategoryIcon'
import { categoryInput } from '#/lib/category-input'
import { sectionOf } from '#/data/categories'
import { categoryTree, subtreeIds } from '#/lib/category-tree'
import { CATEGORY_TYPES, CATEGORY_TYPE_IDS, isListType } from '#/lib/category-types'
import { CATEGORY_SECTION_IDS, getSection } from '#/data/sections'
import { slugify } from '#/lib/poi-input'
import { createCategory, updateCategory } from '#/server/categories'

import type { AdminCategory } from '#/components/admin/queries'
import type { CategoryType, CategoryTypeId } from '#/lib/category-types'

/** Suggested "Nuovo …" name for each type. */
const SINGULAR: Record<CategoryTypeId, string> = {
  event: 'evento',
  place: 'luogo',
  restaurant: 'ristorante',
  bnb: 'B&B',
  hotel: 'albergo',
  trekking: 'percorso',
  climbing: 'falesia',
  list: 'categoria',
}

/** Colours that sit well on the tourist map. */
const COLORS = ['#e5775d', '#2f6e60', '#d39a2c', '#4a6f99', '#5f8f4e', '#8a5a9e', '#8b6b4a', '#c0507a', '#33423e']

const CONTACT_LABELS = { address: 'Indirizzo', phone: 'Telefono', email: 'Email', website: 'Sito web' }

/** What a type adds to the place form, as short labels. */
const generatedFields = (type: CategoryType) => [
  ...(type.dates ? ['Data di inizio', 'Data di fine', 'Tutto il giorno', 'Ripetizione'] : []),
  ...type.fields.map((field) => field.label + (field.unit ? ` (${field.unit})` : '')),
  ...type.contacts.map((contact) => CONTACT_LABELS[contact]),
]

interface CategoryFormProps {
  /** The category being edited; left out to create a new one. */
  category?: AdminCategory
  /** Parent of a new category, when created as a subcategory. */
  parentId?: string
  /** Section of a new top-level category, when created from a section's page. */
  section?: string
}

export function CategoryForm({ category, parentId, section }: CategoryFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: all } = useSuspenseQuery(adminCategoriesQuery)
  const initialParent = all.find((c) => c.id === (category ? category.parentId : parentId))
  const [values, setValues] = useState({
    label: category?.label ?? '',
    adminLabel: category?.adminLabel ?? '',
    singular: category?.singular ?? '',
    slug: category?.slug ?? '',
    type: (category?.type ?? initialParent?.type ?? '') as CategoryTypeId | '',
    color: category?.color ?? initialParent?.color ?? COLORS[0],
    sortOrder: category?.sortOrder ?? 0,
    parentId: initialParent?.id ?? '',
    section: category?.section ?? (CATEGORY_SECTION_IDS.find((id) => id === section) || ''),
    featured: category?.featured ?? false,
  })
  const parent = all.find((c) => c.id === values.parentId)
  /** A subcategory has its parent's type, so its places keep the same fields; under a list it picks its own. */
  const typeLocked = Boolean(parent && !isListType(parent.type))
  /** Subcategories follow the section of their top-level category. */
  const parentSection = parent ? getSection(sectionOf(all, parent.id) ?? '') : undefined
  // A category can't go under itself or one of its subcategories.
  const ownSubtree = category ? subtreeIds(all, category.id) : new Set<string>()
  const parentOptions = categoryTree(all).filter((c) => !ownSubtree.has(c.id))
  const subcategories = ownSubtree.size - 1
  /** Fields that follow the name until edited by hand (new categories only). */
  const [touched, setTouched] = useState(() => new Set(category ? ['slug', 'adminLabel', 'singular'] : []))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors(({ [key]: _, ...rest }) => rest)
    setFormError(null)
  }
  const touch = (key: string) => setTouched((prev) => new Set(prev).add(key))

  function setLabel(label: string) {
    set('label', label)
    if (!touched.has('slug')) set('slug', slugify(label))
    if (!touched.has('adminLabel')) set('adminLabel', label)
  }

  function setType(type: CategoryTypeId) {
    set('type', type)
    if (!touched.has('singular')) set('singular', SINGULAR[type])
  }

  function setParent(id: string) {
    set('parentId', id)
    const next = all.find((c) => c.id === id)
    if (next && !isListType(next.type)) setType(next.type as CategoryTypeId)
  }

  const typeChanged = category && values.type !== category.type && category.places > 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = categoryInput.safeParse({
      ...values,
      // The id is the first address and never changes: places point to it.
      id: category?.id ?? values.slug,
      type: values.type || undefined,
      parentId: values.parentId || null,
      section: values.section || null,
    })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
      setErrors(fieldErrors)
      setFormError('Controlla i campi evidenziati.')
      return
    }
    setSaving(true)
    try {
      await (category ? updateCategory : createCategory)({ data: parsed.data })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
      ])
      navigate({ to: '/admin/categorie' })
    } catch (error) {
      setFormError(errorMessage(error))
      setSaving(false)
    }
  }

  const selectedType = values.type ? CATEGORY_TYPES[values.type] : null

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        {formError && <Alert>{formError}</Alert>}

        <Card title="Posizione">
          <Field
            label="Categoria padre"
            htmlFor="parentId"
            error={errors.parentId}
            hint="Scegline una per creare una sottocategoria: i suoi contenuti compaiono anche nella categoria padre."
          >
            <select id="parentId" value={values.parentId} onChange={(e) => setParent(e.target.value)} className={inputClass}>
              <option value="">Nessuna · categoria principale</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {'\u00a0\u00a0'.repeat(c.depth)}
                  {c.depth > 0 ? '└ ' : ''}
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          {parent ? (
            <p className="mt-4 text-sm font-light">
              Sezione del sito: <span className="font-semibold text-teal">{parentSection?.title ?? '—'}</span>, come la categoria padre.
            </p>
          ) : (
            <Field
              label="Sezione del sito"
              htmlFor="section"
              error={errors.section}
              hint="La categoria compare in questa sezione del sito e sotto di essa nel menu del backoffice."
              className="mt-4"
            >
              <select id="section" value={values.section} onChange={(e) => set('section', e.target.value)} className={inputClass}>
                <option value="" disabled>
                  Scegli una sezione…
                </option>
                {CATEGORY_SECTION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {getSection(id)?.title}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </Card>

        <Card title="Tipo">
          <p className="mb-4 text-sm font-light">
            {typeLocked
              ? `Le sottocategorie usano il tipo della categoria padre (${parent!.label}).`
              : 'Il tipo decide i campi della scheda di ogni contenuto della categoria. Una Lista raccoglie solo sottocategorie.'}
          </p>
          <div role="radiogroup" aria-label="Tipo" className="grid gap-3 sm:grid-cols-2">
            {CATEGORY_TYPE_IDS.map((id) => {
              const type = CATEGORY_TYPES[id]
              const checked = values.type === id
              return (
                <label
                  key={id}
                  className={`flex items-start gap-3 rounded-md border p-3 transition ${
                    checked ? 'border-teal bg-mint-light/60 ring-1 ring-teal' : 'border-ink/15'
                  } ${typeLocked ? (checked ? '' : 'opacity-40') : 'cursor-pointer hover:border-teal'}`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={id}
                    checked={checked}
                    disabled={typeLocked}
                    onChange={() => setType(id)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-md ${checked ? 'bg-teal text-white' : 'bg-paper text-teal'}`}
                  >
                    <TypeIcon type={id} className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{type.label}</span>
                    <span className="block text-xs font-light">{type.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
          {errors.type && <p className="mt-2 text-xs font-semibold text-coral-dark">{errors.type}</p>}

          {selectedType && !isListType(values.type) && (
            <div className="mt-5 border-t border-ink/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal">Campi generati</p>
              <p className="mt-1 text-xs font-light">Oltre a nome, descrizione, posizione e immagine:</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {generatedFields(selectedType).map((label) => (
                  <li key={label} className="rounded-full bg-mint-light px-2.5 py-1 text-xs font-semibold text-teal">
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {category && values.type === 'list' && category.places > 0 && (
            <p className="mt-4 rounded-md bg-coral/10 px-3 py-2 text-xs font-semibold text-coral-dark">
              La categoria ha {category.places} contenuti: una Lista non ne ha di propri, spostali prima in una sottocategoria.
            </p>
          )}
          {category && values.type !== category.type && values.type !== 'list' && subcategories > 0 && (
            <p className="mt-4 rounded-md bg-coral/10 px-3 py-2 text-xs font-semibold text-coral-dark">
              Anche le {subcategories} sottocategorie passeranno al nuovo tipo.
            </p>
          )}
          {typeChanged && values.type !== 'list' && (
            <p className="mt-4 rounded-md bg-coral/10 px-3 py-2 text-xs font-semibold text-coral-dark">
              La categoria ha {category.places} contenuti: i dettagli che il nuovo tipo non prevede non saranno più mostrati,
              e verranno tolti quando ciascun contenuto sarà salvato di nuovo.
            </p>
          )}
        </Card>

        <Card title="Nomi">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="label" error={errors.label} hint="Sul sito: filtri della mappa, etichette. Es. Trekking">
              <input id="label" value={values.label} onChange={(e) => setLabel(e.target.value)} className={inputClass} autoFocus={!category} />
            </Field>
            <Field label="Nome al singolare" htmlFor="singular" error={errors.singular} hint={`Nel backoffice: "Nuovo ${values.singular || '…'}"`}>
              <input
                id="singular"
                value={values.singular}
                onChange={(e) => {
                  touch('singular')
                  set('singular', e.target.value)
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Nome nel menu del backoffice" htmlFor="adminLabel" error={errors.adminLabel}>
              <input
                id="adminLabel"
                value={values.adminLabel}
                onChange={(e) => {
                  touch('adminLabel')
                  set('adminLabel', e.target.value)
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Indirizzo" htmlFor="slug" error={errors.slug} hint={`/admin/${values.slug || '…'} e /categorie/${values.slug || '…'} sul sito`}>
              <input
                id="slug"
                value={values.slug}
                onChange={(e) => {
                  touch('slug')
                  set('slug', slugify(e.target.value))
                }}
                className={inputClass}
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card title="Aspetto">
          <Field label="Colore" htmlFor="color" error={errors.color} hint="Segnaposto sulla mappa ed etichette.">
            <div className="flex flex-wrap items-center gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Colore ${color}`}
                  aria-pressed={values.color.toLowerCase() === color}
                  onClick={() => set('color', color)}
                  className={`size-7 rounded-full ring-offset-2 transition ${values.color.toLowerCase() === color ? 'ring-2 ring-teal' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                id="color"
                type="color"
                value={values.color}
                onChange={(e) => set('color', e.target.value)}
                className="size-8 cursor-pointer rounded border border-ink/20 bg-white"
                title="Altro colore"
              />
            </div>
          </Field>
          <div className="mt-4 flex items-center gap-3 rounded-md bg-paper p-3">
            <span className="grid size-9 place-items-center rounded-md text-white" style={{ backgroundColor: values.color }}>
              <TypeIcon type={values.type || 'place'} className="size-5" />
            </span>
            <span className="text-sm font-semibold" style={{ color: values.color }}>
              {values.label || 'Anteprima'}
            </span>
          </div>
          <Field label="Ordine" htmlFor="sortOrder" error={errors.sortOrder} hint={category ? 'Posizione tra le categorie dello stesso livello: prima i numeri più bassi.' : 'Posizione tra le categorie dello stesso livello. Lascia 0 per metterla in fondo.'} className="mt-4">
            <input
              id="sortOrder"
              type="number"
              min={0}
              step={1}
              value={values.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value) || 0)}
              className={inputClass}
            />
          </Field>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="mt-0.5 size-4 accent-teal"
            />
            <span>
              <span className="block text-sm font-semibold">In evidenza</span>
              <span className="block text-xs font-light">Mostra la categoria tra quelle in evidenza della home page.</span>
            </span>
          </label>
        </Card>

        <Card>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={buttonClass.primary}>
              {saving ? 'Salvataggio…' : category ? 'Salva modifiche' : 'Crea categoria'}
            </button>
            <Link to="/admin/categorie" className={buttonClass.secondary}>
              Annulla
            </Link>
          </div>
        </Card>
      </div>
    </form>
  )
}
