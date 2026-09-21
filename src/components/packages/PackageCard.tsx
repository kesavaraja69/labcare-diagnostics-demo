import { Link, useNavigate } from 'react-router-dom'
import { Home, ListChecks, ShoppingBag, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PackageArtwork } from '@/components/brand/PackageArtwork'
import { PriceBlock } from '@/components/brand/PriceBlock'
import { StarRating } from '@/components/common/SectionHeading'
import { discountPercent } from '@/data/packages'
import type { DiagnosticPackage } from '@/types'
import { cn } from '@/lib/utils'

export function PackageCard({
  pkg,
  view = 'grid',
  className,
}: {
  pkg: DiagnosticPackage
  view?: 'grid' | 'list'
  className?: string
}) {
  const navigate = useNavigate()
  const discount = discountPercent(pkg)

  if (view === 'list') {
    return (
      <article
        className={cn(
          'group flex flex-col overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card sm:flex-row',
          className,
        )}
      >
        <PackageArtwork pkg={pkg} className="h-44 w-full sm:h-auto sm:w-64 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{pkg.category}</Badge>
            {pkg.featured && <Badge variant="warning">Featured</Badge>}
            {pkg.homeCollectionAvailable && (
              <Badge variant="outline">
                <Home className="h-3 w-3" /> Home collection
              </Badge>
            )}
          </div>

          <h3 className="mt-2.5 text-[17px] font-semibold leading-snug text-navy-900">
            <Link to={`/packages/${pkg.slug}`} className="hover:text-teal-700">
              {pkg.name}
            </Link>
          </h3>

          <StarRating rating={pkg.rating} count={pkg.reviewCount} className="mt-1.5" />

          <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-navy-500">{pkg.shortDescription}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] font-medium text-navy-500">
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-4 w-4 text-teal-600" aria-hidden />
              {pkg.includedTests.length} tests included
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-4 w-4 text-teal-600" aria-hidden />
              {pkg.reportAvailability.replace('Reports typically available within ', 'Report in ')}
            </span>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
            <PriceBlock mrp={pkg.mrp} price={pkg.price} discount={discount} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/packages/${pkg.slug}`}>View Details</Link>
              </Button>
              <Button
                size="sm"
                variant="accent"
                onClick={() => navigate(`/book/${pkg.slug}`)}
                aria-label={`Book ${pkg.name}`}
              >
                <ShoppingBag className="h-4 w-4" />
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card',
        className,
      )}
    >
      <div className="relative">
        <PackageArtwork pkg={pkg} className="h-44 w-full" />
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-teal-700 shadow-soft backdrop-blur-sm">
            {discount}% OFF
          </span>
        )}
        {pkg.featured && (
          <span className="absolute bottom-3 right-3 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-amber-950">
            Featured
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-5">
        <h3 className="text-[15.5px] font-semibold leading-snug text-navy-900">
          <Link to={`/packages/${pkg.slug}`} className="hover:text-teal-700">
            {pkg.name}
          </Link>
        </h3>

        <StarRating rating={pkg.rating} count={pkg.reviewCount} className="mt-1.5" />

        <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-navy-500">{pkg.shortDescription}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] font-medium text-navy-500">
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5 text-teal-600" aria-hidden />
            {pkg.includedTests.length} tests
          </span>
          {pkg.homeCollectionAvailable ? (
            <span className="inline-flex items-center gap-1.5 text-teal-700">
              <Home className="h-3.5 w-3.5" aria-hidden />
              Home collection
            </span>
          ) : (
            <span className="text-navy-400">Lab visit only</span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <PriceBlock mrp={pkg.mrp} price={pkg.price} discount={discount} size="sm" />
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/packages/${pkg.slug}`}>View Details</Link>
            </Button>
            <Button size="sm" variant="accent" onClick={() => navigate(`/book/${pkg.slug}`)}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
