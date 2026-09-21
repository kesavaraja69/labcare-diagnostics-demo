import * as React from 'react'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow && <p className="label-caps mb-2 text-teal-600">{eyebrow}</p>}
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="mt-2.5 text-[15px] leading-relaxed text-navy-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function StarRating({
  rating,
  count,
  className,
  size = 'sm',
}: {
  rating: number
  count?: number
  className?: string
  size?: 'sm' | 'md'
}) {
  const stars = Math.round(rating * 2) / 2
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4', i <= stars ? 'text-amber-400' : 'text-navy-200')}
            fill="currentColor"
          >
            <path d="M10 1.6l2.47 5.02 5.53.8-4 3.9.94 5.51L10 14.22 5.06 16.83 6 11.32l-4-3.9 5.53-.8L10 1.6z" />
          </svg>
        ))}
      </div>
      <span className={cn('font-semibold text-navy-800', size === 'sm' ? 'text-[12.5px]' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && <span className="text-[12px] text-navy-400">({count} demo reviews)</span>}
    </div>
  )
}
