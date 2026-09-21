import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Cpu,
  FlaskConical,
  HeartHandshake,
  MapPin,
  Microscope,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/misc'
import { SectionHeading } from '@/components/common/SectionHeading'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { LAB_INFO } from '@/data/lab'
import { PACKAGES } from '@/data/packages'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Accuracy first',
    text: 'Documented sample handling, calibration checks and quality control on every analytical run — the foundation of a report you can rely on.',
  },
  {
    icon: HeartHandshake,
    title: 'Patient comfort',
    text: 'Short waiting times, early-morning slots and home collection across the local area so a health checkup fits around your day.',
  },
  {
    icon: Sparkles,
    title: 'Transparent pricing',
    text: 'Package contents, collection fees and report timelines are shown before you book. No surprise charges at the counter.',
  },
  {
    icon: Users,
    title: 'Local, accountable care',
    text: 'A neighbourhood laboratory where you can reach the team directly and get an answer about your booking or report.',
  },
]

const CAPABILITY = [
  {
    icon: Microscope,
    title: 'Clinical biochemistry',
    text: 'Fully automated analysers for routine chemistry, lipid, liver and kidney panels.',
  },
  {
    icon: FlaskConical,
    title: 'Haematology',
    text: 'Five-part differential cell counters with slide review supported by manual microscopy.',
  },
  {
    icon: Thermometer,
    title: 'Immunoassay & hormones',
    text: 'Hormone, vitamin and specialised protein assays on dedicated immunoassay platforms.',
  },
  {
    icon: Cpu,
    title: 'Digital workflow',
    text: 'Barcode-tracked samples with digital reports and live status visibility for every booking.',
  },
]

