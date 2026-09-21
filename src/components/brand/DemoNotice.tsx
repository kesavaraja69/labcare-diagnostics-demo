import * as React from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Consistent, honest labelling of demo-only content. Used wherever prices,
 * reports, credentials or contact details could be mistaken for real data.
 */
export function DemoNotice({
  children,
  className,
  variant = 'default',
  icon = true,
}: {
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'inline' | 'amber'
  icon?: boolean
}) {
  const content = children ?? (
    <>
      Demo information only — prices, packages, reports and contact details on this website are fictional sample
      data created for a client demonstration.
    </>
  )

  if (variant === 'inline') {
    return (
      <p className={cn('flex items-start gap-1.5 text-[12px] leading-relaxed text-navy-400', className)}>
        {icon && <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />}
        <span>{content}</span>
      </p>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12.5px] leading-relaxed',
        variant === 'amber'
          ? 'border-warning-100 bg-warning-50 text-warning-700'
          : 'border-navy-100 bg-navy-50/70 text-navy-500',
        className,
      )}
      role="note"
    >
      {icon && <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
      <span>{content}</span>
    </div>
  )
}

export function DemoRibbon() {
  return (
    <div className="border-b border-amber-200/70 bg-amber-50 px-4 py-1.5 text-center text-[11.5px] font-medium text-amber-800 no-print">
      Demonstration website for LabCare Diagnostics — all packages, prices, bookings and reports are fictional sample
      data.
    </div>
  )
}
