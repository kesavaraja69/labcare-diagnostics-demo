import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Boxes,
  Check,
  Copy,
  Eye,
  EyeOff,
  Filter,
  FlaskConical,
  Home,
  Inbox,
  ListChecks,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Select, Textarea } from '@/components/ui/input'
import { FieldError, Label } from '@/components/ui/label'
import { EmptyState, Separator, Switch } from '@/components/ui/misc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { DynamicIcon, PackageArtwork } from '@/components/brand/PackageArtwork'
import { usePackages, useBookings } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { PACKAGE_CATEGORIES, type DiagnosticPackage, type PackageCategory, type PackageStatus } from '@/types'
import { inr } from '@/lib/utils'
import { formatShortDate, todayISO } from '@/lib/date'
import { cn } from '@/lib/utils'

const IMAGE_OPTIONS = [
  { value: '/images/packages/full-body.jpg', label: 'Full body panel' },
  { value: '/images/packages/blood-test.jpg', label: 'Blood sample' },
  { value: '/images/packages/diabetes.jpg', label: 'Diabetes / sugar' },
  { value: '/images/packages/thyroid.jpg', label: 'Thyroid / hormone' },
  { value: '/images/packages/womens.jpg', label: 'Women’s wellness' },
  { value: '/images/packages/mens.jpg', label: 'Men’s health' },
  { value: '/images/packages/senior.jpg', label: 'Senior care' },
  { value: '/images/packages/preventive.jpg', label: 'Preventive / nutrition' },
]

import { ICON_NAMES } from '@/components/brand/IconRegistry'

const ICON_OPTIONS = ICON_NAMES.filter((n) =>
  ['Activity', 'Droplets', 'Waves', 'Flower2', 'HeartPulse', 'ShieldPlus', 'Sparkles', 'Beaker', 'TestTubes', 'Gauge'].includes(n),
)

const ACCENT_OPTIONS: DiagnosticPackage['accent'][] = ['navy', 'teal', 'violet', 'amber', 'rose', 'sky']

interface FormState {
  name: string
  shortName: string
  category: PackageCategory
  shortDescription: string
  description: string
  image: string
  icon: string
  accent: DiagnosticPackage['accent']
  testsText: string
  mrp: string
  price: string
  homeCollectionAvailable: boolean
  homeCollectionFee: string
  fastingRequired: DiagnosticPackage['fastingRequired']
  preparationText: string
  reportAvailability: string
  featured: boolean
  status: PackageStatus
  tagsText: string
}

const EMPTY_FORM: FormState = {
  name: '',
  shortName: '',
  category: 'Preventive Health',
  shortDescription: '',
  description: '',
  image: IMAGE_OPTIONS[0].value,
  icon: 'Activity',
  accent: 'navy',
  testsText: '',
  mrp: '',
  price: '',
  homeCollectionAvailable: true,
  homeCollectionFee: '100',
  fastingRequired: 'No fasting required',
  preparationText: 'Follow the preparation instructions shared by the laboratory after booking.',
  reportAvailability: 'Reports typically available within 24–48 hours',
  featured: false,
  status: 'Active',
  tagsText: '',
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)

