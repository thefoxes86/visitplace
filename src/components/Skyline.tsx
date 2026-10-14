import { useEffect, useState } from 'react'

/** Set once the skyline has drawn itself: later pages show it already drawn. */
let drawn = false

/**
 * Line-art skyline of Camaiore: the Apuan Alps behind, town houses, the
 * Collegiata façade and its bell tower. Its lines end on the bottom edge, so a
 * border under the parent continues them as a baseline.
 *
 * With `animate`, it is the page's hero skyline: it draws itself on the first
 * page load only, and page transitions carry it over from one page to the next
 * (see `skyline` in styles.css) instead of remounting it.
 */
export function Skyline({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const [draw] = useState(() => (animate && !drawn ? 'skyline-draw' : undefined))
  useEffect(() => {
    if (animate) drawn = true
  }, [animate])

  return (
    <svg
      aria-hidden
      style={animate ? { viewTransitionName: 'skyline' } : undefined}
      viewBox="0 0 240 120"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
    >
      {/* Mountains */}
      <path
        pathLength={1}
        className={draw}
        strokeWidth={1.5}
        opacity={0.55}
        d="M0 78 L24 46 L38 60 L62 22 L86 54 L104 40 L132 70"
      />
      {/* Town outline */}
      <path
        pathLength={1}
        className={draw}
        strokeWidth={3}
        d="M2 120 V98 H22 V86 L34 76 L46 86 V104 H58 V78 H70 V64 L78 56 L86 64 V78 H96 V100 Q108 84 120 100 H132 V76 L154 58 L176 76 V98 H190 V30 L200 12 L210 30 V120"
      />
      {/* Details: windows, rose window, belfry, door */}
      <path
        pathLength={1}
        className={draw}
        style={{ animationDelay: '900ms' }}
        strokeWidth={2}
        d="M28 94 V100 M40 94 V100 M64 86 H66 M64 94 H66 M148 120 V106 Q148 98 154 98 Q160 98 160 106 V120 M196 52 V44 Q200 38 204 44 V52 Z M196 70 V64 Q200 58 204 64 V70 Z M196 40 H204"
      />
      <circle
        pathLength={1}
        className={draw}
        style={{ animationDelay: '900ms' }}
        cx={154}
        cy={80}
        r={4.5}
        strokeWidth={2}
      />
    </svg>
  )
}
