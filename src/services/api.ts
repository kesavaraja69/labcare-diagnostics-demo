/**
 * SERVICE LAYER — future-ready API abstraction.
 * ------------------------------------------------------------------
 * Every screen in the demo talks to these typed service objects, never to
 * localStorage or fetch directly. Each service currently resolves against the
 * local demo store (see src/store), so swapping in a real backend later means
 * replacing the body of one module per domain — no UI changes required.
 *
 * Planned production backing (none of these are used or required today):
 *   authService         -> JWT / Firebase Auth
 *   packageService      -> REST  GET /api/packages      (PostgreSQL)
 *   bookingService      -> REST  POST /api/bookings
 *   customerService     -> REST  GET /api/customers
 *   paymentService      -> Razorpay / Stripe order + capture
 *   notificationService -> WhatsApp Cloud API / SMS / Email
 *   reportService       -> Lab Information System (LIS) report endpoint
 */

import type {
  AdminStats,
  ApiResult,
  Booking,
  BookingStatus,
  Customer,
  DemoReport,
  DiagnosticPackage,
  Gender,
  Patient,
  SessionUser,
} from '@/types'

/** Simulated network latency so loading states are demonstrable. */
export const wait = (ms = 420) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const ok = <T>(data: T, message?: string): ApiResult<T> => ({ ok: true, data, message })

export interface AuthService {
  login(email: string, password: string): Promise<ApiResult<SessionUser>>
  logout(): Promise<ApiResult<null>>
  currentUser(): SessionUser | null
}

export interface PackageService {
  list(): DiagnosticPackage[]
  get(id: string): DiagnosticPackage | undefined
  getBySlug(slug: string): DiagnosticPackage | undefined
  create(input: Omit<DiagnosticPackage, 'id' | 'createdAt' | 'updatedAt'>): DiagnosticPackage
  update(id: string, patch: Partial<DiagnosticPackage>): DiagnosticPackage | undefined
  remove(id: string): void
}

export interface BookingService {
  list(): Booking[]
  get(id: string): Booking | undefined
  create(input: Omit<Booking, 'id' | 'bookingNo' | 'createdAt' | 'updatedAt' | 'timeline'>): Booking
  updateStatus(id: string, status: BookingStatus, note?: string): Booking | undefined
  cancel(id: string, reason?: string): Booking | undefined
  filterByStatus(status: BookingStatus | 'All'): Booking[]
}

export interface CustomerService {
  list(): Customer[]
  get(id: string): Customer | undefined
  bookingsFor(id: string): Booking[]
}

export interface PaymentService {
  /** Demo only — a real implementation creates a gateway order server-side. */
  createOrder(input: { amount: number; bookingId: string }): Promise<ApiResult<{ orderId: string; amount: number }>>
  capture(input: { orderId: string; method: string }): Promise<ApiResult<{ reference: string; status: 'Paid' }>>
  refund(reference: string, amount: number): Promise<ApiResult<{ refundId: string }>>
}

export interface NotificationService {
  sendSms(to: string, template: string, vars: Record<string, string>): Promise<ApiResult<{ queued: true }>>
  sendWhatsApp(to: string, template: string, vars: Record<string, string>): Promise<ApiResult<{ queued: true }>>
  sendEmail(to: string, subject: string, body: string): Promise<ApiResult<{ queued: true }>>
}

export interface ReportService {
  getForBooking(bookingId: string): Promise<ApiResult<DemoReport | null>>
  download(bookingId: string): Promise<ApiResult<{ filename: string }>>
}

export interface AnalyticsService {
  stats(): AdminStats
}

export const DEMO_ADMIN = {
  id: 'usr-admin',
  name: 'Dr. Anand V (Lab Manager)',
  email: 'admin@labcare-demo.in',
  role: 'admin' as const,
}

export const DEMO_CUSTOMER_LOGIN = {
  id: 'cus-001',
  name: 'Ravi Kumar',
  email: 'ravi.kumar@example.com',
  role: 'customer' as const,
}

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@labcare-demo.in', password: 'Demo@12345' },
  customer: { email: 'ravi.kumar@example.com', password: 'Demo@12345' },
}

export type GenderValue = Gender
export type PatientInput = Omit<Patient, 'id'>
