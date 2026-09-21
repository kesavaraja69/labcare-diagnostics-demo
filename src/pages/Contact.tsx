import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Headphones,
  Home,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Select, Textarea } from '@/components/ui/input'
import { FieldError, Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/misc'
import { SectionHeading } from '@/components/common/SectionHeading'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { useToast } from '@/store/toast'
import { LAB_INFO } from '@/data/lab'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  'Booking enquiry',
  'Home sample collection',
  'Report related question',
  'Package / price enquiry',
  'Corporate or family booking',
  'Something else',
]

interface FormState {
  name: string
  phone: string
  email: string
  subject: string
  message: string
}

const EMPTY: FormState = { name: '', phone: '', email: '', subject: '', message: '' }

export default function ContactPage() {
  const { success, error, info } = useToast()
  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const validate = (f: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!f.name.trim()) e.name = 'Please tell us your name'
    else if (f.name.trim().length < 3) e.name = 'Enter at least 3 characters'

    if (!f.phone.trim()) e.phone = 'A contact number helps us call you back'
    else if (!/^(\+91[\s-]?)?[6-9]\d{9}$/.test(f.phone.replace(/[\s-]/g, '')))
      e.phone = 'Enter a valid 10-digit Indian mobile number'

    if (!f.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(f.email.trim())) e.email = 'Enter a valid email address'

    if (!f.subject) e.subject = 'Choose what your enquiry is about'

    if (!f.message.trim()) e.message = 'Please add a short message'
    else if (f.message.trim().length < 12) e.message = 'Please add a little more detail (12+ characters)'

    return e
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const e = validate(form)
    setErrors(e)
    if (Object.values(e).some(Boolean)) {
      error('Please check the form', 'Some required details are missing or invalid.')
      return
    }

    setSending(true)
    await new Promise((r) => setTimeout(r, 900))
    setSending(false)
    setSent(true)
    success(
      'Demo enquiry submitted',
      'In a live deployment this would reach the laboratory inbox and trigger an acknowledgement message. Nothing was actually sent.',
    )
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b border-navy-100 bg-white">
        <div className="container-page py-7 lg:py-9">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-navy-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-700">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-navy-700">Contact</span>
          </nav>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Contact {LAB_INFO.name}</h1>
          <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-navy-500">
            Questions about a package, a report or home collection? Call the laboratory, send a message, or visit us in{' '}
            {LAB_INFO.city}. All contact details shown here are fictional demo information.
          </p>
        </div>
      </div>

      <div className="container-page py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
          {/* Form */}
          <div className="min-w-0">
            <div className="card-surface p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <MessageSquare className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-[17px] font-semibold">Send us a message</h2>
                  <p className="text-[13px] text-navy-500">
                    The form validates properly and shows a demo success state — nothing is actually sent.
                  </p>
                </div>
              </div>

              {sent ? (
                <div className="mt-6 rounded-2xl border border-success-100 bg-success-50/70 p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-success-600 shadow-soft">
                    <CheckCircle2 className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold text-success-800">Enquiry recorded (demo)</h3>
                  <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-success-700">
                    Thanks {form.name.split(' ')[0]} — your {form.subject.toLowerCase()} enquiry has been captured in this
                    demonstration. In production it would be delivered to the laboratory team and acknowledged by email or
                    WhatsApp.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSent(false)
                        setForm(EMPTY)
                        setErrors({})
                        info('Form cleared', 'You can send another demo enquiry.')
                      }}
                    >
                      Send another enquiry
                    </Button>
                    <Button variant="accent" asChild>
                      <Link to="/packages">
                        Browse packages
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
                  <div>
                    <Label htmlFor="c-name" required>
                      Your name
                    </Label>
                    <Input
                      id="c-name"
                      value={form.name}
                      invalid={Boolean(errors.name)}
                      autoComplete="name"
                      placeholder="e.g. Priya S"
                      className="mt-1.5"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onBlur={() => setErrors(validate(form))}
                    />
                    <FieldError>{errors.name}</FieldError>
                  </div>

                  <div>
                    <Label htmlFor="c-phone" required>
                      Mobile number
                    </Label>
                    <Input
                      id="c-phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      invalid={Boolean(errors.phone)}
                      placeholder="98765 43210"
                      className="mt-1.5"
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+\s-]/g, '') })}
                      onBlur={() => setErrors(validate(form))}
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="c-email" required>
                      Email address
                    </Label>
                    <Input
                      id="c-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      invalid={Boolean(errors.email)}
                      placeholder="name@example.com"
                      className="mt-1.5"
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onBlur={() => setErrors(validate(form))}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="c-subject" required>
                      What is your enquiry about?
                    </Label>
                    <div className="mt-1.5">
                      <Select
                        id="c-subject"
                        value={form.subject}
                        invalid={Boolean(errors.subject)}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        onBlur={() => setErrors(validate(form))}
                      >
                        <option value="">Select a subject</option>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <FieldError>{errors.subject}</FieldError>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="c-message" required hint="Please avoid sharing personal health details">
                      Message
                    </Label>
                    <Textarea
                      id="c-message"
                      value={form.message}
                      invalid={Boolean(errors.message)}
                      placeholder="Tell us how we can help — for example, which package you are considering or your booking ID."
                      className="mt-1.5"
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      onBlur={() => setErrors(validate(form))}
                    />
                    <FieldError>{errors.message}</FieldError>
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                    <Button type="submit" size="lg" disabled={sending} className="min-w-[180px]">
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send enquiry
                        </>
                      )}
                    </Button>
                    <p className="text-[12px] text-navy-400">
                      Demo form — no message leaves your browser.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Collection options */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="card-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                  <Building2 className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3.5 text-[14.5px] font-semibold">Visit the laboratory</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">
                  Walk in during opening hours for sample collection. Carry a photo ID and your booking ID.
                </p>
                <p className="mt-3 flex items-start gap-2 text-[12.5px] font-medium text-navy-700">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
                  {LAB_INFO.addressLine1}, {LAB_INFO.addressLine2}
                </p>
              </div>

              <div className="card-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Truck className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3.5 text-[14.5px] font-semibold">Home sample collection</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">
                  Available in {LAB_INFO.serviceAreas.length} localities across {LAB_INFO.city} and nearby towns, in slots
                  from 6:00 AM.
                </p>
                <Button variant="outline" size="sm" className="mt-3.5" asChild>
                  <Link to="/packages">
                    <Home className="h-4 w-4" />
                    Book home collection
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Contact rail */}
          <aside className="space-y-4">
            <div className="card-surface overflow-hidden">
              <div className="bg-navy-900 px-5 py-4">
                <h2 className="flex items-center gap-2.5 text-[15px] font-semibold text-white">
                  <Headphones className="h-4.5 w-4.5 text-teal-300" aria-hidden />
                  Talk to the laboratory
                </h2>
                <p className="mt-1 text-[12.5px] text-white/65">Demo contact details for presentation purposes.</p>
              </div>

              <ul className="divide-y divide-navy-100">
                <li>
                  <a
                    href={`tel:${LAB_INFO.phone.replace(/\s/g, '')}`}
                    className="flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-navy-50/60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Phone className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-navy-400">Phone</span>
                      <span className="mt-0.5 block text-[14px] font-semibold text-navy-900">{LAB_INFO.phone}</span>
                      <span className="block text-[12px] text-navy-500">
                        Alternate: {LAB_INFO.altPhone}
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${LAB_INFO.email}`}
                    className="flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-navy-50/60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Mail className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-navy-400">Email</span>
                      <span className="mt-0.5 block text-[14px] font-semibold text-navy-900">{LAB_INFO.email}</span>
                      <span className="block text-[12px] text-navy-500">
                        Replies would arrive within one working day
                      </span>
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3.5 px-5 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <MapPin className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-navy-400">Address</span>
                    <span className="mt-0.5 block text-[13.5px] font-semibold leading-relaxed text-navy-900">
                      {LAB_INFO.addressLine1}
                      <br />
                      {LAB_INFO.addressLine2}
                    </span>
                  </span>
                </li>
                <li className="px-5 py-4">
                  <span className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-navy-400">
                    <Clock className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                    Opening hours
                  </span>
                  <ul className="mt-2.5 space-y-2">
                    {LAB_INFO.timings.map((t) => (
                      <li key={t.day} className="flex items-start justify-between gap-3 text-[12.5px]">
                        <span className="text-navy-500">{t.day}</span>
                        <span className="text-right font-semibold text-navy-800">{t.hours}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>

            {/* Map placeholder */}
            <div className="card-surface overflow-hidden">
              <div
                className={cn(
                  'relative grid h-56 place-items-center bg-navy-50',
                  'bg-grid-navy bg-[length:28px_28px] bg-navy-800',
                )}
              >
                <div className="grid-pattern absolute inset-0 opacity-60" aria-hidden />
                <div className="relative flex flex-col items-center text-center">
                  <span className="relative flex h-12 w-12 items-center justify-center">
                    <span className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-400/30" aria-hidden />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow-lift">
                      <MapPin className="h-5 w-5" aria-hidden />
                    </span>
                  </span>
                  <p className="mt-3 text-[13.5px] font-semibold text-white">{LAB_INFO.name}</p>
                  <p className="mt-0.5 text-[12px] text-white/65">
                    {LAB_INFO.city}, {LAB_INFO.state}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="flex items-center gap-2 text-[12.5px] font-semibold text-navy-800">
                  <ShieldCheck className="h-4 w-4 text-teal-600" aria-hidden />
                  Map placeholder
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-navy-500">
                  In production this section embeds Google Maps with live directions to the laboratory. No maps provider is
                  connected in this demonstration.
                </p>
              </div>
            </div>

            <div className="card-surface p-5">
              <h2 className="text-[14.5px] font-semibold">Service areas for home collection</h2>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {LAB_INFO.serviceAreas.map((area) => (
                  <Badge key={area} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-[12px] leading-relaxed text-navy-500">
                Outside these areas? Call the lab and the team will confirm whether a collection visit can be arranged.
              </p>
            </div>

            <DemoNotice variant="amber">
              All phone numbers, email addresses and the physical address on this page are fictional demo information
              created for the client presentation. Please do not attempt to contact them.
            </DemoNotice>
          </aside>
        </div>
      </div>
    </div>
  )
}
