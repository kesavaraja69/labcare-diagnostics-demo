import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ChevronRight,
  Filter,
  Grid2X2,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox, EmptyState, Separator } from '@/components/ui/misc'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DialogClose } from '@/components/ui/dialog'
import { PackageCard } from '@/components/packages/PackageCard'
import { PackageGridSkeleton } from '@/components/common/Loaders'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { usePackages } from '@/store/DemoStore'
import { PACKAGE_CATEGORIES, type PackageCategory } from '@/types'
import { cn } from '@/lib/utils'

const PRICE_BANDS = [
  { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
  { id: '500-1000', label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { id: '1000-1500', label: '₹1,000 – ₹1,500', min: 1000, max: 1500 },
  { id: 'above-1500', label: 'Above ₹1,500', min: 1500, max: 100000 },
]

type SortKey = 'popularity' | 'price-asc' | 'price-desc' | 'name' | 'discount' | 'newest'

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'popularity', label: 'Most popular' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'discount', label: 'Biggest discount' },
  { id: 'name', label: 'Name: A to Z' },
]

export default function PackagesPage() {
  const { packages } = usePackages()
  const [params, setParams] = useSearchParams()

  const initialCategory = params.get('category') as PackageCategory | null
  const initialSearch = params.get('q') ?? ''

  const [search, setSearch] = React.useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = React.useState(initialSearch)
  const [categories, setCategories] = React.useState<PackageCategory[]>(
    initialCategory && PACKAGE_CATEGORIES.includes(initialCategory) ? [initialCategory] : [],
  )
  const [homeOnly, setHomeOnly] = React.useState(false)
  const [band, setBand] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<SortKey>('popularity')
  const [view, setView] = React.useState<'grid' | 'list'>('grid')
  const [featuredOnly, setFeaturedOnly] = React.useState(false)
  const [visibleCount, setVisibleCount] = React.useState(12)
  const [loading, setLoading] = React.useState(true)
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 280)
    return () => clearTimeout(t)
  }, [search])

  React.useEffect(() => {
    const next = new URLSearchParams()
    if (categories.length === 1) next.set('category', categories[0])
    if (search.trim()) next.set('q', search.trim())
    setParams(next, { replace: true })
  }, [categories, search, setParams])

  const active = packages.filter((p) => p.status === 'Active')

  const filtered = React.useMemo(() => {
    let list = active.filter((p) => {
      if (categories.length && !categories.includes(p.category)) return false
      if (featuredOnly && !p.featured) return false
      if (band) {
        const b = PRICE_BANDS.find((x) => x.id === band)
        if (b && (p.price < b.min || p.price > b.max)) return false
      }
      if (homeOnly && !p.homeCollectionAvailable) return false
      if (debouncedSearch) {
        const haystack = [
          p.name,
          p.shortDescription,
          p.category,
          ...p.tags,
          ...p.includedTests.map((t) => t.name),
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(debouncedSearch)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'discount':
          return b.mrp - b.price - (a.mrp - a.price)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popularity':
        default:
          return b.popularity - a.popularity
      }
    })
    return list
  }, [active, categories, featuredOnly, band, homeOnly, debouncedSearch, sort])

  const visible = filtered.slice(0, visibleCount)
  const hasFilters =
    categories.length > 0 || band !== null || homeOnly || featuredOnly || debouncedSearch.length > 0

  const clearAll = () => {
    setCategories([])
    setBand(null)
    setHomeOnly(false)
    setFeaturedOnly(false)
    setSearch('')
  }

  const toggleCategory = (cat: PackageCategory) =>
    setCategories((list) => (list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat]))

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-navy-900">
          <Filter className="h-3.5 w-3.5" aria-hidden />
          Category
        </h3>
        <ul className="mt-3 space-y-2.5">
          {PACKAGE_CATEGORIES.map((cat) => {
            const count = active.filter((p) => p.category === cat).length
            return (
              <li key={cat}>
                <label className="flex cursor-pointer items-center justify-between gap-3 text-[13.5px] text-navy-600 hover:text-navy-900">
                  <span className="flex items-center gap-2.5">
                    <Checkbox
                      checked={categories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                      aria-label={cat}
                      disabled={count === 0}
                    />
                    <span className={count === 0 ? 'text-navy-300' : ''}>{cat}</span>
                  </span>
                  <span className="text-[11.5px] text-navy-400">{count}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      <Separator />

      <div>
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-navy-900">Price range</h3>
        <ul className="mt-3 space-y-2.5">
          {PRICE_BANDS.map((b) => (
            <li key={b.id}>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-[13.5px] text-navy-600 hover:text-navy-900">
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="price-band"
                    checked={band === b.id}
                    onChange={() => setBand(band === b.id ? null : b.id)}
                    onClick={() => band === b.id && setBand(null)}
                    className="h-4 w-4 accent-teal-500"
                    aria-label={b.label}
                  />
                  {b.label}
                </span>
                <span className="text-[11.5px] text-navy-400">
                  {active.filter((p) => p.price >= b.min && p.price <= b.max).length}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-navy-900">Collection options</h3>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13.5px] text-navy-600 hover:text-navy-900">
          <Checkbox checked={homeOnly} onCheckedChange={(v) => setHomeOnly(Boolean(v))} aria-label="Home collection available" />
          Home collection available
        </label>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13.5px] text-navy-600 hover:text-navy-900">
          <Checkbox checked={featuredOnly} onCheckedChange={(v) => setFeaturedOnly(Boolean(v))} aria-label="Featured packages only" />
          Featured packages only
        </label>
      </div>

      {hasFilters && (
        <>
          <Separator />
          <Button variant="outline" size="sm" className="w-full" onClick={clearAll}>
            <RotateCcw className="h-4 w-4" />
            Clear all filters
          </Button>
        </>
      )}
    </div>
  )

  return (
    <div className="bg-background">
      {/* Breadcrumb + heading */}
      <div className="border-b border-navy-100 bg-white">
        <div className="container-page py-6 lg:py-8">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-navy-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-700">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="font-medium text-navy-700">Tests &amp; Packages</span>
          </nav>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Tests &amp; Health Packages</h1>
              <p className="mt-2 text-[14.5px] leading-relaxed text-navy-500">
                Browse individual blood tests and preventive health packages. Compare included tests, prices and report
                timelines, then book a slot at the lab or request home sample collection.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-navy-500">
              <Badge variant="accent">{active.length} packages on offer</Badge>
              <Badge variant="outline">8 categories</Badge>
              <Badge variant="outline">Demo catalogue</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8 lg:py-10">
        <div className="flex min-w-0 gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold">Filters</h2>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[12px] font-semibold text-teal-600 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              {FilterPanel}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {/* Search + sort toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                  aria-hidden
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search packages, categories or tests — try “thyroid” or “vitamin D”"
                  className="h-11 pl-10 pr-10"
                  aria-label="Search packages"
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

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="default"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasFilters && (
                    <span className="ml-1 rounded-full bg-teal-500 px-1.5 text-[10.5px] font-bold text-white">
                      {categories.length + (band ? 1 : 0) + (homeOnly ? 1 : 0) + (featuredOnly ? 1 : 0)}
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="h-11 appearance-none rounded-xl border border-navy-200 bg-white pl-3.5 pr-9 text-[13.5px] font-medium text-navy-700 hover:border-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    aria-label="Sort packages"
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-navy-400"
                    aria-hidden
                  />
                </div>

                <div className="hidden items-center rounded-xl border border-navy-200 bg-white p-1 sm:flex">
                  {(
                    [
                      { id: 'grid' as const, icon: Grid2X2, label: 'Grid view' },
                      { id: 'list' as const, icon: List, label: 'List view' },
                    ]
                  ).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setView(v.id)}
                      className={cn(
                        'rounded-lg p-2 transition-colors',
                        view === v.id ? 'bg-navy-50 text-navy-900' : 'text-navy-400 hover:text-navy-700',
                      )}
                      aria-label={v.label}
                      aria-pressed={view === v.id}
                    >
                      <v.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[12px] font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    {c}
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                ))}
                {band && (
                  <button
                    type="button"
                    onClick={() => setBand(null)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[12px] font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    {PRICE_BANDS.find((b) => b.id === band)?.label}
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                )}
                {homeOnly && (
                  <button
                    type="button"
                    onClick={() => setHomeOnly(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[12px] font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    Home collection
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                )}
                {featuredOnly && (
                  <button
                    type="button"
                    onClick={() => setFeaturedOnly(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[12px] font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    Featured
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-1 text-[12px] font-semibold text-navy-500 hover:text-navy-900"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results header */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-navy-500">
                Showing <span className="font-semibold text-navy-900">{visible.length}</span> of{' '}
                <span className="font-semibold text-navy-900">{filtered.length}</span> packages
                {debouncedSearch && (
                  <>
                    {' '}
                    for &ldquo;<span className="font-semibold text-navy-900">{debouncedSearch}</span>&rdquo;
                  </>
                )}
              </p>
              {sort === 'popularity' && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-navy-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                  Sorted by demo popularity score
                </span>
              )}
            </div>

            {/* Results */}
            <div className="mt-5">
              {loading ? (
                <PackageGridSkeleton count={6} />
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-5 w-5" />}
                  title="No packages match your filters"
                  description="Try a different search term, remove a category, or widen the price range. You can also clear all filters to see the full demo catalogue."
                  action={
                    <Button variant="outline" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4" />
                      Clear all filters
                    </Button>
                  }
                />
              ) : (
                <div
                  className={cn(
                    view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4',
                  )}
                >
                  {visible.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} view={view} />
                  ))}
                </div>
              )}
            </div>

            {/* Load more */}
            {!loading && visible.length < filtered.length && (
              <div className="mt-8 flex justify-center">
                {/*
                  `whitespace-nowrap` from the Button base would give this label a ~347px
                  minimum width, which overflows a 320px viewport. Let it wrap (and go
                  full-width) on the smallest screens, and keep one line from `sm` up.
                */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="h-auto w-full whitespace-normal py-3 text-center leading-snug sm:h-12 sm:w-auto sm:whitespace-nowrap sm:py-0"
                >
                  Load more packages
                  <span className="text-navy-400">({filtered.length - visible.length} remaining)</span>
                </Button>
              </div>
            )}

            <DemoNotice className="mt-8">
              All packages, test counts and prices in this catalogue are fictional sample data created for the LabCare
              Diagnostics client demonstration. No real medical services are offered through this website.
            </DemoNotice>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet — modal, so it gets a portal, scroll lock, Escape and focus trap */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} modal>
        <SheetContent side="bottom" label="Filters and sorting" hideClose className="lg:hidden">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3.5 pr-14">
            <h2 className="text-base font-semibold">Filters &amp; sorting</h2>
            <DialogClose
              className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-800"
              aria-label="Close filters"
            >
              <X className="h-4.5 w-4.5" />
            </DialogClose>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{FilterPanel}</div>

          <div className="flex gap-3 border-t border-navy-100 bg-white px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            <Button variant="outline" className="flex-1" onClick={clearAll}>
              Clear
            </Button>
            <Button variant="accent" className="flex-1" onClick={() => setFiltersOpen(false)}>
              Show {filtered.length} packages
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