const MILESTONES = [
  { year: '2014', title: 'Laboratory opens in Rajapalayam', text: 'Started as a two-room collection centre serving the local neighbourhood.' },
  { year: '2017', title: 'Automated analyser platform added', text: 'Introduced walk-in sample processing with same-day biochemistry reporting.' },
  { year: '2020', title: 'Home collection launched', text: 'Trained phlebotomist teams began visiting homes across the surrounding localities.' },
  { year: '2023', title: 'Digital reports rolled out', text: 'Patients started tracking sample progress and downloading reports online.' },
  { year: '2026', title: 'Online booking experience', text: 'This demonstration website shows the planned online booking and package discovery journey.' },
]

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0 grid-pattern opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-hero-sheen" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white/90">
                <Building2 className="h-3.5 w-3.5 text-teal-300" aria-hidden />
                Established {LAB_INFO.established} · {LAB_INFO.city}, {LAB_INFO.state}
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
                A local diagnostic laboratory, built around accurate results
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
                {LAB_INFO.name} has been serving patients and doctors in {LAB_INFO.city} and nearby towns for over a
                decade. This website demonstrates how patients could discover health packages and book sample collection
                online, while the laboratory keeps full control of the clinical workflow.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" variant="accent" asChild>
                  <Link to="/packages">
                    Explore Health Packages
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
                >
                  <Link to="/contact">Visit the laboratory</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Demo tests performed', value: LAB_INFO.testsDoneDemo, icon: FlaskConical },
                { label: 'Packages & tests on offer', value: `${PACKAGES.length}`, icon: Microscope },
                { label: 'Localities served', value: `${LAB_INFO.serviceAreas.length}`, icon: MapPin },
                { label: 'Demo patient rating', value: '4.8 / 5', icon: Award },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                    <stat.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3.5 font-display text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-[11.5px] font-medium leading-snug text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story + image */}
      <section className="section-y">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <p className="label-caps mb-2 text-teal-600">Our story</p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built on careful sample handling and clear communication
              </h2>
              <div className="mt-4 space-y-4 text-[14.5px] leading-relaxed text-navy-600">
                <p>
                  The laboratory began as a small collection centre in Bazaar Street, {LAB_INFO.city}, serving patients
                  who wanted quick, reliable answers without travelling to a larger city. As demand grew, so did the
                  range of assays and the number of localities covered by home collection.
                </p>
                <p>
                  Today the team handles routine pathology, hormone assays and specialised panels in-house, with
                  barcode-based sample tracking from the moment a sample is collected. Every analytical run is validated
                  against quality-control material before results are released.
                </p>
                <p>
                  This demonstration website shows the next step in that journey: letting patients browse packages,
                  understand exactly what is included, book a convenient slot, and track the report — all online.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  'Barcode-tracked samples from collection to report',
                  'Quality control checks before results are released',
                  'Home collection with sterile single-use kits',
                  'Digital reports with full booking transparency',
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-navy-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/hero-lab.jpg"
                alt="Illustrative photograph of laboratory analyser workstations"
                className="h-72 w-full rounded-3xl border border-navy-100 object-cover shadow-card sm:h-96"
                loading="lazy"
              />
              <div className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-lift sm:left-6 sm:right-6">
                <p className="flex items-center gap-2 text-[12.5px] font-bold text-navy-900">
                  <BadgeCheck className="h-4 w-4 text-teal-600" aria-hidden />
                  Quality-controlled workflow
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-navy-500">
                  Illustrative demo photograph. Machine names, certifications and licence numbers shown anywhere in this
                  demo are fictional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-navy-100 bg-white section-y">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="What we stand for"
            title="Four commitments that shape the patient experience"
          />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
                  <v.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capability */}
      <section className="section-y">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <p className="label-caps mb-2 text-teal-600">Laboratory capability</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              In-house processing across core diagnostic disciplines
            </h2>
            <p className="mt-3.5 text-[14.5px] leading-relaxed text-navy-500">
              Sample testing is carried out at the {LAB_INFO.city} laboratory, with clearly defined referral pathways for
              any investigation that needs specialised equipment.
            </p>
            <DemoNotice className="mt-6">
              Capability descriptions are illustrative demo content written for this presentation. They do not represent
              certifications, accreditations or equipment actually installed.
            </DemoNotice>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CAPABILITY.map((c) => (
              <div key={c.title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <c.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3.5 text-[14.5px] font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-navy-100 bg-navy-50/50 section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Milestones"
            title="How the laboratory grew"
            description="A short illustrative history prepared for this demonstration."
          />
          <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {MILESTONES.map((m, i) => (
              <li key={m.year} className="relative">
                <div className="h-full rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                  <Badge variant="accent" size="lg">
                    {m.year}
                  </Badge>
                  <h3 className="mt-3.5 text-[14px] font-semibold leading-snug">{m.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500">{m.text}</p>
                </div>
                {i < MILESTONES.length - 1 && (
                  <span
                    className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-navy-200 lg:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lab info */}
      <section className="section-y">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
              <h3 className="text-[15px] font-semibold">Visit the laboratory</h3>
              <Separator className="my-4" />
              <p className="text-[13.5px] leading-relaxed text-navy-600">
                {LAB_INFO.addressLine1}
                <br />
                {LAB_INFO.addressLine2}
              </p>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-navy-500">
                <MapPin className="h-4 w-4 text-teal-600" aria-hidden />
                {LAB_INFO.city}, {LAB_INFO.state}, {LAB_INFO.country}
              </p>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
              <h3 className="text-[15px] font-semibold">Opening hours</h3>
              <Separator className="my-4" />
              <ul className="space-y-3">
                {LAB_INFO.timings.map((t) => (
                  <li key={t.day} className="flex items-start justify-between gap-3 text-[13px]">
                    <span className="text-navy-500">{t.day}</span>
                    <span className="text-right font-semibold text-navy-800">{t.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
              <h3 className="text-[15px] font-semibold">Areas we serve</h3>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {LAB_INFO.serviceAreas.map((area) => (
                  <Badge key={area} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DemoNotice variant="amber" className="mt-6">
            Every detail on this page — address, phone number, email, registration number, opening hours, capability
            descriptions and history — is fictional sample content created for the {LAB_INFO.name} client
            demonstration.
          </DemoNotice>

          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-soft">
            <h3 className="text-xl font-bold tracking-tight">Ready to book a health package?</h3>
            <p className="max-w-xl text-[14.5px] leading-relaxed text-navy-500">
              Browse the demo catalogue, compare what is included in each package, and complete the booking journey to
              see how the whole experience would work.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="accent" asChild>
                <Link to="/packages">
                  Explore Health Packages
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact the lab</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
