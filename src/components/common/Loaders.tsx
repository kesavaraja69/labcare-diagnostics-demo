import { Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/utils'

export function PackageCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-soft', className)}>
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function PackageGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PackageCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function RowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

/** Full-page centered spinner used while the demo store hydrates. */
export function PageLoader({ label = 'Loading demo data…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-navy-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-teal-500" />
      </div>
      <p className="text-sm font-medium text-navy-500">{label}</p>
    </div>
  )
}

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white',
        className,
      )}
      aria-hidden
    />
  )
}
