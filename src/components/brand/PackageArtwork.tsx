import * as React from 'react'
import { cn } from '@/lib/utils'
import type { DiagnosticPackage } from '@/types'
import { DynamicIcon } from '@/components/brand/IconRegistry'

export { DynamicIcon } from '@/components/brand/IconRegistry'

const ACCENTS: Record<DiagnosticPackage['accent'], { ring: string; chip: string; text: string; wash: string }> = {
  navy: { ring: 'from-navy-900/85 via-navy-800/45', chip: 'bg-navy-900/90', text: 'text-white', wash: 'bg-navy-50' },
  teal: { ring: 'from-teal-800/85 via-teal-700/45', chip: 'bg-teal-700/90', text: 'text-white', wash: 'bg-teal-50' },
  violet: {
    ring: 'from-violet-900/85 via-violet-800/45',
    chip: 'bg-violet-800/90',
    text: 'text-white',
    wash: 'bg-violet-50',
  },
  amber: { ring: 'from-amber-900/85 via-amber-800/45', chip: 'bg-amber-800/90', text: 'text-white', wash: 'bg-amber-50' },
  rose: { ring: 'from-rose-900/85 via-rose-800/45', chip: 'bg-rose-800/90', text: 'text-white', wash: 'bg-rose-50' },
  sky: { ring: 'from-sky-900/85 via-sky-800/45', chip: 'bg-sky-800/90', text: 'text-white', wash: 'bg-sky-50' },
}

/**
 * Package artwork. Uses the seeded demo photograph with a brand-tinted overlay
 * and an icon chip, falling back to a gradient panel if an image is missing.
 */
export function PackageArtwork({
  pkg,
  className,
  size = 'card',
  rounded = 'rounded-xl',
}: {
  pkg: Pick<DiagnosticPackage, 'image' | 'icon' | 'accent' | 'name' | 'category'>
  className?: string
  size?: 'card' | 'detail' | 'thumb'
  rounded?: string
}) {
  const [failed, setFailed] = React.useState(false)
  const accent = ACCENTS[pkg.accent] ?? ACCENTS.navy

  return (
    <div className={cn('relative overflow-hidden', rounded, accent.wash, className)}>
      {!failed ? (
        <img
          src={pkg.image}
          alt={`Illustrative demo artwork for ${pkg.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500',
            size === 'card' && 'group-hover:scale-[1.04]',
          )}
        />
      ) : (
        <div className={cn('grid h-full w-full place-items-center bg-gradient-to-br', accent.ring)}>
          <DynamicIcon name={pkg.icon} className="h-10 w-10 text-white/90" />
        </div>
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-t',
          accent.ring,
          size === 'thumb' ? 'opacity-60' : 'opacity-45',
        )}
        aria-hidden
      />

      {size !== 'thumb' && (
        <span
          className={cn(
            'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white backdrop-blur-sm',
            accent.chip,
          )}
        >
          <DynamicIcon name={pkg.icon} className="h-3.5 w-3.5" />
          {pkg.category}
        </span>
      )}
    </div>
  )
}
