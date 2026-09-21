import * as React from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Download,
  FileText,
  Home,
  MapPin,
  Printer,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc'
import { AreaChart, BarChart, DonutChart, HorizontalBars } from '@/components/charts/Charts'
import { useAdminStats, useBookings, usePackages } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { formatShortDate, isoDaysFromToday, monthLabel, todayISO } from '@/lib/date'
import { inr } from '@/lib/utils'
import type { Booking } from '@/types'

const countIn = (bookings: Booking[], fromISO: string, toISO: string) =>
  bookings.filter((b) => {
    const d = b.createdAt.slice(0, 10)
    return d >= fromISO && d <= toISO
  })

export default function AdminReportsPage() {
  const stats = useAdminStats()
  const { bookings } = useBookings()
  const { packages } = usePackages()
  const { success, info } = useToast()

  const active = bookings.filter((b) => b.status !== 'Cancelled')
  const cancelled = bookings.filter((b) => b.status === 'Cancelled')

  /* Daily — last 14 days */
  const daily = React.useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const offset = i - 13
        const iso = isoDaysFromToday(offset)
        const d = new Date()
        d.setDate(d.getDate() + offset)
        const dayBookings = bookings.filter((b) => b.createdAt.slice(0, 10) === iso)
        return {
          label: `${d.getDate()} ${monthLabel(d)}`,
          value: dayBookings.length,
          revenue: dayBookings.reduce((s, b) => s + b.pricing.total, 0),
        }
      }),
    [bookings],
  )

  /* Weekly — last 8 weeks */
  const weekly = React.useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => {
        const weekIndex = 7 - i
        const start = new Date()
        start.setDate(start.getDate() - (weekIndex * 7 + 6))
        const end = new Date()
        end.setDate(end.getDate() - weekIndex * 7)
        const startISO = start.toISOString().slice(0, 10)
        const endISO = end.toISOString().slice(0, 10)
        const inWeek = countIn(bookings, startISO, endISO)
        return {
          label: `W${8 - i}`,
          value: inWeek.length,
          revenue: inWeek.reduce((s, b) => s + b.pricing.total, 0),
          range: `${formatShortDate(startISO)} – ${formatShortDate(endISO)}`,
        }
      }),
    [bookings],
  )

  /* Monthly — last 6 months */
  const monthly = React.useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => {
        const d = new Date()
        d.setDate(1)
        d.setMonth(d.getMonth() - (5 - i))
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const inMonth = bookings.filter((b) => b.createdAt.slice(0, 7) === key)
        return {
          label: d.toLocaleDateString('en-GB', { month: 'short' }),
          value: inMonth.length,
          revenue: inMonth.reduce((s, b) => s + b.pricing.total, 0),
          fullMonth: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        }
      }),
    [bookings],
  )

  const totalRevenue = active.reduce((s, b) => s + b.pricing.total, 0)
  const collectedRevenue = bookings
    .filter((b) => b.payment.state === 'Paid')
    .reduce((s, b) => s + b.payment.amountPaid, 0)
  const pendingRevenue = bookings
    .filter((b) => b.payment.state === 'Pay at Lab' && b.status !== 'Cancelled')
    .reduce((s, b) => s + b.pricing.total, 0)
  const avgOrderValue = active.length ? Math.round(totalRevenue / active.length) : 0

  const popularPackages = React.useMemo(() => {
    const map = new Map<string, { bookings: number; revenue: number }>()
    active.forEach((b) => {
      const entry = map.get(b.packageId) ?? { bookings: 0, revenue: 0 }
      entry.bookings += 1
      entry.revenue += b.pricing.total
      map.set(b.packageId, entry)
    })
    return [...map.entries()]
      .map(([id, v]) => ({
        id,
        name: packages.find((p) => p.id === id)?.shortName ?? 'Removed package',
        bookings: v.bookings,
        revenue: v.revenue,
      }))
      .sort((a, b) => b.bookings - a.bookings)
  }, [active, packages])

  const categorySplit = React.useMemo(() => {
    const map = new Map<string, number>()
    active.forEach((b) => map.set(b.packageCategory, (map.get(b.packageCategory) ?? 0) + 1))
    return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  }, [active])

  const collectionSplit = stats.collectionType

  const handleExport = (label: string, rows: (string | number)[][], headers: string[]) => {
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `labcare-demo-${label}-${todayISO()}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1200)
    success('Report exported', `${label.replace(/-/g, ' ')} report downloaded as CSV.`)
  }

  const kpis = [
    {
      label: 'Bookings this period',
      value: String(active.length),
      delta: +12.4,
      hint: 'Excluding cancellations',
      icon: CalendarRange,
    },
    {
      label: 'Booking value',
      value: inr(totalRevenue),
      delta: +8.1,
      hint: 'Total of active demo bookings',
      icon: BadgeIndianRupee,
    },
    {
      label: 'Payments collected',
      value: inr(collectedRevenue),
      delta: +9.6,
      hint: `${inr(pendingRevenue)} payable at lab`,
      icon: TrendingUp,
    },
    {
      label: 'Average booking value',
      value: inr(avgOrderValue),
      delta: -2.3,
      hint: 'Across active bookings',
      icon: Target,
    },
    {
      label: 'Home collection share',
      value: `${
        active.length
          ? Math.round(
              ((collectionSplit.find((c) => c.label === 'Home Sample Collection')?.value ?? 0) / active.length) * 100,
            )
          : 0
      }%`,
      delta: +4.5,
      hint: 'Of all demo bookings',
      icon: Home,
    },
    {
      label: 'Cancellations',
      value: String(cancelled.length),
      delta: -1.2,
      hint: `${active.length ? ((cancelled.length / bookings.length) * 100).toFixed(1) : 0}% of all bookings`,
      icon: XCircle,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Reports</h1>
          <p className="mt-1.5 text-[13.5px] text-navy-500">
            Operational reporting built live from the demo bookings — daily, weekly and monthly performance, package mix
            and collection preferences.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleExport(
                'bookings-full',
                bookings.map((b) => [
                  b.bookingNo,
                  b.createdAt,
                  b.patient.fullName,
                  b.packageName,
                  b.packageCategory,
                  b.appointmentDate,
                  b.timeSlot,
                  b.collectionMethod,
                  b.pricing.total,
                  b.payment.state,
                  b.status,
                ]),
                [
                  'Booking ID',
                  'Created',
                  'Patient',
                  'Package',
                  'Category',
                  'Appointment',
                  'Slot',
                  'Collection',
                  'Amount',
                  'Payment',
                  'Status',
                ],
              )
            }
          >
            <Download className="h-4 w-4" />
            Export all data
          </Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-wider text-navy-400">{k.label}</p>
                <p className="mt-2 font-display text-[24px] font-bold leading-none text-navy-900">{k.value}</p>
                <p className="mt-2 text-[12px] text-navy-500">{k.hint}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                <k.icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
            <p
              className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                k.delta >= 0 ? 'bg-success-50 text-success-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {k.delta >= 0 ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-hidden />
              )}
              {Math.abs(k.delta)}% vs previous period
            </p>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      <Tabs defaultValue="daily">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <p className="text-[12px] text-navy-400">
            Charts are computed from live demo bookings · updated automatically
          </p>
        </div>

        <TabsContent value="daily" className="mt-5 focus-visible:outline-none">
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold">Daily bookings — last 14 days</h2>
                  <p className="mt-0.5 text-[12.5px] text-navy-500">Number of demo bookings created each day</p>
                </div>
                <Badge variant="accent">
                  {daily.reduce((s, d) => s + d.value, 0)} bookings in 14 days
                </Badge>
              </div>
              <div className="mt-4">
                <AreaChart data={daily} height={220} formatValue={(v) => `${v}`} />
              </div>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
              <h2 className="text-[15px] font-semibold">Daily revenue</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">Value of bookings created per day (demo)</p>
              <div className="mt-5">
                <BarChart
                  data={daily.slice(-7).map((d) => ({ label: d.label, value: d.revenue }))}
                  height={180}
                  formatValue={(v) => inr(v)}
                  color="#1caaa3"
                />
              </div>
              <Separator className="my-4" />
              <ul className="space-y-2 text-[12.5px]">
                {daily.slice(-3).reverse().map((d) => (
                  <li key={d.label} className="flex items-center justify-between gap-3">
                    <span className="text-navy-500">{d.label}</span>
                    <span className="font-semibold text-navy-900">
                      {d.value} bookings · {inr(d.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ReportTable
            title="Daily breakdown"
            subtitle="Bookings and booking value for each of the last 14 days"
            headers={['Date', 'Bookings', 'Booking value', 'Avg. value']}
            rows={daily
              .slice()
              .reverse()
              .map((d) => [
                d.label,
                d.value,
                inr(d.revenue),
                d.value ? inr(Math.round(d.revenue / d.value)) : '—',
              ])}
            onExport={() =>
              handleExport(
                'daily',
                daily.map((d) => [d.label, d.value, d.revenue]),
                ['Date', 'Bookings', 'Booking Value'],
              )
            }
          />
        </TabsContent>

        <TabsContent value="weekly" className="mt-5 focus-visible:outline-none">
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft xl:col-span-2">
              <h2 className="text-[15px] font-semibold">Weekly bookings — last 8 weeks</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">Volume trend across rolling weeks</p>
              <div className="mt-5">
                <BarChart data={weekly} height={210} formatValue={(v) => `${v}`} color="#0a2540" />
              </div>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
              <h2 className="text-[15px] font-semibold">Weekly revenue</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">Booking value per week</p>
              <div className="mt-5">
                <AreaChart
                  data={weekly.map((w) => ({ label: w.label, value: w.revenue }))}
                  height={180}
                  color="#214f86"
                  formatValue={(v) => inr(v)}
                />
              </div>
            </div>
          </div>

          <ReportTable
            title="Weekly breakdown"
            subtitle="Rolling week totals with date ranges"
            headers={['Week', 'Date range', 'Bookings', 'Booking value']}
            rows={weekly
              .slice()
              .reverse()
              .map((w) => [w.label, w.range, w.value, inr(w.revenue)])}
            onExport={() =>
              handleExport(
                'weekly',
                weekly.map((w) => [w.label, w.range, w.value, w.revenue]),
                ['Week', 'Range', 'Bookings', 'Value'],
              )
            }
          />
        </TabsContent>

        <TabsContent value="monthly" className="mt-5 focus-visible:outline-none">
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft xl:col-span-2">
              <h2 className="text-[15px] font-semibold">Monthly bookings — last 6 months</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">
                Seeded demo bookings fall within the current month; earlier months show the seeded history
              </p>
              <div className="mt-5">
                <BarChart data={monthly} height={210} formatValue={(v) => `${v}`} color="#214f86" />
              </div>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
              <h2 className="text-[15px] font-semibold">Monthly revenue</h2>
              <div className="mt-5">
                <HorizontalBars
                  data={monthly.map((m) => ({ label: m.label, value: m.revenue }))}
                  formatValue={(v) => inr(v)}
                />
              </div>
            </div>
          </div>

          <ReportTable
            title="Monthly breakdown"
            subtitle="Calendar month totals"
            headers={['Month', 'Bookings', 'Booking value', 'Avg. value']}
            rows={monthly
              .slice()
              .reverse()
              .map((m) => [
                m.fullMonth,
                m.value,
                inr(m.revenue),
                m.value ? inr(Math.round(m.revenue / m.value)) : '—',
              ])}
            onExport={() =>
              handleExport(
                'monthly',
                monthly.map((m) => [m.fullMonth, m.value, m.revenue]),
                ['Month', 'Bookings', 'Value'],
              )
            }
          />
        </TabsContent>
      </Tabs>

      {/* Mix panels */}
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold">Most booked packages</h2>
              <p className="mt-0.5 text-[12.5px] text-navy-500">Excluding cancelled demo bookings</p>
            </div>
            <Badge variant="outline">
              <Activity className="h-3 w-3" />
              {popularPackages.length} packages booked
            </Badge>
          </div>
          <div className="mt-5">
            <HorizontalBars
              data={popularPackages.map((p) => ({
                label: p.name,
                value: p.bookings,
                hint: `· ${inr(p.revenue)}`,
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Home collection vs lab visit</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">Fulfilment preference across demo bookings</p>
          <div className="mt-5">
            <DonutChart data={collectionSplit} size={150} thickness={18} centerLabel="Bookings" />
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-3">
            {collectionSplit.map((c) => (
              <div key={c.label} className="rounded-xl bg-navy-50/60 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  {c.label === 'Home Sample Collection' ? (
                    <Home className="h-3 w-3" aria-hidden />
                  ) : (
                    <MapPin className="h-3 w-3" aria-hidden />
                  )}
                  {c.label === 'Home Sample Collection' ? 'Home' : 'Lab'}
                </p>
                <p className="mt-1 font-display text-lg font-bold text-navy-900">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Package category mix</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">Bookings by package category</p>
          <div className="mt-5">
            <DonutChart data={categorySplit} size={150} thickness={18} centerLabel="Bookings" />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Booking source</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">How the demo bookings reach the laboratory</p>
          <div className="mt-5">
            <DonutChart data={stats.bookingSource} size={150} thickness={18} centerLabel="Sources" />
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold">Status distribution</h2>
          <p className="mt-0.5 text-[12.5px] text-navy-500">Where bookings currently sit in the workflow</p>
          <div className="mt-5">
            <HorizontalBars
              data={[
                { label: 'Pending', value: bookings.filter((b) => b.status === 'Pending').length },
                { label: 'Confirmed', value: bookings.filter((b) => b.status === 'Confirmed').length },
                {
                  label: 'Collection scheduled',
                  value: bookings.filter((b) => b.status === 'Sample Collection Scheduled').length,
                },
                { label: 'Sample collected', value: bookings.filter((b) => b.status === 'Sample Collected').length },
                { label: 'Processing', value: bookings.filter((b) => b.status === 'Processing').length },
                { label: 'Report ready', value: bookings.filter((b) => b.status === 'Report Ready').length },
                { label: 'Completed', value: bookings.filter((b) => b.status === 'Completed').length },
                { label: 'Cancelled', value: cancelled.length },
              ]}
            />
          </div>
          <Separator className="my-4" />
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-navy-500">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
            Demo customer base: {stats.metrics.totalCustomers.toLocaleString('en-IN')} patients
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-navy-900">Scheduled reports (future scope)</p>
            <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-navy-500">
              Production would generate a daily operations summary, weekly revenue digest and monthly package performance
              report, delivered by email to the laboratory manager. These are placeholders only in the demo.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            info(
              'Scheduled reports are not part of the demo',
              'This button shows where automated report delivery would be configured in production.',
            )
          }
        >
          <CalendarDays className="h-4 w-4" />
          Configure schedule
        </Button>
      </div>

      <p className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-[12px] leading-relaxed text-navy-400">
        All reporting figures are derived from fictional demonstration bookings stored in your browser and are shown only
        to illustrate the reporting experience. They do not represent real laboratory performance.
      </p>
    </div>
  )
}

function ReportTable({
  title,
  subtitle,
  headers,
  rows,
  onExport,
}: {
  title: string
  subtitle: string
  headers: string[]
  rows: (string | number)[][]
  onExport: () => void
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="h-4.5 w-4.5 text-teal-600" aria-hidden />
          <div>
            <h3 className="text-[14.5px] font-semibold">{title}</h3>
            <p className="text-[12px] text-navy-500">{subtitle}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-navy-50/95 backdrop-blur-sm">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-navy-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-navy-100">
                {r.map((cell, j) => (
                  <td
                    key={j}
                    className={
                      j === 0
                        ? 'px-5 py-2.5 text-[12.5px] font-semibold text-navy-800'
                        : 'px-5 py-2.5 text-[12.5px] text-navy-600'
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
