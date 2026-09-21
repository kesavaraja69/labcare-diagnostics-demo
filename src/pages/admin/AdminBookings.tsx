import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  Home,
  Inbox,
  MapPin,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Select } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/misc'
import { EmptyState } from '@/components/ui/misc'
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
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { useBookings, usePackages } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { ALL_BOOKING_STATUSES, BOOKING_STATUS_FLOW, type Booking, type BookingStatus } from '@/types'
import { formatDateTime, formatLongDate, formatShortDate, todayISO } from '@/lib/date'
import { buildReceiptHtml, openHtmlDocument } from '@/lib/documents'
import { cn, inr } from '@/lib/utils'

export default function AdminBookingsPage() {
  const { bookings, updateBookingStatus, cancelBooking } = useBookings()
  const { packages } = usePackages()
  const { success, info } = useToast()
  const [params, setParams] = useSearchParams()

  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | 'All'>('All')
  const [methodFilter, setMethodFilter] = React.useState<'All' | 'Visit Lab' | 'Home Sample Collection'>('All')
  const [dateFilter, setDateFilter] = React.useState('')
  const [sort, setSort] = React.useState<'newest' | 'appointment' | 'amount'>('newest')
  const [drawerBooking, setDrawerBooking] = React.useState<Booking | null>(null)
  const [timelineBooking, setTimelineBooking] = React.useState<Booking | null>(null)
  const [cancelTarget, setCancelTarget] = React.useState<Booking | null>(null)

  /* Deep-link: /admin/bookings?booking=bkg-123 opens the detail drawer */
  React.useEffect(() => {
    const id = params.get('booking')
    if (id) {
      const found = bookings.find((b) => b.id === id)
      if (found) setDrawerBooking(found)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, bookings.length])

  const closeDrawer = () => {
    setDrawerBooking(null)
    if (params.get('booking')) {
      const next = new URLSearchParams(params)
      next.delete('booking')
      setParams(next, { replace: true })
    }
  }

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = bookings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false
      if (methodFilter !== 'All' && b.collectionMethod !== methodFilter) return false
      if (dateFilter && b.appointmentDate !== dateFilter) return false
      if (term) {
        const hay =
          `${b.bookingNo} ${b.packageName} ${b.patient.fullName} ${b.patient.mobile} ${b.patient.email} ${b.status}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (sort === 'appointment') return a.appointmentDate < b.appointmentDate ? -1 : 1
      if (sort === 'amount') return b.pricing.total - a.pricing.total
      return a.createdAt < b.createdAt ? 1 : -1
    })
    return list
  }, [bookings, search, statusFilter, methodFilter, dateFilter, sort])

  const statusCounts = React.useMemo(
    () =>
      ALL_BOOKING_STATUSES.reduce<Record<string, number>>((acc, s) => {
        acc[s] = bookings.filter((b) => b.status === s).length
        return acc
      }, {}),
    [bookings],
  )

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setMethodFilter('All')
    setDateFilter('')
    setSort('newest')
  }

  const hasFilters =
    search.trim() !== '' || statusFilter !== 'All' || methodFilter !== 'All' || dateFilter !== '' || sort !== 'newest'

  const advanceStatus = (booking: Booking) => {
    const index = BOOKING_STATUS_FLOW.indexOf(booking.status)
    if (index < 0 || index >= BOOKING_STATUS_FLOW.length - 1) return
    const next = BOOKING_STATUS_FLOW[index + 1]
    updateBookingStatus(booking.id, next)
    success('Status updated', `${booking.bookingNo} → ${next}. Customer timeline updated instantly.`)
  }

  const setStatus = (booking: Booking, status: BookingStatus) => {
    updateBookingStatus(booking.id, status)
    success('Status updated', `${booking.bookingNo} is now ${status}.`)
    setDrawerBooking((current) => (current && current.id === booking.id ? { ...current, status } : current))
  }

  const exportCsv = () => {
    const header = [
      'Booking ID',
      'Created',
      'Patient',
      'Mobile',
      'Package',
      'Appointment Date',
      'Slot',
      'Collection',
      'Amount',
      'Payment',
      'Status',
    ]
    const rows = filtered.map((b) => [
      b.bookingNo,
      b.createdAt,
      b.patient.fullName,
      b.patient.mobile,
      b.packageName,
      b.appointmentDate,
      b.timeSlot,
      b.collectionMethod,
      String(b.pricing.total),
      `${b.payment.method} (${b.payment.state})`,
      b.status,
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `labcare-demo-bookings-${todayISO()}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1200)
    success('Export complete', `${filtered.length} demo bookings exported to CSV.`)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Booking management</h1>
          <p className="mt-1.5 text-[13.5px] text-navy-500">
            Search, filter and move bookings through the laboratory workflow. Status changes appear immediately on the
            customer website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/packages">
              <RefreshCw className="h-4 w-4" />
              Create test booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('All')}
          className={cn(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
            statusFilter === 'All'
              ? 'border-navy-900 bg-navy-900 text-white'
              : 'border-navy-200 bg-white text-navy-600 hover:border-navy-300',
          )}
        >
          All ({bookings.length})
        </button>
        {ALL_BOOKING_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
              statusFilter === s
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-navy-200 bg-white text-navy-600 hover:border-navy-300',
            )}
          >
            {s} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booking ID, patient, mobile or package"
              className="pl-10 pr-10"
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

          <div>
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
              aria-label="Filter by collection method"
            >
              <option value="All">All collection types</option>
              <option value="Visit Lab">Visit Lab</option>
              <option value="Home Sample Collection">Home Sample Collection</option>
            </Select>
          </div>

          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter by appointment date"
            />
          </div>

          <div>
            <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort bookings">
              <option value="newest">Newest first</option>
              <option value="appointment">Appointment date</option>
              <option value="amount">Highest amount</option>
            </Select>
          </div>

          <Button variant="outline" onClick={clearFilters} disabled={!hasFilters} className="lg:w-auto">
            <Filter className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-navy-500">
            Showing <span className="font-semibold text-navy-900">{filtered.length}</span> of{' '}
            <span className="font-semibold text-navy-900">{bookings.length}</span> demo bookings
          </p>
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {statusFilter !== 'All' && (
                <Badge variant="accent">
                  {statusFilter}
                  <button type="button" onClick={() => setStatusFilter('All')} aria-label="Remove status filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {methodFilter !== 'All' && (
                <Badge variant="accent">
                  {methodFilter}
                  <button type="button" onClick={() => setMethodFilter('All')} aria-label="Remove method filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {dateFilter && (
                <Badge variant="accent">
                  {formatShortDate(dateFilter)}
                  <button type="button" onClick={() => setDateFilter('')} aria-label="Remove date filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="bg-navy-50/70">
              <tr>
                {['Booking', 'Patient', 'Package', 'Appointment', 'Collection', 'Amount', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wider text-navy-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12">
                    <EmptyState
                      className="border-0 bg-transparent py-4"
                      icon={<Inbox className="h-5 w-5" />}
                      title="No bookings match the filters"
                      description="Adjust the search term, status chip, collection type or date, or reset the filters to see all demo bookings."
                      action={
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          <Filter className="h-4 w-4" />
                          Reset filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="border-t border-navy-100 transition-colors hover:bg-navy-50/40">
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setDrawerBooking(b)}
                        className="font-mono text-[12.5px] font-semibold text-navy-800 hover:text-teal-700"
                      >
                        {b.bookingNo}
                      </button>
                      <p className="mt-0.5 text-[11px] text-navy-400">{formatDateTime(b.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-navy-900">{b.patient.fullName}</p>
                      <p className="text-[11.5px] text-navy-500">{b.patient.mobile}</p>
                    </td>
                    <td className="max-w-[220px] px-4 py-3.5">
                      <p className="truncate text-[13px] font-medium text-navy-800">{b.packageName}</p>
                      <p className="text-[11.5px] text-navy-400">{b.testsCount} tests</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[12.5px] font-medium text-navy-800">{formatShortDate(b.appointmentDate)}</p>
                      <p className="text-[11.5px] text-navy-500">{b.timeSlot}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-navy-600">
                        {b.collectionMethod === 'Home Sample Collection' ? (
                          <Home className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                        )}
                        {b.collectionMethod === 'Home Sample Collection' ? 'Home' : 'Lab visit'}
                      </span>
                      <p className="text-[11.5px] text-navy-400">{b.payment.method}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-bold text-navy-900">{inr(b.pricing.total)}</p>
                      <p
                        className={cn(
                          'text-[11px] font-medium',
                          b.payment.state === 'Paid' ? 'text-success-600' : 'text-warning-600',
                        )}
                      >
                        {b.payment.state}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setDrawerBooking(b)}>
                          Open
                        </Button>
                        {b.status !== 'Cancelled' &&
                          b.status !== 'Completed' &&
                          BOOKING_STATUS_FLOW.indexOf(b.status) >= 0 &&
                          BOOKING_STATUS_FLOW.indexOf(b.status) < BOOKING_STATUS_FLOW.length - 1 && (
                            <Button size="sm" onClick={() => advanceStatus(b)}>
                              Advance
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <li>
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="No bookings match the filters"
              description="Adjust the filters to see demo bookings."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset filters
                </Button>
              }
            />
          </li>
        ) : (
          filtered.map((b) => (
            <li key={b.id} className="rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[12px] font-semibold text-navy-700">{b.bookingNo}</p>
                  <p className="mt-1 truncate text-[14px] font-semibold text-navy-900">{b.packageName}</p>
                </div>
                <StatusBadge status={b.status} className="shrink-0" />
              </div>

              <Separator className="my-3" />

              <dl className="grid grid-cols-2 gap-y-2.5 text-[12.5px]">
                <div>
                  <dt className="text-navy-400">Patient</dt>
                  <dd className="font-medium text-navy-800">{b.patient.fullName}</dd>
                </div>
                <div>
                  <dt className="text-navy-400">Amount</dt>
                  <dd className="font-semibold text-navy-900">{inr(b.pricing.total)}</dd>
                </div>
                <div>
                  <dt className="text-navy-400">Appointment</dt>
                  <dd className="font-medium text-navy-800">{formatShortDate(b.appointmentDate)}</dd>
                </div>
                <div>
                  <dt className="text-navy-400">Slot</dt>
                  <dd className="font-medium text-navy-800">{b.timeSlot}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-navy-400">Collection</dt>
                  <dd className="font-medium text-navy-800">
                    {b.collectionMethod} · {b.payment.method} ({b.payment.state})
                  </dd>
                </div>
              </dl>

              <div className="mt-3.5 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setDrawerBooking(b)}>
                  <Eye className="h-4 w-4" />
                  Details
                </Button>
                {b.status !== 'Cancelled' &&
                  b.status !== 'Completed' &&
                  BOOKING_STATUS_FLOW.indexOf(b.status) >= 0 &&
                  BOOKING_STATUS_FLOW.indexOf(b.status) < BOOKING_STATUS_FLOW.length - 1 && (
                    <Button size="sm" className="flex-1" onClick={() => advanceStatus(b)}>
                      Advance status
                    </Button>
                  )}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Booking detail dialog */}
      <Dialog open={Boolean(drawerBooking)} onOpenChange={closeDrawer}>
        <DialogContent size="lg">
          {drawerBooking && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2.5">
                  <DialogTitle>{drawerBooking.packageName}</DialogTitle>
                  <StatusBadge status={drawerBooking.status} />
                </div>
                <DialogDescription>
                  <span className="font-mono">{drawerBooking.bookingNo}</span> · placed{' '}
                  {formatDateTime(drawerBooking.createdAt)} · source {drawerBooking.source}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[64vh] space-y-5 overflow-y-auto pr-1 scrollbar-thin">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Panel title="Patient" icon={User}>
                    <Row label="Name" value={drawerBooking.patient.fullName} />
                    <Row label="Age / Gender" value={`${drawerBooking.patient.age} yrs · ${drawerBooking.patient.gender}`} />
                    <Row label="Mobile" value={drawerBooking.patient.mobile} />
                    <Row label="Email" value={drawerBooking.patient.email} />
                  </Panel>

                  <Panel title="Appointment" icon={CalendarDays}>
                    <Row label="Date" value={formatLongDate(drawerBooking.appointmentDate)} />
                    <Row label="Slot" value={drawerBooking.timeSlot} />
                    <Row label="Collection" value={drawerBooking.collectionMethod} />
                    <Row
                      label="Fee"
                      value={
                        drawerBooking.pricing.homeCollectionFee ? inr(drawerBooking.pricing.homeCollectionFee) : 'Not applicable'
                      }
                    />
                    {drawerBooking.address && (
                      <Row
                        label="Address"
                        value={`${drawerBooking.address.line1}, ${drawerBooking.address.area}, ${drawerBooking.address.city} – ${drawerBooking.address.pincode}`}
                      />
                    )}
                  </Panel>
                </div>

                <Panel title="Payment" icon={FileText}>
                  <Row label="Package MRP" value={inr(drawerBooking.pricing.mrp)} />
                  <Row label="Package discount" value={`− ${inr(drawerBooking.pricing.discount)}`} />
                  <Row label="Package price" value={inr(drawerBooking.pricing.packagePrice)} />
                  <Row label="Collection fee" value={inr(drawerBooking.pricing.homeCollectionFee)} />
                  <Row label="Total" value={inr(drawerBooking.pricing.total)} strong />
                  <Row label="Method" value={drawerBooking.payment.method} />
                  <Row label="Status" value={drawerBooking.payment.state} />
                  {drawerBooking.payment.reference && <Row label="Reference" value={drawerBooking.payment.reference} mono />}
                </Panel>

                <div>
                  <p className="mb-3 text-[12.5px] font-bold uppercase tracking-wider text-navy-500">Update status</p>
                  <div className="flex flex-wrap gap-2">
                    {BOOKING_STATUS_FLOW.map((s) => {
                      const active = drawerBooking.status === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(drawerBooking, s)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                            active
                              ? 'border-teal-500 bg-teal-500 text-white'
                              : 'border-navy-200 bg-white text-navy-600 hover:border-teal-300 hover:text-teal-700',
                          )}
                          aria-pressed={active}
                        >
                          {s}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setCancelTarget(drawerBooking)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                        drawerBooking.status === 'Cancelled'
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-red-200 bg-white text-red-600 hover:bg-red-50',
                      )}
                    >
                      Cancelled
                    </button>
                  </div>
                  <p className="mt-2.5 text-[12px] text-navy-400">
                    Marking “Report Ready” unlocks the demo report on the customer’s booking page.
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[12.5px] font-bold uppercase tracking-wider text-navy-500">Current timeline</p>
                    <Button variant="ghost" size="sm" onClick={() => setTimelineBooking(drawerBooking)}>
                      Expand
                    </Button>
                  </div>
                  <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-4">
                    <BookingTimeline booking={drawerBooking} compact />
                  </div>
                </div>

                {drawerBooking.notes && (
                  <div className="rounded-xl border border-navy-100 bg-white p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-navy-500">Lab notes</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-navy-600">{drawerBooking.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openHtmlDocument(buildReceiptHtml(drawerBooking))
                      info('Receipt generated', 'A printable demo receipt opened in a new tab.')
                    }}
                  >
                    <Printer className="h-4 w-4" />
                    Receipt
                  </Button>
                  {['Pending', 'Confirmed', 'Sample Collection Scheduled'].includes(drawerBooking.status) && (
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setCancelTarget(drawerBooking)}>
                      <Trash2 className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={closeDrawer}>
                    Close
                  </Button>
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => {
                      setDrawerBooking(null)
                      success('Changes saved', `${drawerBooking.bookingNo} is up to date in the demo store.`)
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Done
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Timeline expand dialog */}
      <Dialog open={Boolean(timelineBooking)} onOpenChange={() => setTimelineBooking(null)}>
        <DialogContent size="md">
          {timelineBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking timeline</DialogTitle>
                <DialogDescription>
                  {timelineBooking.bookingNo} · {timelineBooking.patient.fullName}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                <BookingTimeline booking={timelineBooking} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTimelineBooking(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel confirm */}
      <AlertDialog open={Boolean(cancelTarget)} onOpenChange={() => setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {cancelTarget?.bookingNo}?</AlertDialogTitle>
            <AlertDialogDescription>
              The booking will be marked Cancelled and the customer timeline will show the cancellation. This can be
              reversed later during the demo by choosing another status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!cancelTarget) return
                cancelBooking(cancelTarget.id, 'Cancelled by lab staff from admin panel (demo)')
                success('Booking cancelled', `${cancelTarget.bookingNo} is now cancelled.`)
                setDrawerBooking((current) =>
                  current && current.id === cancelTarget.id ? { ...current, status: 'Cancelled' } : current,
                )
                setCancelTarget(null)
              }}
            >
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4">
      <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-navy-500">
        <Icon className="h-3.5 w-3.5 text-teal-600" aria-hidden />
        {title}
      </p>
      <dl className="mt-3 space-y-2">{children}</dl>
    </div>
  )
}

function Row({ label, value, strong, mono }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12.5px]">
      <dt className="shrink-0 text-navy-400">{label}</dt>
      <dd
        className={cn(
          'text-right',
          strong ? 'text-[13.5px] font-bold text-navy-900' : 'font-medium text-navy-700',
          mono && 'font-mono text-[11.5px]',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
