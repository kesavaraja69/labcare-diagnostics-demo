/**
 * LabCare Diagnostics — Domain models
 * ------------------------------------------------------------------
 * These types are the single source of truth for the whole demo and are
 * intentionally backend-shaped so a real PostgreSQL/REST layer can drop in
 * later without touching the UI.
 *
 * Business mapping (see README):
 *   Diagnostic Package  ->  "item"      (catalogue entity)
 *   Booking             ->  "order"     (transaction)
 *   Patient             ->  "customer"  (person receiving the service)
 *   Collection Slot     ->  "fulfilment / appointment"
 */

export type PackageCategory =
  | 'Full Body'
  | 'Diabetes'
  | 'Thyroid'
  | "Women's Health"
  | "Men's Health"
  | 'Senior Care'
  | 'Preventive Health'
  | 'Individual Blood Tests'

export const PACKAGE_CATEGORIES: PackageCategory[] = [
  'Full Body',
  'Diabetes',
  'Thyroid',
  "Women's Health",
  "Men's Health",
  'Senior Care',
  'Preventive Health',
  'Individual Blood Tests',
]

export type PackageStatus = 'Active' | 'Draft' | 'Disabled'

/** A single named test inside a package (e.g. "Complete Blood Count"). */
export interface IncludedTest {
  name: string
  /** Optional short demo note about what the test measures. */
  note?: string
}

export interface DiagnosticPackage {
  id: string
  slug: string
  name: string
  shortName: string
  category: PackageCategory
  shortDescription: string
  description: string
  /** Local image path or emoji-free icon key handled by <PackageArtwork />. */
  image: string
  icon: string
  accent: 'navy' | 'teal' | 'violet' | 'amber' | 'rose' | 'sky'
  includedTests: IncludedTest[]
  mrp: number
  price: number
  homeCollectionAvailable: boolean
  homeCollectionFee: number
  fastingRequired: 'No fasting required' | '8–10 hours fasting recommended' | '10–12 hours fasting recommended'
  preparation: string[]
  reportAvailability: string
  featured: boolean
  status: PackageStatus
  popularity: number
  rating: number
  reviewCount: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

/* ----------------------------- Patients ----------------------------- */

export type Gender = 'Male' | 'Female' | 'Other'

export interface Patient {
  id: string
  fullName: string
  age: number
  gender: Gender
  mobile: string
  email: string
}

/** Lightweight patient draft captured inside the booking wizard. */
export type PatientDraft = Omit<Patient, 'id'>

/* ----------------------------- Customers ---------------------------- */

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  gender: Gender
  age: number
  area: string
  totalBookings: number
  totalAmount: number
  lastBookingDate: string | null
  status: 'Active' | 'Inactive' | 'New'
  joinedOn: string
}

/* ----------------------------- Bookings ----------------------------- */

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Sample Collection Scheduled'
  | 'Sample Collected'
  | 'Processing'
  | 'Report Ready'
  | 'Completed'
  | 'Cancelled'

export const BOOKING_STATUS_FLOW: BookingStatus[] = [
  'Pending',
  'Confirmed',
  'Sample Collection Scheduled',
  'Sample Collected',
  'Processing',
  'Report Ready',
  'Completed',
]

export const ALL_BOOKING_STATUSES: BookingStatus[] = [...BOOKING_STATUS_FLOW, 'Cancelled']

export type CollectionMethod = 'Visit Lab' | 'Home Sample Collection'

export interface HomeCollectionAddress {
  line1: string
  area: string
  city: string
  pincode: string
  landmark?: string
}

export interface TimelineEvent {
  status: BookingStatus
  at: string
  note?: string
  by?: 'Customer' | 'LabCare Staff' | 'System'
  /**
   * Set when a later event supersedes this one, as happens when the lab reverses
   * a cancellation. The event is never deleted or rewritten — `at`, `note` and
   * `by` stay as first recorded — so the timeline remains a trustworthy audit
   * trail while still showing which entries are no longer in force.
   */
  reversedAt?: string | null
}

export type PaymentMethod = 'UPI' | 'Credit / Debit Card' | 'Net Banking' | 'Cash at Lab'

export interface PaymentInfo {
  method: PaymentMethod
  /** 'Paid' = demo payment captured online, 'Pay at Lab' = collect on visit. */
  state: 'Paid' | 'Pay at Lab' | 'Pending'
  reference: string | null
  paidAt: string | null
  amountPaid: number
}

export interface Booking {
  id: string
  /** Human-friendly booking number, e.g. LAB-2026-000125 */
  bookingNo: string
  packageId: string
  packageName: string
  packageCategory: PackageCategory
  patient: Patient
  customerId: string | null
  collectionMethod: CollectionMethod
  address: HomeCollectionAddress | null
  /** ISO date, e.g. 2026-09-25 */
  appointmentDate: string
  timeSlot: string
  testsCount: number
  reportAvailability: string
  pricing: {
    mrp: number
    packagePrice: number
    discount: number
    homeCollectionFee: number
    total: number
  }
  payment: PaymentInfo
  status: BookingStatus
  timeline: TimelineEvent[]
  createdAt: string
  updatedAt: string
  source: 'Website' | 'Walk-in' | 'Phone'
  isDemo: true
  reportReadyAt?: string | null
  notes?: string
}

export interface BookingDraft {
  packageId: string
  patient: PatientDraft
  collectionMethod: CollectionMethod | null
  address: HomeCollectionAddress | null
  appointmentDate: string
  timeSlot: string
}

/* ------------------------------ Reports ----------------------------- */

export interface ReportRow {
  test: string
  value: string
  unit: string
  referenceRange: string
  flag: 'Normal' | 'Borderline' | 'Review recommended'
}

export interface DemoReport {
  bookingNo: string
  patientName: string
  age: number
  gender: Gender
  collectedOn: string
  reportedOn: string
  packageName: string
  rows: ReportRow[]
  remarks: string
}

/* --------------------------------- CMS ------------------------------ */

export interface Testimonial {
  id: string
  name: string
  area: string
  quote: string
  rating: number
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

/* ------------------------------- Users ------------------------------ */

export type UserRole = 'customer' | 'admin'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  customerId?: string
}

/* ------------------------- Admin analytics -------------------------- */

export interface DashboardMetric {
  key: string
  label: string
  value: string
  rawValue: number
  delta: number
  hint: string
  icon: string
}

export interface SeriesPoint {
  label: string
  value: number
  secondary?: number
}

export interface AdminStats {
  metrics: {
    todaysBookings: number
    pending: number
    confirmed: number
    completed: number
    todaysRevenue: number
    totalCustomers: number
  }
  bookingTrend: SeriesPoint[]
  revenueTrend: SeriesPoint[]
  popularPackages: { name: string; bookings: number; revenue: number }[]
  bookingSource: { label: string; value: number }[]
  collectionType: { label: string; value: number }[]
}

/* --------------------------- API envelope --------------------------- */

export interface ApiResult<T> {
  ok: boolean
  data: T
  message?: string
}
