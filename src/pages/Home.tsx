import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Clock,
  FileCheck2,
  FileText,
  Home as HomeIcon,
  Layers,
  MapPin,
  MousePointerClick,
  Phone,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Syringe,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/misc'
import { SectionHeading, StarRating } from '@/components/common/SectionHeading'
import { PackageCard } from '@/components/packages/PackageCard'
import { PackageGridSkeleton } from '@/components/common/Loaders'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { DynamicIcon } from '@/components/brand/PackageArtwork'
import { usePackages } from '@/store/DemoStore'
import { FAQS, HOW_IT_WORKS, TESTIMONIALS, TRUST_STRIP, WHY_CHOOSE } from '@/data/cms'
import { LAB_INFO } from '@/data/lab'
import { PACKAGE_CATEGORIES } from '@/types'

export default function HomePage() {
  const { packages } = usePackages()
  const navigate = useNavigate()

  const popular = packages.filter((p) => p.status === 'Active' && p.featured).slice(0, 6)

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0 grid-pattern opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-hero-sheen" aria-hidden />

        <div className="container-page relative py-14 sm:py-18 lg:py-22">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white/90 backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-teal-300" aria-hidden />
                Now serving {LAB_INFO.city}, {LAB_INFO.state}
              </span>

              <h1 className="mt-5 text-[32px] font-bold leading-[1.1] text-white sm:text-[42px] lg:text-[50px]">
                Complete Health Checkups
                <span className="block bg-gradient-to-r from-teal-300 to-sky-200 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-teal-300">
                Accurate Testing. Easy Booking. Better Healthcare.
              </p>

              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/75 sm:text-base">
                Book diagnostic tests and health packages online with {LAB_INFO.name}. Choose a lab visit or home sample
                collection, pick a convenient slot, and access digital reports from your dashboard.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" variant="accent" asChild className="w-full sm:w-auto">
                  <Link to="/packages">
                    Explore Health Packages
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => navigate('/packages')}
                  className="w-full border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 sm:w-auto"
                >
                  <Search className="h-4.5 w-4.5" />
                  Book a Test
                </Button>
              </div>

              <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  { label: 'Packages on offer', value: `${packages.filter((p) => p.status === 'Active').length}+` },
                  { label: 'Demo tests performed', value: LAB_INFO.testsDoneDemo },
                  { label: 'Home collection areas', value: `${LAB_INFO.serviceAreas.length}` },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-white/50">{stat.label}</dt>
                    <dd className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative animate-fade-up lg:pl-6">
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-lift backdrop-blur-sm">
                <img
                  src="/images/hero-lab.jpg"
                  alt="Illustrative photograph of a modern diagnostic laboratory workstation"
                  className="h-64 w-full rounded-2xl object-cover sm:h-80 lg:h-[380px]"
                  loading="eager"
                />
              </div>

              <div className="absolute -bottom-5 left-4 w-[220px] rounded-2xl border border-navy-100 bg-white p-3.5 shadow-lift sm:-bottom-6 sm:left-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-600">
                    <FileCheck2 className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-bold text-navy-900">Report Ready</p>
                    <p className="text-[11px] text-navy-500">Digital report in 24–48 hrs</p>
                  </div>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-navy-100">
                  <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-navy-700 to-teal-500" />
                </div>
              </div>

              <div className="absolute -top-3 right-2 hidden items-center gap-2 rounded-2xl border border-navy-100 bg-white px-3.5 py-2.5 shadow-lift sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <HomeIcon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[12px] font-bold text-navy-900">Home collection</p>
                  <p className="text-[10.5px] text-navy-500">Slots from 6:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-t border-white/10 bg-navy-950/40">
          <div className="container-page grid gap-x-6 gap-y-5 py-6 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_STRIP.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                  <DynamicIcon name={item.icon} className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-white/55">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Categories */}
      <section className="border-b border-navy-100 bg-white py-6">
        <div className="container-page">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            <span className="shrink-0 text-[12px] font-bold uppercase tracking-wider text-navy-400">
              Browse by need
            </span>
            {PACKAGE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => navigate(`/packages?category=${encodeURIComponent(cat)}`)}
                className="shrink-0 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-navy-600 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Popular packages */}
      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Popular health packages"
            title="Preventive checkups our patients book most"
            description="Each package shows exactly how many tests are included, the sample-collection fee and the expected report timeline — no surprises at the counter."
            action={
              <Button variant="outline" asChild>
                <Link to="/packages">
                  View all packages
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.length === 0 ? <PackageGridSkeleton count={6} /> : popular.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>

          <DemoNotice className="mt-6">
            Demo prices and package contents. The packages above — Comprehensive Full Body Checkup ₹1,999, Diabetes Care
            Package ₹799, Thyroid Profile ₹599, Women&apos;s Wellness ₹1,499, Men&apos;s Health ₹1,399 and Senior Citizen
            ₹1,999 — are fictional sample offers created for this client demonstration.
          </DemoNotice>
        </div>
      </section>

      {/* --------------------------------------------------------- How it works */}
      <section className="border-y border-navy-100 bg-navy-50/50 section-y">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="How booking works"
            title="From booking to report in four steps"
            description="The online journey mirrors exactly what happens at the laboratory, so patients always know what comes next."
          />

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step.step} className="relative">
                <div className="h-full rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900 text-white">
                      <DynamicIcon name={step.icon} className="h-5 w-5" />
                    </span>
                    <span className="font-display text-2xl font-bold text-navy-100">{step.step}</span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{step.description}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ChevronRight
                    className="absolute -right-3.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-navy-200 lg:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- Home collection */}
      <section className="section-y">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <p className="label-caps mb-2 text-teal-600">Home sample collection</p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                A qualified technician at your door, in the slot you choose
              </h2>
              <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-navy-500">
                Choose home collection during booking and pick from five early-morning slots. Sample collection is
                handled with single-use sterile consumables and transported to the laboratory in temperature-controlled
                carriers.
              </p>

              <ul className="mt-6 space-y-3.5">
                {[
                  { icon: CalendarClock, text: 'Slots from 6:00 AM to 11:00 AM, with live availability per slot' },
                  { icon: HomeIcon, text: 'Service across Rajapalayam and eight surrounding localities' },
                  { icon: ShieldCheck, text: 'Trained phlebotomists with single-use, sterile collection kits' },
                  { icon: Sparkles, text: 'Female technicians available on request at no extra cost' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <item.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-[14px] leading-relaxed text-navy-700">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="accent" asChild>
                  <Link to="/packages">
                    Book with home collection
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">
                    <Phone className="h-4 w-4" />
                    Talk to the lab
                  </Link>
                </Button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-3xl border border-navy-100 bg-white p-2 shadow-card">
                <img
                  src="/images/home-collection.jpg"
                  alt="Illustrative photograph of a sample collection kit being prepared"
                  className="h-64 w-full rounded-2xl object-cover sm:h-80"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-navy-100 bg-white/95 p-4 backdrop-blur-sm sm:left-6 sm:right-auto sm:w-[300px]">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-teal-600">Collection fee</p>
                  <p className="mt-1 font-display text-2xl font-bold text-navy-900">
                    ₹100 <span className="text-sm font-medium text-navy-400">typical</span>
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-navy-500">
                    Free on the Senior Citizen Health Package. Always shown in your booking summary before payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Why choose us */}
      <section className="border-y border-navy-100 bg-white section-y">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Why choose LabCare"
            title="Built around the patient, not the paperwork"
          />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 text-navy-700 transition-colors group-hover:bg-teal-50 group-hover:text-teal-600">
                  <DynamicIcon name={item.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Testimonials */}
      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Demo testimonials"
            title="What our sample patients say"
            description="Fictional quotes created for this presentation to illustrate how the review section will look."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.id}
                className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-soft"
              >
                <Quote className="h-6 w-6 text-teal-200" aria-hidden />
                <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-navy-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-navy-100 pt-4">
                  <div>
                    <p className="text-[13.5px] font-semibold text-navy-900">{t.name}</p>
                    <p className="text-[12px] text-navy-400">{t.area}</p>
                  </div>
                  <div className="flex items-center gap-0.5" aria-label={`${t.rating} out of 5`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" aria-hidden />
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- FAQ */}
      <section className="border-t border-navy-100 bg-navy-50/50 section-y">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div>
            <p className="label-caps mb-2 text-teal-600">Questions &amp; answers</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything patients usually ask before booking
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-navy-500">
              Still unsure about something? The laboratory team is happy to help you decide which package is right for
              you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/contact">
                  <Phone className="h-4 w-4" />
                  Contact the lab
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <a href={`tel:${LAB_INFO.phone.replace(/\s/g, '')}`}>
                  {LAB_INFO.phone}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <DemoNotice variant="inline" className="mt-5">
              Answers describe the demonstration website’s behaviour. Always follow the preparation instructions given
              by the laboratory or your doctor.
            </DemoNotice>
          </div>

          <Accordion type="single" collapsible defaultValue="f1" className="space-y-3">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ------------------------------------------------------------ Final CTA */}
      <section className="section-y">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-12 text-center shadow-lift sm:px-12">
            <div className="absolute inset-0 grid-pattern opacity-60" aria-hidden />
            <div className="absolute inset-0 bg-hero-sheen" aria-hidden />
            <div className="relative mx-auto max-w-2xl">
              <Badge variant="accent" size="lg" className="bg-teal-500/20 text-teal-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Book online in under three minutes
              </Badge>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                Ready to book your health package?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
                Choose a package, add patient details, select home collection or a lab visit, and confirm your slot —
                all online.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="xl" variant="accent" asChild className="w-full sm:w-auto">
                  <Link to="/packages">
                    Explore Health Packages
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  asChild
                  className="w-full border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 sm:w-auto"
                >
                  <Link to="/my-bookings">
                    <Clock className="h-4.5 w-4.5" />
                    Track an existing booking
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
