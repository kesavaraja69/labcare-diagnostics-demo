import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types'
import { cn } from '@/lib/utils'

const STYLES: Record<BookingStatus, { variant: Parameters<typeof Badge>[0]['variant']; dot: string }> = {
  Pending: { variant: 'warning', dot: 'bg-warning-500' },
  Confirmed: { variant: 'info', dot: 'bg-sky-500' },
  'Sample Collection Scheduled': { variant: 'violet', dot: 'bg-violet-500' },
  'Sample Collected': { variant: 'accent', dot: 'bg-teal-500' },
  Processing: { variant: 'default', dot: 'bg-navy-500' },
  'Report Ready': { variant: 'success', dot: 'bg-success-500' },
  Completed: { variant: 'success', dot: 'bg-success-600' },
  Cancelled: { variant: 'danger', dot: 'bg-red-500' },
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const style = STYLES[status] ?? STYLES.Pending
  return (
    <Badge variant={style.variant} size="lg" className={cn('font-semibold', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden />
      {status}
    </Badge>
  )
}
