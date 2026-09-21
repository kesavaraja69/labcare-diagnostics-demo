import * as React from 'react'
import { Check, CircleDashed, Clock, XCircle } from 'lucide-react'
import { BOOKING_STATUS_FLOW, type Booking, type BookingStatus } from '@/types'
import { formatDateTime } from '@/lib/date'
import { cn } from '@/lib/utils'

const DESCRIPTIONS: Record<BookingStatus, string> = {
  Pending: 'Your booking request has been received by the lab.',
  Confirmed: 'The lab has confirmed your appointment and package.',
  'Sample Collection Scheduled': 'A technician has been assigned to your collection slot.',
  'Sample Collected': 'Your sample has been collected and received at the laboratory.',
  Processing: 'Your sample is being analysed in the laboratory.',
  'Report Ready': 'Your digital report is ready to view and download.',
  Completed: 'Your report has been shared and the booking is complete.',
  Cancelled: 'This booking was cancelled. Contact the lab for assistance.',
}

export function BookingTimeline({
  booking,
  compact = false,
  className,
}: {
  booking: Booking
  compact?: boolean
  className?: string
}) {
  const cancelled = booking.status === 'Cancelled'
  const flow: BookingStatus[] = cancelled ? ['Pending', 'Cancelled'] : BOOKING_STATUS_FLOW
  const currentIndex = flow.indexOf(booking.status)

  /**
   * The log is append-only, so a status can appear more than once — a booking can
   * be cancelled and later reinstated, and cancelled again. A step therefore shows
   * the most recent occurrence: the one actually in force for the current status.
   * (`findLast` is unavailable at this project's ES2020 lib target.)
   */
  const eventFor = (status: BookingStatus) => {
    for (let i = booking.timeline.length - 1; i >= 0; i -= 1) {
      if (booking.timeline[i].status === status) return booking.timeline[i]
    }
    return undefined
  }

  return (
    <ol className={cn('relative', className)} aria-label="Booking progress timeline">
      {flow.map((status, i) => {
        const event = eventFor(status)
        const done = i < currentIndex || (i === currentIndex && Boolean(event))
        const isCurrent = i === currentIndex
        const isCancelled = status === 'Cancelled'
        const isLast = i === flow.length - 1

        return (
          <li key={status} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-0.5 rounded-full',
                  done && !isCurrent ? 'bg-teal-400' : 'bg-navy-100',
                )}
              />
            )}

            <span
              className={cn(
                'relative z-[1] mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isCancelled
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : done
                    ? 'border-teal-500 bg-teal-500 text-white'
                    : 'border-navy-200 bg-white text-navy-300',
                isCurrent && !isCancelled && 'shadow-glow',
              )}
              aria-hidden
            >
              {isCancelled ? (
                <XCircle className="h-4 w-4" />
              ) : done ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <CircleDashed className="h-4 w-4" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <p
                  className={cn(
                    'text-[13.5px] font-semibold',
                    isCancelled ? 'text-red-700' : done ? 'text-navy-900' : 'text-navy-400',
                  )}
                >
                  {status}
                </p>
                {isCurrent && !cancelled && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-teal-700">
                    Current
                  </span>
                )}
              </div>

              {!compact && (
                <p className={cn('mt-1 text-[12.5px] leading-snug', done ? 'text-navy-500' : 'text-navy-300')}>
                  {event?.note ?? DESCRIPTIONS[status]}
                </p>
              )}

              {event ? (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-navy-400">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {formatDateTime(event.at)}
                  {event.by && <span className="text-navy-300">· {event.by}</span>}
                </p>
              ) : (
                <p className="mt-1.5 text-[11.5px] font-medium text-navy-300">Pending step</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Horizontal progress bar version used in booking cards. */
export function TimelineProgress({ status }: { status: BookingStatus }) {
  if (status === 'Cancelled') {
    return (
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-red-100">
        <div className="h-full w-full rounded-full bg-red-400" />
      </div>
    )
  }
  const index = BOOKING_STATUS_FLOW.indexOf(status)
  const pct = ((index + 1) / BOOKING_STATUS_FLOW.length) * 100
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-navy-700 to-teal-500 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
