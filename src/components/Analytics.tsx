import { useEffect } from 'react'

import { useConsent } from '#/lib/consent'

/** Google Tag Manager container, which loads Google Analytics. */
const GTM_ID = 'GTM-NLD538TX'

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

/** Not on the developer's machine: its visits would end up in the statistics. */
const isLocal = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)

function loadTagManager() {
  if (document.getElementById('gtm')) return
  window.dataLayer = window.dataLayer || []
  // Consent mode: statistics granted, as the visitor chose; advertising stays off.
  // gtag's commands must be pushed as `arguments`, not as arrays.
  const gtag = function (..._args: unknown[]) {
    window.dataLayer!.push(arguments)
  }
  gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
  gtag('js', new Date())
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.id = 'gtm'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(script)
}

/** Deletes the cookies of Google Analytics (_ga, _ga_<id>, _gid), on this host and its parent domains. */
function clearAnalyticsCookies() {
  const names = document.cookie
    .split('; ')
    .map((c) => c.split('=')[0])
    .filter((name) => /^(_ga|_ga_.+|_gid|_gat.*)$/.test(name))
  const parts = location.hostname.split('.')
  const domains = [undefined, ...parts.slice(0, -1).map((_, i) => `.${parts.slice(i).join('.')}`)]
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`
  }
}

/**
 * Loads Google Tag Manager once the visitor accepts the statistics, never before.
 * Withdrawing consent deletes the Analytics cookies and reloads the page, which unloads the script.
 */
export function Analytics() {
  const consent = useConsent()
  const analytics = consent?.analytics

  useEffect(() => {
    if (analytics === undefined || isLocal()) return
    if (analytics) loadTagManager()
    else if (document.getElementById('gtm')) {
      clearAnalyticsCookies()
      location.reload()
    } else {
      // Left over from an earlier visit with consent.
      clearAnalyticsCookies()
    }
  }, [analytics])

  return null
}
