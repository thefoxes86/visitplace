import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-mint disabled:bg-paper disabled:text-ink/60'

export const buttonClass = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal disabled:opacity-50',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-coral-dark transition hover:bg-coral/10 disabled:opacity-50',
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-mint pb-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-coral sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 font-serif italic text-teal">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

interface FieldProps {
  label: string
  /** id of the control the label is for. */
  htmlFor?: string
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, hint, error, className = '', children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-teal">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-semibold text-coral-dark">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs font-light text-ink/70">{hint}</p>
      )}
    </div>
  )
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-ink/10 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-teal">{title}</h2>}
      {children}
    </section>
  )
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-md border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
      {children}
    </p>
  )
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === 'string' ? error : 'Qualcosa è andato storto'

/** An on/off switch with a label and a hint. */
export function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-ink/20 transition peer-checked:bg-teal peer-focus-visible:ring-2 peer-focus-visible:ring-mint after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4"
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs font-light text-ink/70">{hint}</span>
      </span>
    </label>
  )
}
