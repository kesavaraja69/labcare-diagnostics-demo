import { cn } from '@/lib/utils'

/**
 * LabCare wordmark. The mark is an inline SVG so it renders crisply at any size
 * and works inside sandboxed previews with no external assets.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} role="img" aria-label="LabCare Diagnostics mark">
      <defs>
        <linearGradient id="lc-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#377ec3" />
          <stop offset="100%" stopColor="#1caaa3" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lc-mark)" />
      <path
        d="M11.5 26.5V13.5h3.2v10.2h5.1v2.8h-8.3Z"
        fill="#fff"
        opacity="0.95"
      />
      <path
        d="M22.6 26.5c-1.9 0-3.4-1.4-3.4-3.2 0-2 1.6-3.3 4-3.3.9 0 1.7.1 2.4.3v-.5c0-1.2-.8-1.9-2.1-1.9-1 0-1.9.3-2.8.8l-.9-2.2c1.2-.7 2.5-1 3.9-1 3.1 0 4.9 1.6 4.9 4.4v4.7c0 .6-.4 1-1 1h-1.7v-.9c-.8.7-1.9 1.1-3.3 1.1Zm.6-2.3c1.4 0 2.4-.7 2.4-1.6 0-.8-.8-1.3-2.1-1.3-1.3 0-2.1.5-2.1 1.3 0 .8.8 1.6 1.8 1.6Z"
        fill="#fff"
        opacity="0.95"
      />
    </svg>
  )
}

export function Logo({
  className,
  variant = 'dark',
  showTagline = false,
}: {
  className?: string
  variant?: 'dark' | 'light'
  showTagline?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[17px] font-bold tracking-tight',
            variant === 'dark' ? 'text-navy-900' : 'text-white',
          )}
        >
          LabCare<span className={variant === 'dark' ? 'text-teal-600' : 'text-teal-300'}> Diagnostics</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              'mt-1 text-[10.5px] font-medium tracking-wide',
              variant === 'dark' ? 'text-navy-500' : 'text-white/70',
            )}
          >
            Accurate Testing. Easy Booking. Better Healthcare.
          </span>
        )}
      </span>
    </span>
  )
}
