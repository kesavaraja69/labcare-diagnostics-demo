import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  FlaskConical,
  Home,
  Info,
  ListChecks,
  MapPin,
  Minus,
  Phone,
  Share2,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc'
import { PackageArtwork, DynamicIcon } from '@/components/brand/PackageArtwork'
import { PriceBlock } from '@/components/brand/PriceBlock'
import { StarRating } from '@/components/common/SectionHeading'
import { PackageCard } from '@/components/packages/PackageCard'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { usePackages } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { discountPercent } from '@/data/packages'
import { LAB_INFO } from '@/data/lab'
import { inr } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function PackageDetailsPage() {
  const { slug = '' } = useParams()
  const { packages } = usePackages()
  const navigate = useNavigate()
  const { success, info } = useToast()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 380)
    return () => clearTimeout(t)
  }, [slug])

  const pkg = packages.find((p) => p.slug === slug)

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
            <FlaskConical className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-xl font-bold">This package isn’t available in the demo</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-navy-500">
            The package you opened may have been renamed or disabled in the admin panel. Browse the full demo catalogue
            to pick another package.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/packages">Browse all packages</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const discount = discountPercent(pkg)
  const related = packages
    .filter((p) => p.id !== pkg.id && p.status === 'Active' && p.category === pkg.category)
    .concat(packages.filter((p) => p.id !== pkg.id && p.status === 'Active' && p.category !== pkg.category))
    .slice(0, 3)

  const handleShare = async () => {
    const url = `${window.location.origin}/packages/${pkg.slug}`
    try {
      await navigator.clipboard.writeText(url)
      success('Demo link copied', 'Paste it anywhere to reopen this package page.')
    } catch {
      info('Demo link', url)
    }
  }

  return (
    <div className="pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <div className="border-b border-navy-100 bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-navy-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-700">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <Link to="/packages" className="hover:text-navy-700">
              Tests &amp; Packages
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="truncate font-medium text-navy-700">{pkg.shortName}</span>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/packages">
                <ArrowLeft className="h-4 w-4" />
                All packages
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-10">
          {/* ------------------------------------------------------------ Main */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-2 shadow-soft">
              <PackageArtwork pkg={pkg} size="detail" rounded="rounded-xl" className="h-56 w-full sm:h-80" />
              <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                <Badge className="bg-white/95 text-navy-800 backdrop-blur-sm" size="lg">
                  <DynamicIcon name={pkg.icon} className="h-3.5 w-3.5 text-teal-600" />
                  {pkg.category}
                </Badge>
                {pkg.featured && (
                  <Badge size="lg" className="bg-amber-400 text-amber-950">
                    <Sparkles className="h-3.5 w-3.5" />
                    Featured package
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{pkg.name}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                <StarRating rating={pkg.rating} count={pkg.reviewCount} size="md" />
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-600">
                  <ListChecks className="h-4 w-4 text-teal-600" aria-hidden />
                  {pkg.includedTests.length} tests included
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-600">
                  <Clock className="h-4 w-4 text-teal-600" aria-hidden />
                  {pkg.reportAvailability}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {pkg.tags.map((tag) => (
                  <Badge key={tag} variant="accent">
                    {tag}
                  </Badge>
                ))}
                {pkg.homeCollectionAvailable ? (
                  <Badge variant="success">
                    <Home className="h-3 w-3" />
                    Home sample collection available
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Building2 className="h-3 w-3" />
                    Visit laboratory only
                  </Badge>
                )}
                {pkg.status !== 'Active' && <Badge variant="danger">{pkg.status} — not bookable</Badge>}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="mt-8">
              <TabsList>
                <TabsTrigger value="about">About this package</TabsTrigger>
                <TabsTrigger value="tests">Included tests ({pkg.includedTests.length})</TabsTrigger>
                <TabsTrigger value="prep">Preparation</TabsTrigger>
                <TabsTrigger value="collection">Collection &amp; reports</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6 focus-visible:outline-none">
                <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
                  <h2 className="text-[17px] font-semibold">About this package</h2>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-navy-600">{pkg.description}</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: 'Tests included', value: String(pkg.includedTests.length), icon: ListChecks },
                      { label: 'Fasting', value: pkg.fastingRequired, icon: Clock },
                      {
                        label: 'Home collection',
                        value: pkg.homeCollectionAvailable ? (pkg.homeCollectionFee ? `${inr(pkg.homeCollectionFee)} fee` : 'Free') : 'Not available',
                        icon: Home,
                      },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-teal-600 shadow-soft">
                          <item.icon className="h-4 w-4" aria-hidden />
                        </span>
                        <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[13.5px] font-semibold text-navy-900">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {pkg.fastingRequired !== 'No fasting required' && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-warning-100 bg-warning-50 p-4">
                      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warning-600" aria-hidden />
                      <div>
                        <p className="text-[13.5px] font-semibold text-warning-800">{pkg.fastingRequired}</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-warning-700">
                          Follow only the instructions shared by the laboratory or your doctor. This demo page does not
                          provide personalised medical advice.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <DemoNotice className="mt-4">
                  Package contents, descriptions and prices are fictional sample data created for this client
                  demonstration and are not medical recommendations.
                </DemoNotice>
              </TabsContent>

              <TabsContent value="tests" className="mt-6 focus-visible:outline-none">
                <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-[17px] font-semibold">Included tests</h2>
                      <p className="mt-1 text-[13.5px] text-navy-500">
                        Structured sample list for this demo package. All tests are included in a single sample
                        collection visit.
                      </p>
                    </div>
                    <Badge variant="accent" size="lg">
                      {pkg.includedTests.length} tests
                    </Badge>
                  </div>

                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {pkg.includedTests.map((test, i) => (
                      <li
                        key={test.name + i}
                        className="flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/40 p-3.5"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-semibold text-navy-900">{test.name}</span>
                          {test.note && <span className="block text-[12px] text-navy-500">{test.note}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 flex items-start gap-2 text-[12px] leading-relaxed text-navy-400">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    Demo package contents. The final set of tests is confirmed by the laboratory, and your doctor decides
                    which investigations are appropriate for you.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="prep" className="mt-6 focus-visible:outline-none">
                <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
                  <h2 className="text-[17px] font-semibold">Preparation instructions</h2>
                  <p className="mt-1.5 text-[13.5px] text-navy-500">
                    General demo guidance. The laboratory shares the exact instructions that apply to your booking once
                    it is confirmed.
                  </p>
                  <ul className="mt-5 space-y-3">
                    {pkg.preparation.map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
                        <span className="text-[14px] leading-relaxed text-navy-700">{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                    <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600" aria-hidden />
                    <p className="text-[12.5px] leading-relaxed text-red-700">
                      This demonstration website does not provide medical advice. Do not start, stop or change any
                      medication based on information shown here. Speak to a qualified doctor about your health.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collection" className="mt-6 focus-visible:outline-none">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
                    <h2 className="text-[17px] font-semibold">Sample collection options</h2>
                    <p className="mt-1.5 text-[13.5px] text-navy-500">You can choose either option during booking.</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-navy-100 p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                          <Building2 className="h-4.5 w-4.5" aria-hidden />
                        </span>
                        <p className="mt-3 text-[14px] font-semibold text-navy-900">Visit Laboratory</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-navy-500">
                          Walk in at your chosen slot. No collection fee.
                        </p>
                        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-teal-700">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {LAB_INFO.addressLine}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'rounded-xl border p-4',
                          pkg.homeCollectionAvailable ? 'border-teal-200 bg-teal-50/40' : 'border-navy-100 opacity-70',
                        )}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                          <Home className="h-4.5 w-4.5" aria-hidden />
                        </span>
                        <p className="mt-3 text-[14px] font-semibold text-navy-900">Home Sample Collection</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-navy-500">
                          {pkg.homeCollectionAvailable
                            ? 'Our technician visits your address in your chosen slot.'
                            : 'Not available for this package — lab visit only.'}
                        </p>
                        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-teal-700">
                          <Truck className="h-3.5 w-3.5" aria-hidden />
                          {pkg.homeCollectionAvailable
                            ? pkg.homeCollectionFee
                              ? `${inr(pkg.homeCollectionFee)} collection fee`
                              : 'No collection fee'
                            : 'Choose visit-lab'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
                    <h2 className="text-[17px] font-semibold">Estimated report availability</h2>
                    <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-soft">
                        <FileText className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="text-[14.5px] font-semibold text-navy-900">{pkg.reportAvailability}</p>
                        <p className="mt-0.5 text-[12.5px] text-navy-500">
                          Demo information — actual turnaround is confirmed by the laboratory.
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-navy-500">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                      Track each stage — booking placed, confirmed, sample collected, processing, report ready — from the
                      My Bookings page.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Related */}
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Patients also consider</h2>
                  <p className="mt-1 text-[13.5px] text-navy-500">
                    Other demo packages that pair well with {pkg.shortName}.
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link to="/packages">
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((r) => (
                  <PackageCard key={r.id} pkg={r} />
                ))}
              </div>
            </section>
          </div>

          {/* ------------------------------------------------------ Sticky rail */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="accent">Demo offer price</Badge>
                {discount > 0 && <Badge variant="success">You save {inr(pkg.mrp - pkg.price)}</Badge>}
              </div>

              <div className="mt-4">
                <PriceBlock mrp={pkg.mrp} price={pkg.price} discount={discount} size="lg" />
                <p className="mt-1.5 text-[12.5px] text-navy-500">
                  Inclusive of taxes · {pkg.includedTests.length} tests in one collection
                </p>
              </div>

              <Separator className="my-5" />

              <ul className="space-y-3">
                <li className="flex items-center justify-between text-[13.5px]">
                  <span className="text-navy-500">Collection method</span>
                  <span className="font-semibold text-navy-900">
                    {pkg.homeCollectionAvailable ? 'Lab or home' : 'Lab visit'}
                  </span>
                </li>
                <li className="flex items-center justify-between text-[13.5px]">
                  <span className="text-navy-500">Home collection fee</span>
                  <span className="font-semibold text-navy-900">
                    {pkg.homeCollectionAvailable
                      ? pkg.homeCollectionFee
                        ? inr(pkg.homeCollectionFee)
                        : 'Free'
                      : '—'}
                  </span>
                </li>
                <li className="flex items-start justify-between gap-3 text-[13.5px]">
                  <span className="shrink-0 text-navy-500">Fasting</span>
                  <span className="text-right font-semibold text-navy-900">{pkg.fastingRequired}</span>
                </li>
                <li className="flex items-start justify-between gap-3 text-[13.5px]">
                  <span className="shrink-0 text-navy-500">Reports</span>
                  <span className="text-right font-semibold text-navy-900">{pkg.reportAvailability}</span>
                </li>
              </ul>

              <Separator className="my-5" />

              <div className="space-y-2.5">
                <Button
                  size="lg"
                  variant="accent"
                  className="w-full"
                  disabled={pkg.status !== 'Active'}
                  onClick={() => navigate(`/book/${pkg.slug}`)}
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  Book This Package
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto min-h-12 w-full whitespace-normal py-2.5 text-center leading-snug"
                  asChild
                >
                  <a href={`tel:${LAB_INFO.phone.replace(/\s/g, '')}`}>
                    <Phone className="h-4.5 w-4.5 shrink-0" />
                    Ask the lab about this package
                  </a>
                </Button>
              </div>

              <div className="mt-5 space-y-2.5 rounded-xl bg-navy-50/60 p-4">
                {[
                  { icon: CalendarClock, text: 'Slots from 6:00 AM, availability shown live' },
                  { icon: Home, text: 'Home collection across 8 local areas' },
                  { icon: FileText, text: 'Digital report download from My Bookings' },
                ].map((item) => (
                  <p key={item.text} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-navy-600">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                    {item.text}
                  </p>
                ))}
              </div>

              <DemoNotice variant="inline" className="mt-4" icon={false}>
                Demo pricing only — no real payment is processed on this website.
              </DemoNotice>
            </div>

            <div className="mt-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
              <p className="text-[13px] font-bold uppercase tracking-wider text-navy-900">Lab information</p>
              <ul className="mt-3 space-y-2.5 text-[12.5px] text-navy-600">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                  <span>
                    {LAB_INFO.addressLine1}
                    <br />
                    {LAB_INFO.addressLine2}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                  {LAB_INFO.phone}
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                  Mon–Sat 6:00 AM – 8:30 PM
                </li>
              </ul>
              <DemoNotice variant="inline" className="mt-3" icon={false}>
                Demo contact details.
              </DemoNotice>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 backdrop-blur-md lg:hidden no-print">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-navy-500">{pkg.shortName}</p>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-navy-900">{inr(pkg.price)}</span>
              <span className="text-[12px] text-navy-400 line-through">{inr(pkg.mrp)}</span>
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            disabled={pkg.status !== 'Active'}
            onClick={() => navigate(`/book/${pkg.slug}`)}
            className="shrink-0"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  )
}
