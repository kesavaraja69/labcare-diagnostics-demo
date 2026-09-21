import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  CalendarCheck,
  CalendarRange,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FlaskConical,
  Home,
  MapPin,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/misc'
import { AreaChart, BarChart, DonutChart, HorizontalBars, Sparkline } from '@/components/charts/Charts'
import { StatusBadge } from '@/components/brand/StatusBadge'
import { EmptyState } from '@/components/ui/misc'
import { useAdminStats, useBookings, usePackages } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { formatShortDate, formatTime, todayISO } from '@/lib/date'
import { inr } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
  const stats = useAdminStats()
  const { bookings, updateBookingStatus } = useBookings()
  const { packages } = usePackages()
  const { success, info } = useToast()

  const today = todayISO()
  const todaysList = React.useMemo(
    () => [...bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6),
    [bookings],
  )

  const pendingList = React.useMemo(() => bookings.filter((b) => b.status === 'Pending').slice(0, 5), [bookings])

  const metricCards = [
    {
      label: "Today's Bookings",
      value: String(stats.metrics.todaysBookings),
      hint: `${bookings.filter((b) => b.createdAt.slice(0, 10) === today).length} created today`,
      icon: CalendarRange,
      accent: 'navy',
      trend: stats.bookingTrend.slice(-7).map((p) => p.value),
    },
    {
      label: 'Pending Bookings',
      value: String(stats.metrics.pending),
      hint: 'Awaiting confirmation',
      icon: Clock,
      accent: 'amber',
      trend: [3, 5, 4, 6, 5, 7, stats.metrics.pending],
    },
    {
      label: 'Confirmed Bookings',
      value: String(stats.metrics.confirmed),
      hint: 'Scheduled for collection',
      icon: CalendarCheck,
      accent: 'sky',
      trend: [6, 8, 7, 9, 10, 9, stats.metrics.confirmed],
    },
    {
      label: 'Completed',
      value: String(stats.metrics.completed),
      hint: 'Reports delivered',
      icon: CheckCircle2,
      accent: 'teal',
      trend: [2, 3, 3, 4, 4, 5, stats.metrics.completed],
    },
    {
      label: "Today's Revenue",
      value: inr(stats.metrics.todaysRevenue),
      hint: 'Demo payments captured today',
      icon: BadgeIndianRupee,
      accent: 'teal',
      trend: stats.revenueTrend.slice(-7).map((p) => p.value),
    },
    {
      label: 'Total Customers',
      value: stats.metrics.totalCustomers.toLocaleString('en-IN'),
      hint: 'Demo customer base',
      icon: Users,
      accent: 'navy',
      trend: [1180, 1195, 1210, 1225, 1235, 1244, 1248],
    },
  ] as const

  const accentClasses: Record<string, { chip: string; spark: string }> = {
    navy: { chip: 'bg-navy-50 text-navy-700', spark: '#214f86' },
    teal: { chip: 'bg-teal-50 text-teal-700', spark: '#1caaa3' },
    amber: { chip: 'bg-warning-50 text-warning-700', spark: '#f59e0b' },
    sky: { chip: 'bg-sky-50 text-sky-700', spark: '#0284c7' },
  }

  const handleExport = () => {
    const header = ['Booking ID', 'Patient', 'Package', 'Date', 'Slot', 'Collection', 'Amount', 'Status']
    const rows = bookings.map((b) => [
      b.bookingNo,
      b.patient.fullName,
      b.packageName,
      b.appointmentDate,
      b.timeSlot,
      b.collectionMethod,
      String(b.pricing.total),
      b.status,
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `labcare-demo-bookings-${today}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1200)
    success('Demo report exported', 'A CSV of the current demo bookings was downloaded.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Operations dashboard</h1>
          <p className="mt-1.5 text-[13.5px] text-navy-500">
            Live view of demo bookings, revenue and collection performance for {formatShortDate(today)}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/bookings">
              Manage bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((m) => {
          const accent = accentClasses[m.accent]
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11.5px] font-bold uppercase tracking-wider text-navy-400">{m.label}</p>
                  <p className="mt-2 font-display text-[26px] font-bold leading-none text-navy-900">{m.value}</p>
                  <p className="mt-2 text-[12px] text-navy-500">{m.hint}</p>
                </div>
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', accent.chip)}>
                  <m.icon className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-success-600">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  Demo trend
                </span>
                <Sparkline values={m.trend as number[]} color={accent.spark} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold">Booking trend</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">Bookings created over the last 14 days (demo data)</p>
            </div>
            <Badge variant="accent">
              <TrendingUp className="h-3 w-3" />
              {stats.bookingTrend.reduce((s, p) => s + p.value, 0)} bookings
            </Badge>
          </div>
          <div className="mt-4">
            <AreaChart
              data={stats.bookingTrend}
              height={210}
              formatValue={(v) => `${v} booking${v === 1 ? '' : 's'}`}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Collection type</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">Home collection vs lab visit</p>
          <div className="mt-5">
            <DonutChart
              data={stats.collectionType}
              size={150}
              thickness={18}
              centerLabel="Bookings"
            />
          </div>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-navy-50/60 p-3.5">
            <Home className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
            <p className="text-[12px] leading-relaxed text-navy-500">
              Home collection share of demo bookings:{' '}
              <span className="font-semibold text-navy-800">
                {Math.round(
                  ((stats.collectionType.find((c) => c.label === 'Home Sample Collection')?.value ?? 0) /
                    Math.max(bookings.length, 1)) *
                    100,
                )}
                %
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold">Revenue trend</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">Value of bookings created per week (demo)</p>
            </div>
            <Badge variant="success">
              <Wallet className="h-3 w-3" />
              {inr(stats.revenueTrend.reduce((s, p) => s + p.value, 0))} total
            </Badge>
          </div>
          <div className="mt-5">
            <BarChart data={stats.revenueTrend} height={190} formatValue={(v) => inr(v)} color="#214f86" />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Booking source</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">Where demo bookings originate</p>
          <div className="mt-5">
            <DonutChart data={stats.bookingSource} size={150} thickness={18} centerLabel="Sources" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Popular packages</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">By number of demo bookings</p>
          <div className="mt-5">
            <HorizontalBars
              data={stats.popularPackages.map((p) => ({
                label: p.name,
                value: p.bookings,
                hint: `· ${inr(p.revenue)}`,
              }))}
              formatValue={(v) => `${v}`}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold">Recent bookings</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">
                The six most recent demo bookings, newest first
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/bookings">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {todaysList.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<CalendarRange className="h-5 w-5" />}
              title="No bookings yet"
              description="Create a booking on the customer website and it will appear here instantly."
              action={
                <Button size="sm" asChild>
                  <Link to="/packages">Go to customer site</Link>
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 divide-y divide-navy-100">
              {todaysList.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/admin/bookings?booking=${b.id}`}
                        className="font-mono text-[12px] font-semibold text-navy-700 hover:text-teal-700"
                      >
                        {b.bookingNo}
                      </Link>
                      <StatusBadge status={b.status} className="text-[10px]" />
                    </div>
                    <p className="mt-1 truncate text-[13.5px] font-semibold text-navy-900">{b.packageName}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-navy-500">
                      <span>{b.patient.fullName}</span>
                      <span className="inline-flex items-center gap-1">
                        {b.collectionMethod === 'Home Sample Collection' ? (
                          <Home className="h-3 w-3" aria-hidden />
                        ) : (
                          <MapPin className="h-3 w-3" aria-hidden />
                        )}
                        {b.collectionMethod}
                      </span>
                      <span>
                        {formatShortDate(b.appointmentDate)} · {b.timeSlot}
                      </span>
                      <span className="text-navy-400">booked {formatTime(b.createdAt)}</span>
                    </p>
                  </div>
                  <p className="font-display text-[15px] font-bold text-navy-900">{inr(b.pricing.total)}</p>
                  {b.status === 'Pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateBookingStatus(b.id, 'Confirmed')
                        success('Booking confirmed', `${b.bookingNo} moved to Confirmed. The customer timeline updated.`)
                      }}
                    >
                      Confirm
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pending queue + quick actions */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft lg:col-span-2">
          <h2 className="text-[15px] font-semibold">Pending confirmations</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">
            Bookings waiting for a staff decision. Confirm them to move the customer timeline forward.
          </p>

          {pendingList.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-success-100 bg-success-50/70 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success-600" aria-hidden />
              <p className="text-[13px] font-medium text-success-700">
                All demo bookings have been actioned — nothing is pending.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingList.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-navy-100 p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
                    <Clock className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-navy-900">{b.packageName}</p>
                    <p className="mt-0.5 text-[12px] text-navy-500">
                      {b.bookingNo} · {b.patient.fullName} · {formatShortDate(b.appointmentDate)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateBookingStatus(
                          b.id,
                          'Sample Collection Scheduled',
                          'Technician assigned after confirmation',
                        )
                        success('Technician assigned', `${b.bookingNo} is now Sample Collection Scheduled.`)
                      }}
                    >
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateBookingStatus(b.id, 'Confirmed')
                        success('Booking confirmed', `${b.bookingNo} moved to Confirmed.`)
                      }}
                    >
                      Confirm
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Quick actions</h2>
          <Separator className="my-4" />
          <div className="space-y-2.5">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/packages">
                <FlaskConical className="h-4 w-4" />
                Add or edit a package
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/bookings">
                <CalendarRange className="h-4 w-4" />
                Update a booking status
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/customers">
                <Users className="h-4 w-4" />
                Review customer history
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/reports">
                <FileText className="h-4 w-4" />
                Open operational reports
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-navy-500"
              onClick={() =>
                info(
                  'Notifications are disabled in the demo',
                  'In production this would trigger WhatsApp, SMS and email messages to the patient.',
                )
              }
            >
              <Home className="h-4 w-4" />
              Notify patients
            </Button>
          </div>

          <Separator className="my-4" />

          <p className="text-[12px] font-bold uppercase tracking-wider text-navy-400">Catalogue snapshot</p>
          <ul className="mt-2.5 space-y-2 text-[12.5px]">
            <li className="flex items-center justify-between">
              <span className="text-navy-500">Active packages</span>
              <span className="font-semibold text-navy-900">
                {packages.filter((p) => p.status === 'Active').length}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-navy-500">Featured packages</span>
              <span className="font-semibold text-navy-900">{packages.filter((p) => p.featured).length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-navy-500">Home-collection enabled</span>
              <span className="font-semibold text-navy-900">
                {packages.filter((p) => p.homeCollectionAvailable && p.status === 'Active').length}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-navy-500">Disabled / draft</span>
              <span className="font-semibold text-navy-900">
                {packages.filter((p) => p.status !== 'Active').length}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <p className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-[12px] leading-relaxed text-navy-400">
        All figures, charts and bookings on this dashboard are fictional demonstration data. Charts are computed live from
        the demo bookings stored in your browser, so any booking you create or status you change is reflected immediately.
      </p>
    </div>
  )
}
