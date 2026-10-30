import type { PhotoCredit } from '#/lib/media'

/** "Foto: Davide Papalini · CC BY-SA 3.0 · Wikimedia Commons", linking the photo's page and its licence. */
export function PhotoCreditLine({ credit, className = '' }: { credit: PhotoCredit; className?: string }) {
  let source = 'fonte'
  try {
    source = new URL(credit.sourceUrl).hostname.replace(/^www\./, '') === 'commons.wikimedia.org' ? 'Wikimedia Commons' : 'fonte'
  } catch {}
  return (
    <span className={className}>
      Foto: {credit.author} ·{' '}
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-coral">
          {credit.license}
        </a>
      ) : (
        credit.license
      )}{' '}
      ·{' '}
      <a href={credit.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-coral">
        {source}
      </a>
    </span>
  )
}