export default function AdminPackagesPage() {
  const { packages, createPackage, updatePackage, deletePackage, togglePackageStatus, togglePackageFeatured } =
    usePackages()
  const { bookings } = useBookings()
  const { success, error, info } = useToast()

  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<PackageCategory | 'All'>('All')
  const [statusFilter, setStatusFilter] = React.useState<PackageStatus | 'All'>('All')
  const [featuredOnly, setFeaturedOnly] = React.useState(false)

  const [editorOpen, setEditorOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})
  const [deleteTarget, setDeleteTarget] = React.useState<DiagnosticPackage | null>(null)
  const [previewTarget, setPreviewTarget] = React.useState<DiagnosticPackage | null>(null)

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    return packages.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false
      if (statusFilter !== 'All' && p.status !== statusFilter) return false
      if (featuredOnly && !p.featured) return false
      if (term) {
        const hay = `${p.name} ${p.shortDescription} ${p.category} ${p.includedTests.map((t) => t.name).join(' ')}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      return true
    })
  }, [packages, search, categoryFilter, statusFilter, featuredOnly])

  const hasFilters = search.trim() !== '' || categoryFilter !== 'All' || statusFilter !== 'All' || featuredOnly

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setEditorOpen(true)
  }

  const openEdit = (pkg: DiagnosticPackage) => {
    setEditingId(pkg.id)
    setForm({
      name: pkg.name,
      shortName: pkg.shortName,
      category: pkg.category,
      shortDescription: pkg.shortDescription,
      description: pkg.description,
      image: pkg.image,
      icon: pkg.icon,
      accent: pkg.accent,
      testsText: pkg.includedTests.map((t) => (t.note ? `${t.name} | ${t.note}` : t.name)).join('\n'),
      mrp: String(pkg.mrp),
      price: String(pkg.price),
      homeCollectionAvailable: pkg.homeCollectionAvailable,
      homeCollectionFee: String(pkg.homeCollectionFee),
      fastingRequired: pkg.fastingRequired,
      preparationText: pkg.preparation.join('\n'),
      reportAvailability: pkg.reportAvailability,
      featured: pkg.featured,
      status: pkg.status,
      tagsText: pkg.tags.join(', '),
    })
    setErrors({})
    setEditorOpen(true)
  }

  const duplicate = (pkg: DiagnosticPackage) => {
    const copy = createPackage({
      ...pkg,
      name: `${pkg.name} (Copy)`,
      shortName: `${pkg.shortName} copy`,
      slug: `${pkg.slug}-copy-${Math.floor(Math.random() * 900 + 100)}`,
      featured: false,
      status: 'Draft',
    })
    success('Package duplicated', `${copy.name} was created as a draft. Enable it when you are ready.`)
  }

  const validate = (f: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!f.name.trim()) e.name = 'Package name is required'
    else if (f.name.trim().length < 4) e.name = 'Name is too short'
    if (!f.shortName.trim()) e.shortName = 'Short name is required'
    if (!f.shortDescription.trim()) e.shortDescription = 'Add a short description for the cards'
    else if (f.shortDescription.trim().length < 20) e.shortDescription = 'Add a little more detail (20+ characters)'
    if (!f.description.trim()) e.description = 'Add the longer description shown on the package page'
    else if (f.description.trim().length < 40) e.description = 'Add a little more detail (40+ characters)'
    if (!f.testsText.trim()) e.testsText = 'Add at least one test, one per line'

    const mrp = Number(f.mrp)
    const price = Number(f.price)
    if (!f.mrp) e.mrp = 'MRP is required'
    else if (!Number.isFinite(mrp) || mrp <= 0) e.mrp = 'Enter a valid amount'
    if (!f.price) e.price = 'Selling price is required'
    else if (!Number.isFinite(price) || price <= 0) e.price = 'Enter a valid amount'
    else if (Number.isFinite(mrp) && price > mrp) e.price = 'Selling price cannot exceed MRP'

    if (f.homeCollectionAvailable) {
      const fee = Number(f.homeCollectionFee)
      if (f.homeCollectionFee === '') e.homeCollectionFee = 'Enter 0 for a free collection'
      else if (!Number.isFinite(fee) || fee < 0) e.homeCollectionFee = 'Enter a valid fee or 0'
    }

    if (!f.reportAvailability.trim()) e.reportAvailability = 'Report availability is required'
    return e
  }

  const handleSave = () => {
    const e = validate(form)
    setErrors(e)
    if (Object.values(e).some(Boolean)) {
      error('Please fix the highlighted fields', 'Some package details are missing or invalid.')
      return
    }

    const includedTests = form.testsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, note] = line.split('|').map((s) => s.trim())
        return note ? { name, note } : { name }
      })

    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      slug: editingId
        ? (packages.find((p) => p.id === editingId)?.slug ?? slugify(form.name))
        : slugify(form.name),
      category: form.category,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      image: form.image,
      icon: form.icon,
      accent: form.accent,
      includedTests,
      mrp: Number(form.mrp),
      price: Number(form.price),
      homeCollectionAvailable: form.homeCollectionAvailable,
      homeCollectionFee: form.homeCollectionAvailable ? Number(form.homeCollectionFee) : 0,
      fastingRequired: form.fastingRequired,
      preparation: form.preparationText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      reportAvailability: form.reportAvailability.trim(),
      featured: form.featured,
      status: form.status,
      tags: form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    if (editingId) {
      const updated = updatePackage(editingId, payload)
      success('Package updated', `${updated?.name} saved. The customer website reflects this instantly.`)
    } else {
      const created = createPackage({
        ...payload,
        // A newly published package starts with a neutral merchandising score so it
        // appears on the first page of the customer catalogue during the demo.
        popularity: 65,
        rating: 4.5,
        reviewCount: 0,
      })
      success('Package created', `${created.name} is now ${created.status.toLowerCase()} in the demo catalogue.`)
    }
    setEditorOpen(false)
    setEditingId(null)
  }

  const removeBookingCount = (id: string) => bookings.filter((b) => b.packageId === id).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Package management</h1>
          <p className="mt-1.5 text-[13.5px] text-navy-500">
            Maintain the demo catalogue — add packages, edit pricing and contents, toggle availability. Changes appear on
            the customer website immediately.
          </p>
        </div>
        <Button size="sm" variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add package
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search package name, category or included test"
              className="pl-10 pr-10"
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

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as PackageCategory | 'All')}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {PACKAGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PackageStatus | 'All')}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Disabled">Disabled</option>
          </Select>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-navy-600">
              <Switch checked={featuredOnly} onCheckedChange={setFeaturedOnly} aria-label="Featured only" />
              Featured
            </label>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setCategoryFilter('All')
                  setStatusFilter('All')
                  setFeaturedOnly(false)
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-navy-500">
          <span>
            Showing <span className="font-semibold text-navy-900">{filtered.length}</span> of{' '}
            <span className="font-semibold text-navy-900">{packages.length}</span> packages
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success-500" aria-hidden />
            {packages.filter((p) => p.status === 'Active').length} active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning-500" aria-hidden />
            {packages.filter((p) => p.status === 'Draft').length} draft
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-navy-300" aria-hidden />
            {packages.filter((p) => p.status === 'Disabled').length} disabled
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
            {packages.filter((p) => p.featured).length} featured on the homepage
          </span>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead className="bg-navy-50/70">
              <tr>
                {['Package', 'Category', 'Tests', 'MRP', 'Selling price', 'Discount', 'Home collection', 'Status', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wider text-navy-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12">
                    <EmptyState
                      className="border-0 bg-transparent py-4"
                      icon={<Boxes className="h-5 w-5" />}
                      title="No packages match"
                      description="Adjust your search or filters, or create a new demo package."
                      action={
                        <Button size="sm" variant="accent" onClick={openCreate}>
                          <Plus className="h-4 w-4" />
                          Add package
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0
                  return (
                    <tr key={p.id} className="border-t border-navy-100 transition-colors hover:bg-navy-50/40">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <PackageArtwork pkg={p} size="thumb" rounded="rounded-lg" className="h-11 w-11 shrink-0" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-navy-900">
                              {p.name}
                              {p.featured && <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" aria-hidden />}
                            </p>
                            <p className="truncate font-mono text-[11px] text-navy-400">/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline">{p.category}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-navy-600">
                          <ListChecks className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                          {p.includedTests.length}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[12.5px] text-navy-400 line-through">{inr(p.mrp)}</td>
                      <td className="px-4 py-3.5 text-[13px] font-bold text-navy-900">{inr(p.price)}</td>
                      <td className="px-4 py-3.5">
                        {discount > 0 ? (
                          <Badge variant="success">{discount}% off</Badge>
                        ) : (
                          <span className="text-[12px] text-navy-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.homeCollectionAvailable ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-teal-700">
                            <Home className="h-3.5 w-3.5" aria-hidden />
                            {p.homeCollectionFee ? inr(p.homeCollectionFee) : 'Free'}
                          </span>
                        ) : (
                          <span className="text-[12px] text-navy-400">Lab only</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={p.status === 'Active'}
                            onCheckedChange={() => {
                              togglePackageStatus(p.id)
                              info(
                                p.status === 'Active' ? 'Package disabled' : 'Package enabled',
                                `${p.name} is now ${p.status === 'Active' ? 'hidden from' : 'visible on'} the customer website.`,
                              )
                            }}
                            aria-label={`Toggle ${p.name} availability`}
                          />
                          <span
                            className={cn(
                              'text-[11.5px] font-semibold',
                              p.status === 'Active'
                                ? 'text-success-600'
                                : p.status === 'Draft'
                                  ? 'text-warning-600'
                                  : 'text-navy-400',
                            )}
                          >
                            {p.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => {
                              togglePackageFeatured(p.id)
                              success(
                                p.featured ? 'Removed from featured' : 'Marked as featured',
                                `${p.name} ${p.featured ? 'no longer appears' : 'now appears'} in the homepage top packages.`,
                              )
                            }}
                            aria-label={p.featured ? 'Unfeature package' : 'Feature package'}
                            title={p.featured ? 'Unfeature package' : 'Feature package'}
                          >
                            <Star
                              className={cn('h-4 w-4', p.featured ? 'text-amber-400' : 'text-navy-300')}
                              fill={p.featured ? 'currentColor' : 'none'}
                            />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setPreviewTarget(p)}
                            aria-label="Preview package"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => duplicate(p)}
                            aria-label="Duplicate package"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                            aria-label="Edit package"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleteTarget(p)}
                            aria-label="Delete package"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards (mobile / tablet) */}
      <ul className="grid gap-4 xl:hidden">
        {filtered.length === 0 ? (
          <li>
            <EmptyState
              icon={<Boxes className="h-5 w-5" />}
              title="No packages match"
              description="Adjust your search or filters, or create a new demo package."
              action={
                <Button size="sm" variant="accent" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Add package
                </Button>
              }
            />
          </li>
        ) : (
          filtered.map((p) => {
            const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0
            return (
              <li key={p.id} className="rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
                <div className="flex gap-3.5">
                  <PackageArtwork pkg={p} size="thumb" rounded="rounded-xl" className="h-16 w-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {p.category}
                      </Badge>
                      {p.featured && (
                        <Badge variant="warning" size="sm">
                          Featured
                        </Badge>
                      )}
                      <Badge variant={p.status === 'Active' ? 'success' : 'default'} size="sm">
                        {p.status}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-[14px] font-semibold leading-snug text-navy-900">{p.name}</p>
                    <p className="mt-1 text-[12px] text-navy-500">
                      {p.includedTests.length} tests
                      {p.homeCollectionAvailable && ` · Home collection ${p.homeCollectionFee ? inr(p.homeCollectionFee) : 'free'}`}
                    </p>
                    <p className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-[15px] font-bold text-navy-900">{inr(p.price)}</span>
                      <span className="text-[12px] text-navy-400 line-through">{inr(p.mrp)}</span>
                      {discount > 0 && <span className="text-[11.5px] font-bold text-teal-700">{discount}% off</span>}
                    </p>
                  </div>
                </div>

                <Separator className="my-3.5" />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[12px] font-medium text-navy-600">
                    <Switch
                      checked={p.status === 'Active'}
                      onCheckedChange={() => togglePackageStatus(p.id)}
                      aria-label={`Toggle ${p.name}`}
                    />
                    Available online
                  </label>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        togglePackageFeatured(p.id)
                        success(p.featured ? 'Unfeatured' : 'Featured', `${p.name} updated.`)
                      }}
                    >
                      <Star
                        className={cn('h-3.5 w-3.5', p.featured ? 'text-amber-400' : 'text-navy-400')}
                        fill={p.featured ? 'currentColor' : 'none'}
                      />
                      {p.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button size="sm" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => setDeleteTarget(p)}
                      aria-label="Delete package"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            )
          })
        )}
      </ul>

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open) setEditingId(null) }}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit package' : 'Add a new package'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Changes are saved to the demo store and appear immediately on the customer website.'
                : 'Create a new demo health package. It becomes visible on the customer website once the status is Active.'}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[64vh] space-y-6 overflow-y-auto pr-1 scrollbar-thin">
            {/* Basics */}
            <section>
              <h3 className="text-[12.5px] font-bold uppercase tracking-wider text-navy-500">Basic details</h3>
              <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="pkg-name" required>
                    Package name
                  </Label>
                  <Input
                    id="pkg-name"
                    value={form.name}
                    invalid={Boolean(errors.name)}
                    placeholder="e.g. Diabetic Foot Care Panel"
                    className="mt-1.5"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <FieldError>{errors.name}</FieldError>
                </div>

                <div>
                  <Label htmlFor="pkg-short" required hint="Shown on compact cards">
                    Short name
                  </Label>
                  <Input
                    id="pkg-short"
                    value={form.shortName}
                    invalid={Boolean(errors.shortName)}
                    placeholder="e.g. Foot Care"
                    className="mt-1.5"
                    onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                  />
                  <FieldError>{errors.shortName}</FieldError>
                </div>

                <div>
                  <Label htmlFor="pkg-category" required>
                    Category
                  </Label>
                  <div className="mt-1.5">
                    <Select
                      id="pkg-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as PackageCategory })}
                    >
                      {PACKAGE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="pkg-shortdesc" required hint="Max ~140 characters">
                    Short description
                  </Label>
                  <Textarea
                    id="pkg-shortdesc"
                    value={form.shortDescription}
                    invalid={Boolean(errors.shortDescription)}
                    maxLength={160}
                    placeholder="One or two lines describing who this package is for and what it covers."
                    className="mt-1.5 min-h-[70px]"
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  />
                  <div className="flex items-center justify-between">
                    <FieldError>{errors.shortDescription}</FieldError>
                    <span className="text-[11px] text-navy-400">{form.shortDescription.length}/160</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="pkg-desc" required>
                    Full description (About this package)
                  </Label>
                  <Textarea
                    id="pkg-desc"
                    value={form.description}
                    invalid={Boolean(errors.description)}
                    placeholder="Describe what the demo package contains and how it is used."
                    className="mt-1.5"
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <FieldError>{errors.description}</FieldError>
                </div>
              </div>
            </section>

            <Separator />

            {/* Pricing */}
            <section>
              <h3 className="text-[12.5px] font-bold uppercase tracking-wider text-navy-500">Pricing</h3>
              <div className="mt-3.5 grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="pkg-mrp" required>
                    MRP (₹)
                  </Label>
                  <Input
                    id="pkg-mrp"
                    inputMode="numeric"
                    value={form.mrp}
                    invalid={Boolean(errors.mrp)}
                    placeholder="2499"
                    className="mt-1.5"
                    onChange={(e) => setForm({ ...form, mrp: e.target.value.replace(/\D/g, '') })}
                  />
                  <FieldError>{errors.mrp}</FieldError>
                </div>
                <div>
                  <Label htmlFor="pkg-price" required>
                    Selling price (₹)
                  </Label>
                  <Input
                    id="pkg-price"
                    inputMode="numeric"
                    value={form.price}
                    invalid={Boolean(errors.price)}
                    placeholder="1999"
                    className="mt-1.5"
                    onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, '') })}
                  />
                  <FieldError>{errors.price}</FieldError>
                </div>
                <div>
                  <Label>Discount (calculated)</Label>
                  <div className="mt-1.5 flex h-11 items-center rounded-xl border border-navy-100 bg-navy-50/60 px-3.5">
                    {Number(form.mrp) > 0 && Number(form.price) > 0 && Number(form.price) <= Number(form.mrp) ? (
                      <span className="text-[14px] font-bold text-teal-700">
                        {Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)}% off · saves{' '}
                        {inr(Number(form.mrp) - Number(form.price))}
                      </span>
                    ) : (
                      <span className="text-[12.5px] text-navy-400">Enter MRP and price</span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-navy-100 p-4">
                    <div>
                      <Label htmlFor="pkg-home" className="cursor-pointer">
                        Home sample collection available
                      </Label>
                      <p className="mt-0.5 text-[12px] text-navy-400">
                        Enables the home collection option in the booking wizard.
                      </p>
                    </div>
                    <Switch
                      id="pkg-home"
                      checked={form.homeCollectionAvailable}
                      onCheckedChange={(v) => setForm({ ...form, homeCollectionAvailable: v })}
                    />
                  </div>
                </div>

                {form.homeCollectionAvailable && (
                  <div>
                    <Label htmlFor="pkg-fee" required hint="Use 0 for free">
                      Home collection fee (₹)
                    </Label>
                    <Input
                      id="pkg-fee"
                      inputMode="numeric"
                      value={form.homeCollectionFee}
                      invalid={Boolean(errors.homeCollectionFee)}
                      placeholder="100"
                      className="mt-1.5"
                      onChange={(e) => setForm({ ...form, homeCollectionFee: e.target.value.replace(/\D/g, '') })}
                    />
                    <FieldError>{errors.homeCollectionFee}</FieldError>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, homeCollectionFee: '0' })}>
                        Free
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, homeCollectionFee: '100' })}>
                        ₹100
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Contents */}
            <section>
              <h3 className="text-[12.5px] font-bold uppercase tracking-wider text-navy-500">Package contents</h3>
              <div className="mt-3.5 space-y-4">
                <div>
                  <Label htmlFor="pkg-tests" required hint="One test per line · optional note after a | character">
                    Included tests
                  </Label>
                  <Textarea
                    id="pkg-tests"
                    value={form.testsText}
                    invalid={Boolean(errors.testsText)}
                    placeholder={'Complete Blood Count\nHemoglobin | RBC, WBC and platelet indices\nFasting Blood Sugar'}
                    className="mt-1.5 min-h-[130px] font-mono text-[12.5px]"
                    onChange={(e) => setForm({ ...form, testsText: e.target.value })}
                  />
                  <div className="flex items-center justify-between">
                    <FieldError>{errors.testsText}</FieldError>
                    <span className="text-[11px] text-navy-400">
                      {form.testsText.split('\n').filter((l) => l.trim()).length} tests
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="pkg-fasting">Fasting requirement</Label>
                    <div className="mt-1.5">
                      <Select
                        id="pkg-fasting"
                        value={form.fastingRequired}
                        onChange={(e) =>
                          setForm({ ...form, fastingRequired: e.target.value as DiagnosticPackage['fastingRequired'] })
                        }
                      >
                        <option value="No fasting required">No fasting required</option>
                        <option value="8–10 hours fasting recommended">8–10 hours fasting recommended</option>
                        <option value="10–12 hours fasting recommended">10–12 hours fasting recommended</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pkg-report" required>
                      Report availability
                    </Label>
                    <Input
                      id="pkg-report"
                      value={form.reportAvailability}
                      invalid={Boolean(errors.reportAvailability)}
                      placeholder="Reports typically available within 24–48 hours"
                      className="mt-1.5"
                      onChange={(e) => setForm({ ...form, reportAvailability: e.target.value })}
                    />
                    <FieldError>{errors.reportAvailability}</FieldError>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pkg-prep" hint="One instruction per line">
                    Preparation instructions
                  </Label>
                  <Textarea
                    id="pkg-prep"
                    value={form.preparationText}
                    placeholder={'Fasting may be required for selected tests.\nDrink water unless instructed otherwise.'}
                    className="mt-1.5 min-h-[90px]"
                    onChange={(e) => setForm({ ...form, preparationText: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Presentation */}
            <section>
              <h3 className="text-[12.5px] font-bold uppercase tracking-wider text-navy-500">
                Presentation &amp; visibility
              </h3>
              <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pkg-image">Package image</Label>
                  <div className="mt-1.5">
                    <Select id="pkg-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}>
                      {IMAGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pkg-icon">Icon</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Select id="pkg-icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                      {ICON_OPTIONS.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </Select>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-navy-200 bg-navy-50 text-navy-700">
                      <DynamicIcon name={form.icon} className="h-5 w-5" />
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label>Accent colour</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ACCENT_OPTIONS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setForm({ ...form, accent: a })}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] font-semibold capitalize transition-colors',
                          form.accent === a
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-navy-200 bg-white text-navy-600 hover:border-navy-300',
                        )}
                        aria-pressed={form.accent === a}
                      >
                        <span
                          className={cn(
                            'h-3.5 w-3.5 rounded-full',
                            a === 'navy' && 'bg-navy-800',
                            a === 'teal' && 'bg-teal-600',
                            a === 'violet' && 'bg-violet-600',
                            a === 'amber' && 'bg-amber-500',
                            a === 'rose' && 'bg-rose-500',
                            a === 'sky' && 'bg-sky-600',
                          )}
                          aria-hidden
                        />
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="pkg-tags" hint="Comma separated">
                    Tags
                  </Label>
                  <Input
                    id="pkg-tags"
                    value={form.tagsText}
                    placeholder="Most popular, No fasting, Preventive"
                    className="mt-1.5"
                    onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="pkg-status">Status</Label>
                  <div className="mt-1.5">
                    <Select
                      id="pkg-status"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as PackageStatus })}
                    >
                      <option value="Active">Active — bookable online</option>
                      <option value="Draft">Draft — not visible</option>
                      <option value="Disabled">Disabled — hidden from customers</option>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-navy-100 p-4">
                  <div>
                    <Label htmlFor="pkg-featured" className="cursor-pointer">
                      Featured package
                    </Label>
                    <p className="mt-0.5 text-[12px] text-navy-400">Shows in “Popular Health Packages” on the homepage.</p>
                  </div>
                  <Switch id="pkg-featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                </div>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditorOpen(false)
                setEditingId(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave}>
              <Check className="h-4 w-4" />
              {editingId ? 'Save changes' : 'Create package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={Boolean(previewTarget)} onOpenChange={() => setPreviewTarget(null)}>
        <DialogContent size="md">
          {previewTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Customer preview</DialogTitle>
                <DialogDescription>
                  How this package appears on the customer website (demo card preview).
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl border border-navy-100 bg-white p-4">
                <PackageArtwork pkg={previewTarget} className="h-40 w-full" />
                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{previewTarget.category}</Badge>
                    {previewTarget.featured && <Badge variant="warning">Featured</Badge>}
                    {previewTarget.status !== 'Active' && <Badge variant="danger">{previewTarget.status}</Badge>}
                  </div>
                  <h3 className="mt-2.5 text-[15px] font-semibold">{previewTarget.name}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">
                    {previewTarget.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[12px] text-navy-500">
                    <span className="inline-flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                      {previewTarget.includedTests.length} tests
                    </span>
                    {previewTarget.homeCollectionAvailable && (
                      <span className="inline-flex items-center gap-1.5 text-teal-700">
                        <Home className="h-3.5 w-3.5" aria-hidden />
                        Home collection
                      </span>
                    )}
                  </div>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-navy-900">{inr(previewTarget.price)}</span>
                    <span className="text-[13px] text-navy-400 line-through">{inr(previewTarget.mrp)}</span>
                  </p>
                  <p className="mt-1 text-[11.5px] text-navy-400">
                    Last updated {formatShortDate(previewTarget.updatedAt)}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewTarget(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.open(`/packages/${previewTarget.slug}`, '_blank')
                    info('Opening live page', 'The real customer-facing package page opens in a new tab.')
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Open live page
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && removeBookingCount(deleteTarget.id) > 0 ? (
                <>
                  This package has <strong>{removeBookingCount(deleteTarget.id)}</strong> demo booking
                  {removeBookingCount(deleteTarget.id) === 1 ? '' : 's'}. The bookings are retained but will show the
                  package as unavailable. Consider disabling it instead of deleting.
                </>
              ) : (
                'The package will be removed from the demo catalogue. This cannot be undone within the session — you can restore all demo data from the sidebar.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep package</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!deleteTarget) return
                deletePackage(deleteTarget.id)
                success('Package deleted', `${deleteTarget.name} was removed from the demo catalogue.`)
                setDeleteTarget(null)
              }}
            >
              Delete package
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy-100 bg-white p-4 text-[12px] text-navy-500">
        <span className="inline-flex items-center gap-2 font-semibold text-navy-700">
          <FlaskConical className="h-4 w-4 text-teal-600" aria-hidden />
          Tips for the demo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-teal-600" aria-hidden />
          Edit a price, then open the customer catalogue to show the change
        </span>
        <span className="inline-flex items-center gap-1.5">
          <EyeOff className="h-3.5 w-3.5 text-teal-600" aria-hidden />
          Disable a package to hide it from customers instantly
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          Feature a package to move it onto the homepage
        </span>
      </div>
    </div>
  )
}
