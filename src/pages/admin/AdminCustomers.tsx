import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Filter,
  Home,
  Inbox,
  Mail,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Select } from '@/components/ui/input'
import { EmptyState, Separator } from '@/components/ui/misc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/brand/StatusBadge'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { useDemoStore } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { formatShortDate } from '@/lib/date'
import { inr, initials, cn } from '@/lib/utils'
import type { Customer } from '@/types'

export default function AdminCustomersPage() {
  const { customers, bookings, updateBookingStatus } = useDemoStore()
  const { success, info } = useToast()

  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'All' | Customer['status']>('All')
  const [sort, setSort] = React.useState<'amount' | 'bookings' | 'recent' | 'name'>('amount')
  const [selected, setSelected] = React.useState<Customer | null>(null)
  const [expandedBooking, setExpandedBooking] = React.useState<string | null>(null)

  /* Customers include anyone created by a demo booking, so the list stays truthful. */
  const allCustomers = React.useMemo(() => {
    const extra: Customer[] = []
    bookings.forEach((b) => {
      const known = customers.some((c) => c.email.toLowerCase() === b.patient.email.toLowerCase())
      if (!known && !extra.some((c) => c.email.toLowerCase() === b.patient.email.toLowerCase())) {
        extra.push({
          id: `derived-${b.patient.id}`,
          name: b.patient.fullName,
          phone: b.patient.mobile,
          email: b.patient.email,
          gender: b.patient.gender,
          age: b.patient.age,
          area: b.address?.area ?? 'Rajapalayam',
          totalBookings: 1,
          totalAmount: b.pricing.total,
          lastBookingDate: b.appointmentDate,
          status: 'New',
          joinedOn: b.createdAt.slice(0, 10),
        })
      }
    })
    return [...customers, ...extra]
  }, [customers, bookings])

  const withLiveStats = React.useMemo(
    () =>
      allCustomers.map((c) => {
        const mine = bookings.filter((b) => b.patient.email.toLowerCase() === c.email.toLowerCase())
        const spend = mine.reduce((s, b) => s + (b.status === 'Cancelled' ? 0 : b.pricing.total), 0)
        const sortedDates = mine.map((b) => b.appointmentDate).sort()
        const latest = sortedDates.length ? sortedDates[sortedDates.length - 1] : undefined
        return {
          ...c,
          bookingCount: Math.max(mine.length, c.totalBookings),
          liveSpend: spend || c.totalAmount,
          liveLastBooking: latest ?? c.lastBookingDate,
          mine,
        }
      }),
    [allCustomers, bookings],
  )

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = withLiveStats.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false
      if (term) {
        const hay = `${c.name} ${c.phone} ${c.email} ${c.area}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'bookings':
          return b.bookingCount - a.bookingCount
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
          return (b.liveLastBooking ?? '') < (a.liveLastBooking ?? '') ? -1 : 1
        case 'amount':
        default:
          return b.liveSpend - a.liveSpend
      }
    })
  }, [withLiveStats, search, statusFilter, sort])

  const totals = React.useMemo(
    () => ({
      customers: withLiveStats.length,
      bookings: bookings.length,
      revenue: withLiveStats.reduce((s, c) => s + c.liveSpend, 0),
      homeCollection: bookings.filter((b) => b.collectionMethod === 'Home Sample Collection').length,
    }),
    [withLiveStats, bookings],
  )

  const selectedBookings = selected
    ? bookings.filter((b) => b.patient.email.toLowerCase() === selected.email.toLowerCase())
    : []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Customers</h1>
          <p className="mt-1.5 text-[13.5px] text-navy-500">
            Demo patient records with their booking history. Open a customer to see every booking and its current stage.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/bookings">
            <CalendarDays className="h-4 w-4" />
            Booking management
          </Link>
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Demo customers', value: String(totals.customers), hint: 'Including new bookings', icon: Users },
          { label: 'Total bookings', value: String(totals.bookings), hint: 'Across all statuses', icon: ShoppingBag },
          { label: 'Lifetime value', value: inr(totals.revenue), hint: 'Excluding cancelled', icon: TrendingUp },
          { label: 'Home collections', value: String(totals.homeCollection), hint: 'Out of all bookings', icon: Home },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-wider text-navy-400">{s.label}</p>
                <p className="mt-2 font-display text-[24px] font-bold leading-none text-navy-900">{s.value}</p>
                <p className="mt-2 text-[12px] text-navy-500">{s.hint}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email or area"
              className="pl-10 pr-10"
              aria-label="Search customers"
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

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filter by customer status"
          >
            <option value="All">All customer statuses</option>
            <option value="Active">Active</option>
            <option value="New">New</option>
            <option value="Inactive">Inactive</option>
          </Select>

          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort customers">
            <option value="amount">Highest spend</option>
            <option value="bookings">Most bookings</option>
            <option value="recent">Most recent booking</option>
            <option value="name">Name A–Z</option>
          </Select>

          <Button
            variant="outline"
            disabled={!search && statusFilter === 'All'}
            onClick={() => {
              setSearch('')
              setStatusFilter('All')
            }}
          >
            <Filter className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead className="bg-navy-50/70">
              <tr>
                {['Customer', 'Contact', 'Area', 'Bookings', 'Total amount', 'Last booking', 'Status', ''].map((h) => (
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
                      title="No customers match"
                      description="Try a different search term or reset the filters."
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch('')
                            setStatusFilter('All')
                          }}
                        >
                          Reset filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t border-navy-100 transition-colors hover:bg-navy-50/40">
                    <td className="px-4 py-3.5">
                      <button type="button" onClick={() => setSelected(c)} className="flex items-center gap-3 text-left">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[13px] font-bold text-navy-700">
                          {initials(c.name)}
                        </span>
                        <span>
                          <span className="block text-[13px] font-semibold text-navy-900 hover:text-teal-700">
                            {c.name}
                          </span>
                          <span className="block text-[11.5px] text-navy-400">
                            {c.age} yrs · {c.gender} · joined {formatShortDate(c.joinedOn)}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[12.5px] font-medium text-navy-700">{c.phone}</p>
                      <p className="truncate text-[11.5px] text-navy-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-navy-600">
                        <MapPin className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                        {c.area}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline">{c.bookingCount}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-bold text-navy-900">{inr(c.liveSpend)}</td>
                    <td className="px-4 py-3.5 text-[12.5px] text-navy-600">
                      {c.liveLastBooking ? formatShortDate(c.liveLastBooking) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={c.status === 'Active' ? 'success' : c.status === 'New' ? 'accent' : 'default'}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(c)}>
                        <User className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {filtered.length === 0 ? (
          <li className="sm:col-span-2">
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="No customers match"
              description="Try a different search term or reset the filters."
            />
          </li>
        ) : (
          filtered.map((c) => (
            <li key={c.id} className="rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[14px] font-bold text-navy-700">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-navy-900">{c.name}</p>
                  <p className="truncate text-[12px] text-navy-500">
                    {c.phone} · {c.area}
                  </p>
                </div>
                <Badge variant={c.status === 'Active' ? 'success' : c.status === 'New' ? 'accent' : 'default'} size="sm">
                  {c.status}
                </Badge>
              </div>

              <Separator className="my-3.5" />

              <dl className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Bookings', value: String(c.bookingCount) },
                  { label: 'Amount', value: inr(c.liveSpend) },
                  { label: 'Last', value: c.liveLastBooking ? formatShortDate(c.liveLastBooking) : '—' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-navy-50/60 p-2.5">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-navy-400">{s.label}</dt>
                    <dd className="mt-0.5 text-[12.5px] font-semibold text-navy-900">{s.value}</dd>
                  </div>
                ))}
              </dl>

              <Button size="sm" variant="outline" className="mt-3.5 w-full" onClick={() => setSelected(c)}>
                <User className="h-3.5 w-3.5" />
                View booking history
              </Button>
            </li>
          ))
        )}
      </ul>

      {/* Customer drawer */}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={() => {
          setSelected(null)
          setExpandedBooking(null)
        }}
      >
        <DialogContent size="lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100 text-[13px] font-bold text-navy-700">
                    {initials(selected.name)}
                  </span>
                  {selected.name}
                </DialogTitle>
                <DialogDescription>
                  Demo customer record · {selected.age} yrs · {selected.gender} · joined {formatShortDate(selected.joinedOn)}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[66vh] space-y-5 overflow-y-auto pr-1 scrollbar-thin">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">Contact</p>
                    <ul className="mt-2.5 space-y-2 text-[12.5px] text-navy-700">
                      <li className="flex items-center gap-2.5">
                        <Phone className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                        {selected.phone}
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Mail className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                        {selected.email}
                      </li>
                      <li className="flex items-center gap-2.5">
                        <MapPin className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                        {selected.area}, Rajapalayam
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-navy-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">Bookings</p>
                      <p className="mt-1.5 font-display text-xl font-bold text-navy-900">{selectedBookings.length}</p>
                    </div>
                    <div className="rounded-xl border border-navy-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">Spend</p>
                      <p className="mt-1.5 font-display text-xl font-bold text-navy-900">
                        {inr(
                          selectedBookings.reduce((s, b) => s + (b.status === 'Cancelled' ? 0 : b.pricing.total), 0),
                        )}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-navy-100 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">
                        Collection preference
                      </p>
                      <p className="mt-1.5 text-[13px] font-semibold text-navy-900">
                        {(() => {
                          const home = selectedBookings.filter((b) => b.collectionMethod === 'Home Sample Collection').length
                          const lab = selectedBookings.length - home
                          if (home === 0 && lab === 0) return 'No bookings yet'
                          if (home > lab) return `Prefers home collection (${home} of ${selectedBookings.length})`
                          if (lab > home) return `Prefers lab visit (${lab} of ${selectedBookings.length})`
                          return `Mixed (${home} home · ${lab} lab)`
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-navy-500">Booking history</h3>
                    {selectedBookings.length > 0 && (
                      <Badge variant="accent">{selectedBookings.length} bookings</Badge>
                    )}
                  </div>

                  {selectedBookings.length === 0 ? (
                    <EmptyState
                      className="mt-3"
                      icon={<ShoppingBag className="h-5 w-5" />}
                      title="No bookings yet"
                      description="This demo customer has no bookings recorded against their email address."
                    />
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {[...selectedBookings]
                        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                        .map((b) => (
                          <li key={b.id} className="rounded-xl border border-navy-100 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[11.5px] font-semibold text-navy-700">
                                    {b.bookingNo}
                                  </span>
                                  <StatusBadge status={b.status} className="text-[10px]" />
                                </div>
                                <p className="mt-1.5 text-[13.5px] font-semibold text-navy-900">{b.packageName}</p>
                                <p className="mt-0.5 text-[12px] text-navy-500">
                                  {formatShortDate(b.appointmentDate)} · {b.timeSlot} · {b.collectionMethod}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-display text-[15px] font-bold text-navy-900">{inr(b.pricing.total)}</p>
                                <p
                                  className={cn(
                                    'text-[11px] font-medium',
                                    b.payment.state === 'Paid' ? 'text-success-600' : 'text-warning-600',
                                  )}
                                >
                                  {b.payment.state}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                              >
                                {expandedBooking === b.id ? 'Hide timeline' : 'View timeline'}
                              </Button>
                              {b.status === 'Pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    updateBookingStatus(b.id, 'Confirmed')
                                    success('Booking confirmed', `${b.bookingNo} moved to Confirmed.`)
                                  }}
                                >
                                  Confirm booking
                                </Button>
                              )}
                            </div>

                            {expandedBooking === b.id && (
                              <div className="mt-4 rounded-xl bg-navy-50/50 p-4">
                                <BookingTimeline booking={b} compact />
                              </div>
                            )}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              <DialogFooter className="sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      info(
                        'Demo action',
                        `In production this would open a WhatsApp or SMS thread with ${selected.name}.`,
                      )
                    }
                  >
                    <Phone className="h-4 w-4" />
                    Message customer
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/bookings?booking=${selectedBookings[0]?.id ?? ''}`}>Open in bookings</Link>
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(null)
                    setExpandedBooking(null)
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <p className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-[12px] leading-relaxed text-navy-400">
        All customer names, phone numbers, email addresses and booking values are fictional sample data generated for this
        demonstration. No real patient records are used anywhere in this application.
      </p>
    </div>
  )
}
