import * as React from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Home,
  Info,
  MapPin,
  Phone,
  Printer,
  Receipt,
  ShieldAlert,
  Trash2,
  User,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/brand/StatusBadge'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { PackageArtwork } from '@/components/brand/PackageArtwork'
import { useBookings, usePackages } from '@/store/DemoStore'
import type { Booking } from '@/types'
import { useToast } from '@/store/toast'
import { LAB_INFO } from '@/data/lab'
import { formatDateTime, formatLongDate, relativeLabel } from '@/lib/date'
import { buildDemoReport, DEMO_REPORT_DISCLAIMER, SAMPLE_REPORT_NOTE } from '@/data/reports'
import { buildReceiptHtml, buildReportHtml, openHtmlDocument } from '@/lib/documents'
import { cn, inr } from '@/lib/utils'

export default function BookingDetailPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { bookings, cancelBooking } = useBookings()
  const { packages } = usePackages()
  const { success, info } = useToast()

  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [reportOpen, setReportOpen] = React.useState(false)
  const [tab, setTab] = React.useState('timeline')

  const booking = bookings.find((b) => b.id === id)
  const pkg = booking ? packages.find((p) => p.id === booking.packageId) : undefined

  React.useEffect(() => {
    if (params.get('report') === '1' && booking?.status === 'Report Ready') {
      setReportOpen(true)
      setTab('report')
    }
  }, [params, booking?.status])

  if (!booking) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
            <Receipt className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-xl font-bold">Booking not found</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-navy-500">
            This demo booking is no longer available — it may have been removed when the demo data was reset.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/my-bookings">Back to My Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  const reportAvailable = booking.status === 'Report Ready' || booking.status === 'Completed'
  const report = buildDemoReport(
    booking,
    pkg ? pkg.includedTests.map((t) => t.name) : [],
  )
  const canCancel = ['Pending', 'Confirmed', 'Sample Collection Scheduled'].includes(booking.status)

  const handleDownloadReport = () => {
    openHtmlDocument(buildReportHtml(report))
    success('Demo report opened', 'A clearly-labelled sample report opened in a new tab. It is not a medical report.')
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b border-navy-100 bg-white">
        <div className="container-page py-5 lg:py-7">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-navy-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-700">
              Home
            </Link>
            <span>/</span>
            <Link to="/my-bookings" className="hover:text-navy-700">
              My Bookings
            </Link>
            <span>/</span>
            <span className="font-mono font-medium text-navy-700">{booking.bookingNo}</span>
          </nav>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{booking.packageName}</h1>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-navy-500">
                <span className="font-mono font-semibold text-navy-700">{booking.bookingNo}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                  {formatLongDate(booking.appointmentDate)} · {booking.timeSlot}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {booking.collectionMethod === 'Home Sample Collection' ? (
                    <Home className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                  )}
                  {booking.collectionMethod}
                </span>
                <span className="text-navy-400">Booked {formatDateTime(booking.createdAt)}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button variant="outline" size="sm" asChild>
                <Link to="/my-bookings">
                  <ArrowLeft className="h-4 w-4" />
                  All bookings
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  openHtmlDocument(buildReceiptHtml(booking))
                  success('Demo receipt opened', 'Print or save it from the new tab.')
                }}
              >
                <Download className="h-4 w-4" />
                Receipt
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          {/* Progress rail */}
          <div className="mt-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                'Pending',
                'Confirmed',
                'Sample Collection Scheduled',
                'Sample Collected',
                'Processing',
                'Report Ready',
                'Completed',
              ].map((s, i, arr) => {
                const currentIndex = arr.indexOf(booking.status)
                const done = booking.status === 'Cancelled' ? false : i <= currentIndex
                return (
                  <React.Fragment key={s}>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1 text-[11.5px] font-semibold',
                        done ? 'bg-teal-50 text-teal-700' : 'bg-navy-50 text-navy-400',
                      )}
                    >
                      {s}
                    </span>
                    {i < arr.length - 1 && <span className="h-px w-4 shrink-0 bg-navy-200" aria-hidden />}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-7 lg:py-9">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-10">
          {/* Main */}
          <div className="min-w-0">
            {reportAvailable && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-success-100 bg-success-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-success-600 shadow-soft">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-semibold text-success-800">Your report is ready</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-success-700">
                      {SAMPLE_REPORT_NOTE}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="accent" onClick={() => setReportOpen(true)}>
                    <Eye className="h-4 w-4" />
                    View Report
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="details">Booking details</TabsTrigger>
                <TabsTrigger value="tests">Included tests ({booking.testsCount})</TabsTrigger>
                {reportAvailable && <TabsTrigger value="report">Report</TabsTrigger>}
              </TabsList>

              <TabsContent value="timeline" className="mt-6 focus-visible:outline-none">
                <div className="card-surface p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[15.5px] font-semibold">Booking progress</h2>
                      <p className="mt-1 text-[13px] text-navy-500">
                        Updated by the laboratory team. Changes made in the admin panel appear here immediately.
                      </p>
                    </div>
                    <Badge variant="outline">
                      Last update {formatDateTime(booking.updatedAt)}
                    </Badge>
                  </div>
                  <Separator className="my-5" />
                  <BookingTimeline booking={booking} />
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-6 focus-visible:outline-none">
                <div className="space-y-4">
                  <div className="card-surface p-5 sm:p-6">
                    <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
                      <User className="h-4.5 w-4.5 text-teal-600" aria-hidden />
                      Patient details
                    </h2>
                    <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      <Field label="Full name">{booking.patient.fullName}</Field>
                      <Field label="Age / Gender">
                        {booking.patient.age} yrs · {booking.patient.gender}
                      </Field>
                      <Field label="Mobile">{booking.patient.mobile}</Field>
                      <Field label="Email">{booking.patient.email}</Field>
                    </div>
                  </div>

                  <div className="card-surface p-5 sm:p-6">
                    <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
                      {booking.collectionMethod === 'Home Sample Collection' ? (
                        <Home className="h-4.5 w-4.5 text-teal-600" aria-hidden />
                      ) : (
                        <MapPin className="h-4.5 w-4.5 text-teal-600" aria-hidden />
                      )}
                      Collection appointment
                    </h2>
                    <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      <Field label="Method">{booking.collectionMethod}</Field>
                      <Field label="Date">
                        {formatLongDate(booking.appointmentDate)}{' '}
                        <span className="text-navy-400">({relativeLabel(booking.appointmentDate)})</span>
                      </Field>
                      <Field label="Time slot">{booking.timeSlot}</Field>
                      <Field label="Expected report">{booking.reportAvailability}</Field>
                      <div className="sm:col-span-2">
                        <Field label={booking.address ? 'Collection address' : 'Laboratory address'}>
                          {booking.address ? (
                            <>
                              {booking.address.line1}, {booking.address.area}, {booking.address.city} –{' '}
                              {booking.address.pincode}
                              {booking.address.landmark && (
                                <span className="block text-[12.5px] text-navy-400">
                                  Landmark: {booking.address.landmark}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              {LAB_INFO.addressLine1}, {LAB_INFO.addressLine2}
                            </>
                          )}
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div className="card-surface p-5 sm:p-6">
                    <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
                      <Wallet className="h-4.5 w-4.5 text-teal-600" aria-hidden />
                      Payment
                    </h2>
                    <dl className="mt-4 space-y-2.5 text-[13.5px]">
                      <Row label="Package MRP" value={inr(booking.pricing.mrp)} />
                      <Row
                        label={`Package discount (${
                          booking.pricing.mrp > 0
                            ? Math.round((booking.pricing.discount / booking.pricing.mrp) * 100)
                            : 0
                        }%)`}
                        value={`− ${inr(booking.pricing.discount)}`}
                        tone="success"
                      />
                      <Row label="Package price" value={inr(booking.pricing.packagePrice)} />
                      <Row
                        label="Home sample collection fee"
                        value={
                          booking.collectionMethod === 'Home Sample Collection'
                            ? booking.pricing.homeCollectionFee
                              ? inr(booking.pricing.homeCollectionFee)
                              : 'Free'
                            : 'Not applicable'
                        }
                      />
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <dt className="text-[15px] font-bold text-navy-900">Total</dt>
                        <dd className="font-display text-xl font-bold text-navy-900">{inr(booking.pricing.total)}</dd>
                      </div>
                      <Row label="Payment method" value={booking.payment.method} />
                      <Row label="Payment status" value={booking.payment.state} />
                      {booking.payment.reference && (
                        <Row label="Demo reference" value={booking.payment.reference} mono />
                      )}
                    </dl>
                  </div>

                  {booking.notes && (
                    <div className="card-surface p-5 sm:p-6">
                      <h2 className="text-[15px] font-semibold">Lab notes (demo)</h2>
                      <p className="mt-2 flex items-start gap-2 text-[13.5px] leading-relaxed text-navy-600">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                        {booking.notes}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tests" className="mt-6 focus-visible:outline-none">
                <div className="card-surface p-5 sm:p-6">
                  <h2 className="text-[15px] font-semibold">Tests included in this package</h2>
                  <p className="mt-1 text-[13px] text-navy-500">
                    Demo package contents. All tests are covered by a single sample collection.
                  </p>
                  {pkg ? (
                    <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {pkg.includedTests.map((t, i) => (
                        <li
                          key={t.name + i}
                          className="flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/40 p-3.5"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                            <BadgeCheck className="h-3 w-3" aria-hidden />
                          </span>
                          <span>
                            <span className="block text-[13.5px] font-semibold text-navy-900">{t.name}</span>
                            {t.note && <span className="block text-[12px] text-navy-500">{t.note}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-[13.5px] text-navy-500">
                      Package details are unavailable because this package was removed from the demo catalogue. The
                      booking record is retained.
                    </p>
                  )}
                </div>
              </TabsContent>

              {reportAvailable && (
                <TabsContent value="report" className="mt-6 focus-visible:outline-none">
                  <div className="card-surface overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-4 sm:px-6">
                      <div>
                        <h2 className="text-[15px] font-semibold">Demo report preview</h2>
                        <p className="mt-0.5 text-[12.5px] text-navy-500">{SAMPLE_REPORT_NOTE}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="accent" onClick={handleDownloadReport}>
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6">
                      <ReportPreview booking={booking} report={report} />
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Side rail */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="card-surface overflow-hidden">
              {pkg && <PackageArtwork pkg={pkg} className="h-32 w-full" />}
              <div className="p-5">
                <Badge variant="accent" size="sm">
                  {booking.packageCategory}
                </Badge>
                <h2 className="mt-2.5 text-[15px] font-semibold leading-snug">{booking.packageName}</h2>
                <p className="mt-1.5 text-[12.5px] text-navy-500">
                  {booking.testsCount} tests · {booking.reportAvailability}
                </p>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-navy-600">Booking total</span>
                  <span className="font-display text-xl font-bold text-navy-900">{inr(booking.pricing.total)}</span>
                </div>

                <div className="mt-4 space-y-2.5">
                  {pkg && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/packages/${pkg.slug}`}>
                        <FlaskConical className="h-4 w-4" />
                        View package details
                      </Link>
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setCancelOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel this booking
                    </Button>
                  )}
                </div>

                <DemoNotice variant="inline" className="mt-4">
                  Demo booking record. Nothing here represents a real patient or a real transaction.
                </DemoNotice>
              </div>
            </div>

            <div className="card-surface mt-4 p-5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
                <Clock className="h-4 w-4 text-teal-600" aria-hidden />
                Booking history
              </p>
              <ul className="mt-2.5 space-y-2 text-[12.5px] text-navy-500">
                <li>Placed {formatDateTime(booking.createdAt)}</li>
                <li>Last updated {formatDateTime(booking.updatedAt)}</li>
                <li>Source: {booking.source} (demo)</li>
              </ul>
            </div>

            <div className="card-surface mt-4 p-5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
                <Phone className="h-4 w-4 text-teal-600" aria-hidden />
                Need to change something?
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500">
                Quote booking ID {booking.bookingNo} when you call the lab on {LAB_INFO.phone}.
              </p>
              <DemoNotice variant="inline" className="mt-3" icon={false}>
                Demo contact number.
              </DemoNotice>
            </div>
          </aside>
        </div>

        <DemoNotice variant="amber" className="mt-8">
          <span className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              This demonstration does not provide medical advice. Report contents shown anywhere in this app are
              illustrative sample values and must not be used for any health decision. Always speak to a qualified doctor.
            </span>
          </span>
        </DemoNotice>
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking {booking.bookingNo}?</AlertDialogTitle>
            <AlertDialogDescription>
              The booking will be marked Cancelled and the timeline will reflect this. You can create a fresh booking at
              any time during the demo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const updated = cancelBooking(booking.id, 'Cancelled by customer from booking page (demo)')
                setCancelOpen(false)
                if (updated) success('Booking cancelled', `${updated.bookingNo} is now marked as cancelled.`)
              }}
            >
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Demo report — {booking.bookingNo}</DialogTitle>
            <DialogDescription>{SAMPLE_REPORT_NOTE}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-navy-100 bg-white p-4 scrollbar-thin sm:p-5">
            <ReportPreview booking={booking} report={report} compact />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Close
            </Button>
            <Button variant="accent" onClick={handleDownloadReport}>
              <Download className="h-4 w-4" />
              Download demo report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">{label}</p>
      <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-navy-800">{children}</p>
    </div>
  )
}

function Row({
  label,
  value,
  tone,
  mono,
}: {
  label: string
  value: string
  tone?: 'success'
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-navy-500">{label}</dt>
      <dd
        className={cn(
          'text-right font-semibold',
          tone === 'success' ? 'text-success-600' : 'text-navy-800',
          mono && 'font-mono text-[12.5px]',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function ReportPreview({
  booking,
  report,
  compact,
}: {
  booking: Booking
  report: ReturnType<typeof buildDemoReport>
  compact?: boolean
}) {
  return (
    <div>
      <div className="flex items-start gap-2.5 rounded-xl border border-warning-100 bg-warning-50 p-3.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden />
        <p className="text-[12.5px] font-semibold leading-relaxed text-warning-800">
          DEMO REPORT — NOT A REAL MEDICAL REPORT. {DEMO_REPORT_DISCLAIMER}
        </p>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
        <div>
          <p className="font-display text-[15px] font-bold text-navy-900">LabCare Diagnostics</p>
          <p className="mt-0.5 text-[11.5px] text-navy-500">
            {LAB_INFO.addressLine} · {LAB_INFO.phone}
          </p>
        </div>
        <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-navy-500">
          Sample document
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {[
          ['Patient', report.patientName],
          ['Age / Gender', `${report.age} yrs · ${report.gender}`],
          ['Booking ID', report.bookingNo],
          ['Package', report.packageName],
          ['Sample collected', report.collectedOn],
          ['Report released', report.reportedOn],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-navy-400">{label}</dt>
            <dd className="mt-0.5 text-[12.5px] font-semibold text-navy-800">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 overflow-hidden rounded-xl border border-navy-100">
        <table className="w-full text-left">
          <thead className="bg-navy-50/70">
            <tr>
              {['Test', 'Result', 'Unit', 'Reference range', 'Flag'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-navy-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.slice(0, compact ? 8 : undefined).map((r) => (
              <tr key={r.test} className="border-t border-navy-100">
                <td className="px-3 py-2.5 text-[12.5px] font-semibold text-navy-800">{r.test}</td>
                <td className="px-3 py-2.5 text-[12.5px] font-medium text-navy-800">{r.value}</td>
                <td className="px-3 py-2.5 text-[12px] text-navy-500">{r.unit}</td>
                <td className="px-3 py-2.5 text-[12px] text-navy-500">{r.referenceRange}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'text-[11.5px] font-semibold',
                      r.flag === 'Normal'
                        ? 'text-success-600'
                        : r.flag === 'Borderline'
                          ? 'text-warning-600'
                          : 'text-red-600',
                    )}
                  >
                    {r.flag}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-navy-500">{report.remarks}</p>

      <p className="mt-3 text-[11.5px] text-navy-400">
        Generated for booking {booking.bookingNo}. Values are deterministic demo placeholders — not measurements.
      </p>
    </div>
  )
}


