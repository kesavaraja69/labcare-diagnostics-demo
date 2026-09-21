import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Download,
  FlaskConical,
  Home,
  MapPin,
  Phone,
  Printer,
  Receipt,
  Share2,
  ShoppingBag,
  User,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/misc'
import { StatusBadge } from '@/components/brand/StatusBadge'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { useBookings, usePackages } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { LAB_INFO } from '@/data/lab'
import { formatLongDate, formatDayMonth, relativeLabel } from '@/lib/date'
import { buildReceiptHtml, openHtmlDocument } from '@/lib/documents'
import { cn, inr } from '@/lib/utils'

export default function BookingConfirmationPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { bookings } = useBookings()
  const { packages } = usePackages()
  const { success, info } = useToast()
  const [created, setCreated] = React.useState(false)

  const booking = bookings.find((b) => b.id === id)
  const pkg = booking ? packages.find((p) => p.id === booking.packageId) : undefined

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCreated(true)
  }, [id])

  React.useEffect(() => {
    if (booking) {
      document.title = `Booking ${booking.bookingNo} confirmed | LabCare Diagnostics`
    }
    return () => {
      document.title = 'LabCare Diagnostics | Online Test & Health Package Booking'
    }
  }, [booking?.bookingNo, booking])

  if (!booking) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
            <Receipt className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-xl font-bold">Booking not found</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-navy-500">
            This demo booking may have been cleared when the demo data was reset in the admin panel. You can create a new
            booking in a few steps.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/packages">
                <ShoppingBag className="h-4 w-4" />
                Book a package
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/my-bookings">View my bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleDownload = () => {
    const html = buildReceiptHtml(booking)
    const opened = openHtmlDocument(html)
    success(
      'Demo receipt generated',
      opened
        ? 'The receipt opened in a new tab — use your browser’s print or save option to keep a copy.'
        : 'Please allow pop-ups for this demo site to view the receipt, or use the Print option.',
    )
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/booking-confirmation/${booking.id}`
    try {
      await navigator.clipboard.writeText(url)
      success('Confirmation link copied', 'Paste it anywhere to reopen this booking confirmation.')
    } catch {
      info('Confirmation link', url)
    }
  }

  return (
    <div className="bg-background">
      {/* Confirmation hero */}
      <section className="relative overflow-hidden border-b border-navy-100 bg-navy-900 print-sheet">
        <div className="absolute inset-0 grid-pattern opacity-60 no-print" aria-hidden />
        <div className="absolute inset-0 bg-hero-sheen no-print" aria-hidden />
        <div className="container-page relative py-10 sm:py-12">
          <div className="flex flex-col items-center text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-400/20" aria-hidden />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-white">
                <CheckCircle2 className="h-7 w-7" aria-hidden />
              </span>
            </span>

            <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">Booking Confirmed</h1>
            <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-white/70">
              Thank you, {booking.patient.fullName.split(' ')[0]}. Your sample collection appointment has been registered
              with {LAB_INFO.name}. A confirmation would normally be sent by SMS and email — in this demo it appears here
              and in My Bookings.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur-sm">
                Booking ID: {booking.bookingNo}
              </span>
              <StatusBadge status={booking.status} />
              <Badge className="border-white/20 bg-white/10 text-white" size="lg">
                {booking.payment.state === 'Paid' ? 'Demo payment captured' : 'Pay at lab'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
          {/* ---------------------------------------------------------- Details */}
          <div className="min-w-0 space-y-6">
            <section className="card-surface overflow-hidden print-sheet" aria-labelledby="conf-details">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-4 sm:px-6">
                <h2 id="conf-details" className="text-[15px] font-semibold">
                  Booking details
                </h2>
                <Badge variant="outline">
                  <Receipt className="h-3 w-3" />
                  Demo record
                </Badge>
              </div>

              <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
                <Detail icon={User} label="Patient">
                  {booking.patient.fullName}
                  <span className="mt-0.5 block text-[12.5px] font-normal text-navy-500">
                    {booking.patient.age} yrs · {booking.patient.gender} · {booking.patient.mobile}
                  </span>
                </Detail>

                <Detail icon={FlaskConical} label="Package">
                  {booking.packageName}
                  <span className="mt-0.5 block text-[12.5px] font-normal text-navy-500">
                    {booking.testsCount} tests included
                  </span>
                </Detail>

                <Detail icon={Home} label="Collection">
                  {booking.collectionMethod}
                  {booking.address ? (
                    <span className="mt-0.5 block text-[12.5px] font-normal leading-relaxed text-navy-500">
                      {booking.address.line1}, {booking.address.area}, {booking.address.city} – {booking.address.pincode}
                      {booking.address.landmark ? ` (${booking.address.landmark})` : ''}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[12.5px] font-normal leading-relaxed text-navy-500">
                      {LAB_INFO.addressLine1}, {LAB_INFO.addressLine2}
                    </span>
                  )}
                </Detail>

                <Detail icon={CalendarDays} label="Appointment">
                  {formatLongDate(booking.appointmentDate)}
                  <span className="mt-0.5 block text-[12.5px] font-normal text-navy-500">
                    {formatDayMonth(booking.appointmentDate)} · {booking.timeSlot} ({relativeLabel(booking.appointmentDate)})
                  </span>
                </Detail>

                <Detail icon={Clock} label="Expected report">
                  {booking.reportAvailability.replace('Reports typically available within ', 'Within ')}
                  <span className="mt-0.5 block text-[12.5px] font-normal text-navy-500">
                    Digital report available in My Bookings
                  </span>
                </Detail>

                <Detail icon={Wallet} label="Payment">
                  {booking.payment.method}
                  <span className="mt-0.5 block text-[12.5px] font-normal text-navy-500">
                    {booking.payment.state === 'Paid'
                      ? `Demo reference ${booking.payment.reference}`
                      : 'Collect at the laboratory'}
                  </span>
                </Detail>
              </div>

              <Separator />

              <dl className="space-y-2.5 p-5 sm:p-6">
                <LineItem label="Package MRP" value={inr(booking.pricing.mrp)} muted strike />
                <LineItem
                  label={`Package discount (${
                    booking.pricing.mrp > 0
                      ? Math.round((booking.pricing.discount / booking.pricing.mrp) * 100)
                      : 0
                  }%)`}
                  value={`− ${inr(booking.pricing.discount)}`}
                  tone="success"
                />
                <LineItem label="Package price" value={inr(booking.pricing.packagePrice)} />
                <LineItem
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
                {booking.payment.state === 'Paid' ? (
                  <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-success-600">
                    <BadgeCheck className="h-4 w-4" aria-hidden />
                    {inr(booking.payment.amountPaid)} paid via simulated {booking.payment.method} — no real money moved.
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-warning-600">
                    <Wallet className="h-4 w-4" aria-hidden />
                    Pay {inr(booking.pricing.total)} in cash at the laboratory during your visit.
                  </p>
                )}
              </dl>
            </section>

            <section className="card-surface p-5 sm:p-6" aria-labelledby="conf-next">
              <h2 id="conf-next" className="text-[15px] font-semibold">
                What happens next
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: BadgeCheck,
                    title: 'Lab confirmation',
                    text: 'The laboratory confirms your appointment and assigns a technician.',
                  },
                  {
                    icon: Home,
                    title: 'Sample collection',
                    text:
                      booking.collectionMethod === 'Home Sample Collection'
                        ? 'A technician visits your address during the selected slot.'
                        : 'Visit the laboratory at your chosen slot with a photo ID.',
                  },
                  {
                    icon: Receipt,
                    title: 'Digital report',
                    text: 'Track each stage and download your report from My Bookings.',
                  },
                ].map((s) => (
                  <div key={s.title} className="rounded-xl border border-navy-100 bg-navy-50/40 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-600 shadow-soft">
                      <s.icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <p className="mt-3 text-[13.5px] font-semibold text-navy-900">{s.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-navy-500">{s.text}</p>
                  </div>
                ))}
              </div>

              <DemoNotice variant="amber" className="mt-5">
                Preparation note: follow the fasting and preparation instructions shown on the package page and shared by
                the laboratory. This demo does not provide medical advice — speak to a qualified doctor about your health.
              </DemoNotice>
            </section>

            <div className="card-surface p-5 print-sheet sm:p-6">
              <h2 className="text-[15px] font-semibold">Booking timeline</h2>
              <p className="mt-1 text-[13px] text-navy-500">
                This timeline updates as the laboratory team moves your booking forward.
              </p>
              <div className="mt-5">
                <BookingTimeline booking={booking} />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------- Actions rail */}
          <aside className="lg:sticky lg:top-24 lg:h-fit no-print">
            <div className="card-surface p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold">Manage this booking</h2>
              <p className="mt-1 text-[13px] text-navy-500">
                Everything below works inside the demo — try each button.
              </p>

              <div className="mt-5 space-y-2.5">
                <Button size="lg" className="w-full" onClick={() => navigate(`/my-bookings/${booking.id}`)}>
                  <ArrowRight className="h-4.5 w-4.5" />
                  View Booking
                </Button>
                <Button size="lg" variant="accent" className="w-full" onClick={handleDownload}>
                  <Download className="h-4.5 w-4.5" />
                  Download Receipt
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate('/packages')
                    info('Ready for the next booking', 'Choose another health package to continue demonstrating.')
                  }}
                >
                  <CalendarPlus className="h-4.5 w-4.5" />
                  Book Another Test
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link to="/contact">
                    <Phone className="h-4.5 w-4.5" />
                    Contact Lab
                  </Link>
                </Button>
              </div>

              <Separator className="my-5" />

              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="ghost" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  Print page
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Copy link
                </Button>
              </div>

              <DemoNotice variant="inline" className="mt-4">
                Receipts, references and contact details on this page are fictional demo data.
              </DemoNotice>
            </div>

            <div className="card-surface mt-4 p-5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-900">
                <MapPin className="h-4 w-4 text-teal-600" aria-hidden />
                Laboratory location
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-navy-500">
                {LAB_INFO.addressLine1}
                <br />
                {LAB_INFO.addressLine2}
              </p>
              <p className="mt-2.5 flex items-center gap-2 text-[12.5px] font-medium text-navy-600">
                <Phone className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                {LAB_INFO.phone}
              </p>
              <DemoNotice variant="inline" className="mt-3" icon={false}>
                Demo address and phone number.
              </DemoNotice>
            </div>

            <div className="card-surface mt-4 p-5">
              <p className="text-[13px] font-semibold text-navy-900">Demonstrating to a client?</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500">
                Open the admin panel, sign in with the visible demo credentials, and change this booking’s status to watch
                the timeline above update.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <Link to="/admin/login">Open admin panel</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {created && <span className="sr-only" role="status">Booking confirmation loaded</span>}
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-navy-400">
        <Icon className="h-3.5 w-3.5 text-teal-600" aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-[14px] font-semibold leading-snug text-navy-900">{children}</p>
    </div>
  )
}

function LineItem({
  label,
  value,
  tone,
  muted,
  strike,
}: {
  label: string
  value: string
  tone?: 'success'
  muted?: boolean
  strike?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13.5px]">
      <dt className={muted ? 'text-navy-400' : 'text-navy-500'}>{label}</dt>
      <dd
        className={cn(
          'font-semibold',
          tone === 'success' ? 'text-success-600' : 'text-navy-800',
          strike && 'font-medium text-navy-400 line-through',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
