import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Clock,
  Download,
  FileText,
  Filter,
  FlaskConical,
  Home,
  Inbox,
  MapPin,
  MoreVertical,
  Package as PackageIcon,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState, Tabs, TabsList, TabsTrigger } from '@/components/ui/misc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { StatusBadge } from '@/components/brand/StatusBadge'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { BookingTimeline, TimelineProgress } from '@/components/booking/BookingTimeline'
import { PackageArtwork } from '@/components/brand/PackageArtwork'
import { RowSkeleton } from '@/components/common/Loaders'
import { useBookings, usePackages, useDemoStore } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { ALL_BOOKING_STATUSES, type Booking, type BookingStatus } from '@/types'
import { formatLongDate, formatShortDate } from '@/lib/date'
import { buildReceiptHtml, openHtmlDocument } from '@/lib/documents'
import { inr } from '@/lib/utils'

type FilterKey = 'all' | 'upcoming' | 'active' | 'ready' | 'completed' | 'cancelled'

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'All bookings' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'active', label: 'In progress' },
  { id: 'ready', label: 'Report ready' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

export default function MyBookingsPage() {
  const { bookings, cancelBooking } = useBookings()
  const { packages } = usePackages()
  const { session, resetDemo } = useDemoStore()
  const { success, info } = useToast()
  const navigate = useNavigate()

  const [filter, setFilter] = React.useState<FilterKey>('all')
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [timelineFor, setTimelineFor] = React.useState<Booking | null>(null)
  const [cancelFor, setCancelFor] = React.useState<Booking | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420)
    return () => clearTimeout(t)
  }, [])

  const sorted = React.useMemo(
    () => [...bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [bookings],
  )

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    return sorted.filter((b) => {
      if (term) {
        const hay = `${b.bookingNo} ${b.packageName} ${b.patient.fullName} ${b.patient.mobile} ${b.status}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      switch (filter) {
        case 'upcoming':
          return ['Pending', 'Confirmed', 'Sample Collection Scheduled'].includes(b.status)
        case 'active':
          return ['Sample Collected', 'Processing'].includes(b.status)
        case 'ready':
          return b.status === 'Report Ready'
        case 'completed':
          return b.status === 'Completed'
        case 'cancelled':
          return b.status === 'Cancelled'
        default:
          return true
      }
    })
  }, [sorted, filter, search])

  const counts = React.useMemo(
    () => ({
      all: bookings.length,
      upcoming: bookings.filter((b) => ['Pending', 'Confirmed', 'Sample Collection Scheduled'].includes(b.status)).length,
      active: bookings.filter((b) => ['Sample Collected', 'Processing'].includes(b.status)).length,
      ready: bookings.filter((b) => b.status === 'Report Ready').length,
      completed: bookings.filter((b) => b.status === 'Completed').length,
      cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
    }),
    [bookings],
  )

  const handleDownloadReceipt = (booking: Booking) => {
    openHtmlDocument(buildReceiptHtml(booking))
    success('Demo receipt opened', `${booking.bookingNo} receipt generated in a new tab.`)
  }

  const handleCancel = () => {
    if (!cancelFor) return
    const updated = cancelBooking(cancelFor.id, 'Cancelled by customer from My Bookings (demo)')
    setCancelFor(null)
    if (updated) success('Booking cancelled', `${updated.bookingNo} has been marked as cancelled in the demo.`)
  }

  return (
    <div className="bg-background">
      {/* Page header */}
      <div className="border-b border-navy-100 bg-white">
        <div className="container-page py-6 lg:py-8">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-navy-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-700">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-navy-700">My Bookings</span>
          </nav>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Bookings</h1>
              <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-navy-500">
                {session
                  ? `Signed in as ${session.name}. Track every stage of your sample collection and download reports from here.`
                  : 'Track every stage of your sample collection and download reports. This demo shows all seeded bookings so the timeline can be demonstrated end to end.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="outline" asChild>
                <Link to="/packages">
                  <ShoppingBag className="h-4 w-4" />
                  Book another test
                </Link>
              </Button>
              {!session && (
                <Button variant="ghost" asChild>
                  <Link to="/login">Use a demo account</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Summary strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total bookings', value: counts.all, icon: PackageIcon },
              { label: 'Upcoming', value: counts.upcoming, icon: CalendarDays },
              { label: 'Report ready', value: counts.ready, icon: FileText },
              { label: 'Completed', value: counts.completed, icon: Receipt },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-navy-100 bg-navy-50/50 p-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-teal-600 shadow-soft">
                  <stat.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-2.5 font-display text-xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-[11.5px] font-medium text-navy-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-7 lg:py-9">
        {/* Toolbar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by booking ID, package or patient name"
                className="h-11 pl-10 pr-10"
                aria-label="Search bookings"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-navy-400 hover:bg-navy-50"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <AlertDialog>
              <button
                type="button"
                onClick={() => undefined}
                className="hidden"
                aria-hidden
                tabIndex={-1}
              />
              <Button
                variant="ghost"
                size="sm"
                className="self-start text-navy-400 hover:text-red-600"
                onClick={() => {
                  resetDemo()
                  success('Demo data reset', 'All seeded bookings have been restored for the demonstration.')
                }}
              >
                Restore demo bookings
              </Button>
            </AlertDialog>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList className="sm:flex-wrap">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>
                  {f.label}
                  <span className="rounded-full bg-navy-100 px-1.5 text-[10.5px] font-bold text-navy-600">
                    {counts[f.id]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <RowSkeleton count={4} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title={search ? 'No bookings match your search' : 'No bookings in this view'}
              description={
                search
                  ? 'Try a different booking ID, package name or patient name — or clear the search to see all demo bookings.'
                  : 'Nothing has been booked in this category yet. Browse the demo catalogue to create a booking.'
              }
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  {search && (
                    <Button variant="outline" onClick={() => setSearch('')}>
                      Clear search
                    </Button>
                  )}
                  <Button variant="accent" asChild>
                    <Link to="/packages">
                      <ShoppingBag className="h-4 w-4" />
                      Book a package
                    </Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <ul className="space-y-4">
              {filtered.map((booking) => {
                const pkg = packages.find((p) => p.id === booking.packageId)
                const canCancel = ['Pending', 'Confirmed', 'Sample Collection Scheduled'].includes(booking.status)

                return (
                  <li key={booking.id}>
                    <article className="card-surface overflow-hidden transition-shadow hover:shadow-card">
                      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center">
                        <div className="flex min-w-0 flex-1 gap-4">
                          {pkg ? (
                            <PackageArtwork
                              pkg={pkg}
                              size="thumb"
                              rounded="rounded-xl"
                              className="hidden h-20 w-20 shrink-0 sm:block"
                            />
                          ) : (
                            <span className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-400 sm:flex">
                              <FlaskConical className="h-6 w-6" aria-hidden />
                            </span>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[11px]">
                                {booking.bookingNo}
                              </Badge>
                              <StatusBadge status={booking.status} />
                            </div>

                            <h2 className="mt-2 text-[15.5px] font-semibold leading-snug text-navy-900">
                              <Link to={`/my-bookings/${booking.id}`} className="hover:text-teal-700">
                                {booking.packageName}
                              </Link>
                            </h2>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-navy-500">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                                {formatShortDate(booking.appointmentDate)} · {booking.timeSlot}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                {booking.collectionMethod === 'Home Sample Collection' ? (
                                  <Home className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                                ) : (
                                  <MapPin className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                                )}
                                {booking.collectionMethod}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <FlaskConical className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                                {booking.patient.fullName} · {booking.testsCount} tests
                              </span>
                            </div>

                            <div className="mt-3 max-w-md">
                              <TimelineProgress status={booking.status} />
                              <p className="mt-1.5 text-[11.5px] text-navy-400">
                                {booking.status === 'Cancelled'
                                  ? 'This booking has been cancelled'
                                  : `Next step: ${
                                      nextStatus(booking.status) === booking.status
                                        ? 'All steps complete'
                                        : nextStatus(booking.status)
                                    }`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 border-t border-navy-100 pt-4 lg:w-56 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                          <div className="flex items-baseline justify-between gap-3 lg:block">
                            <span className="text-[11.5px] font-semibold uppercase tracking-wider text-navy-400">
                              Amount
                            </span>
                            <p className="font-display text-xl font-bold text-navy-900 lg:mt-0.5">
                              {inr(booking.pricing.total)}
                            </p>
                            <p className="text-[11.5px] text-navy-400 lg:mt-0.5">
                              {booking.payment.state === 'Paid' ? `Paid · ${booking.payment.method}` : `Pay at lab · ${booking.payment.method}`}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                            <Button size="sm" onClick={() => navigate(`/my-bookings/${booking.id}`)}>
                              View Booking
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTimelineFor(booking)}
                              className="lg:hidden"
                            >
                              Timeline
                            </Button>
                            {booking.status === 'Report Ready' ? (
                              <Button size="sm" variant="accent" onClick={() => navigate(`/my-bookings/${booking.id}?report=1`)}>
                                <FileText className="h-4 w-4" />
                                View Report
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hidden lg:inline-flex"
                                onClick={() => setTimelineFor(booking)}
                              >
                                Timeline
                              </Button>
                            )}
                          </div>

                          <div className="hidden lg:block">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full">
                                  <MoreVertical className="h-4 w-4" />
                                  More actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="top" align="end">
                                <DropdownMenuItem onSelect={() => handleDownloadReceipt(booking)}>
                                  <Download className="h-4 w-4 text-navy-400" />
                                  Download receipt
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setTimelineFor(booking)}>
                                  <Clock className="h-4 w-4 text-navy-400" />
                                  View timeline
                                </DropdownMenuItem>
                                {canCancel && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onSelect={() => setCancelFor(booking)}>
                                      <Trash2 className="h-4 w-4" />
                                      Cancel booking
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {(booking.status === 'Report Ready' || booking.status === 'Completed') && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-success-100 bg-success-50/60 px-4 py-3 sm:px-5">
                          <p className="flex items-center gap-2 text-[13px] font-semibold text-success-700">
                            <FileText className="h-4 w-4" aria-hidden />
                            Demo report is available for this booking
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="accent" asChild>
                              <Link to={`/my-bookings/${booking.id}?report=1`}>
                                View Report
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(booking)}>
                              <Download className="h-3.5 w-3.5" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      )}
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <DemoNotice className="mt-8">
          Every booking listed here is fictional sample data created for this demonstration. Cancelling or resetting
          bookings only affects demo data stored in your browser.
        </DemoNotice>
      </div>

      {/* Timeline dialog */}
      <Dialog open={Boolean(timelineFor)} onOpenChange={() => setTimelineFor(null)}>
        <DialogContent size="md">
          {timelineFor && (
            <>
              <DialogHeader>
                <DialogTitle>Booking timeline</DialogTitle>
                <DialogDescription>
                  {timelineFor.bookingNo} · {timelineFor.packageName}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-navy-50/60 p-3.5">
                <StatusBadge status={timelineFor.status} />
                <span className="text-[12.5px] text-navy-500">
                  {timelineFor.collectionMethod} · {formatLongDate(timelineFor.appointmentDate)} · {timelineFor.timeSlot}
                </span>
              </div>
              <div className="mt-5 max-h-[52vh] overflow-y-auto pr-1 scrollbar-thin">
                <BookingTimeline booking={timelineFor} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTimelineFor(null)}>
                  Close
                </Button>
                <Button onClick={() => navigate(`/my-bookings/${timelineFor.id}`)}>Open full booking</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <AlertDialog open={Boolean(cancelFor)} onOpenChange={() => setCancelFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelFor?.bookingNo} — {cancelFor?.packageName} for {cancelFor?.patient.fullName}. In this demo the
              booking will be marked as Cancelled and the timeline will update everywhere in the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} variant="destructive">
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function nextStatus(status: BookingStatus): BookingStatus {
  const index = ALL_BOOKING_STATUSES.indexOf(status)
  if (index < 0 || index >= 6) return status
  return ALL_BOOKING_STATUSES[index + 1]
}
