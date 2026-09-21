import * as React from 'react'
import type {
  AdminStats,
  Booking,
  BookingStatus,
  Customer,
  DiagnosticPackage,
  SessionUser,
  SeriesPoint,
  TimelineEvent,
} from '@/types'
import { PACKAGES } from '@/data/packages'
import { CUSTOMERS } from '@/data/customers'
import { SEED_BOOKINGS, NEXT_BOOKING_SEQ } from '@/data/bookings'
import { DEMO_ADMIN, DEMO_CUSTOMER_LOGIN, DEMO_CREDENTIALS, wait } from '@/services/api'
import { StorageKeys, readJSON, writeJSON, resetDemoStorage } from '@/store/storage'
import { makeBookingNo, makeId } from '@/lib/utils'
import { isoDaysFromToday, monthLabel, todayISO } from '@/lib/date'

/* -------------------------------------------------------------------------- */
/*  Store shape                                                               */
/* -------------------------------------------------------------------------- */

interface DemoState {
  packages: DiagnosticPackage[]
  bookings: Booking[]
  customers: Customer[]
  session: SessionUser | null
  hydrated: boolean
}

interface DemoActions {
  /* packages */
  createPackage: (input: Omit<DiagnosticPackage, 'id' | 'createdAt' | 'updatedAt'>) => DiagnosticPackage
  updatePackage: (id: string, patch: Partial<DiagnosticPackage>) => DiagnosticPackage | undefined
  deletePackage: (id: string) => void
  togglePackageStatus: (id: string) => void
  togglePackageFeatured: (id: string) => void

  /* bookings */
  createBooking: (
    input: Omit<Booking, 'id' | 'bookingNo' | 'createdAt' | 'updatedAt' | 'timeline'>,
  ) => Booking
  updateBookingStatus: (id: string, status: BookingStatus, note?: string) => Booking | undefined
  cancelBooking: (id: string, reason?: string) => Booking | undefined
  getBooking: (id: string) => Booking | undefined

  /* auth */
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; message: string }>
  loginCustomer: (email: string, password: string) => Promise<{ ok: boolean; message: string }>
  logout: () => void

  /* demo utilities */
  resetDemo: () => void
  stats: AdminStats
}

type DemoContextValue = DemoState & DemoActions

const DemoContext = React.createContext<DemoContextValue | null>(null)

/* -------------------------------------------------------------------------- */
/*  Analytics (derived from live demo bookings)                               */
/* -------------------------------------------------------------------------- */

const countBy = <T extends string>(list: T[]) => {
  const map = new Map<T, number>()
  list.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1))
  return map
}

function computeStats(bookings: Booking[], packages: DiagnosticPackage[]): AdminStats {
  const today = todayISO()
  const active = bookings.filter((b) => b.status !== 'Cancelled')

  const todaysBookings = bookings.filter((b) => b.createdAt.slice(0, 10) === today).length
  const pending = bookings.filter((b) => b.status === 'Pending').length
  const confirmed = bookings.filter((b) => b.status === 'Confirmed').length
  const completed = bookings.filter((b) => b.status === 'Completed').length
  const todaysRevenue = bookings
    .filter((b) => b.payment.state === 'Paid' && (b.payment.paidAt ?? '').slice(0, 10) === today)
    .reduce((sum, b) => sum + b.pricing.total, 0)

  /* Booking trend — last 14 days */
  const bookingTrend: SeriesPoint[] = Array.from({ length: 14 }).map((_, i) => {
    const offset = i - 13
    const iso = isoDaysFromToday(offset)
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return {
      label: `${d.getDate()} ${monthLabel(d)}`,
      value: bookings.filter((b) => b.createdAt.slice(0, 10) === iso).length,
    }
  })

  /* Revenue trend — last 8 weeks */
  const revenueTrend: SeriesPoint[] = Array.from({ length: 8 }).map((_, i) => {
    const weekIndex = 7 - i
    const start = new Date()
    start.setDate(start.getDate() - (weekIndex * 7 + 6))
    const end = new Date()
    end.setDate(end.getDate() - weekIndex * 7)
    const value = active
      .filter((b) => {
        const t = new Date(b.createdAt).getTime()
        return t >= start.getTime() && t <= end.getTime() + 86_400_000
      })
      .reduce((sum, b) => sum + b.pricing.total, 0)
    return { label: `W${8 - i}`, value }
  })

  const pkgCount = countBy(bookings.map((b) => b.packageId))
  const popularPackages = [...pkgCount.entries()]
    .map(([id, count]) => {
      const p = packages.find((x) => x.id === id)
      return {
        name: p?.shortName ?? id,
        bookings: count,
        revenue: count * (p?.price ?? 0),
      }
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6)

  const sourceMap = countBy(bookings.map((b) => b.source))
  const bookingSource = [...sourceMap.entries()].map(([label, value]) => ({ label, value }))

  const collectionMap = countBy(bookings.map((b) => b.collectionMethod))
  const collectionType = [...collectionMap.entries()].map(([label, value]) => ({ label, value }))

  return {
    metrics: { todaysBookings, pending, confirmed, completed, todaysRevenue, totalCustomers: 1248 },
    bookingTrend,
    revenueTrend,
    popularPackages,
    bookingSource,
    collectionType,
  }
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = React.useState<DiagnosticPackage[]>(() =>
    readJSON<DiagnosticPackage[]>(StorageKeys.packages, PACKAGES),
  )
  const [bookings, setBookings] = React.useState<Booking[]>(() =>
    readJSON<Booking[]>(StorageKeys.bookings, SEED_BOOKINGS),
  )
  const [session, setSession] = React.useState<SessionUser | null>(() =>
    readJSON<SessionUser | null>(StorageKeys.session, null),
  )
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (hydrated) writeJSON(StorageKeys.packages, packages)
  }, [packages, hydrated])
  React.useEffect(() => {
    if (hydrated) writeJSON(StorageKeys.bookings, bookings)
  }, [bookings, hydrated])
  React.useEffect(() => {
    if (!hydrated) return
    if (session) writeJSON(StorageKeys.session, session)
  }, [session, hydrated])

  const seqRef = React.useRef(
    Math.max(
      NEXT_BOOKING_SEQ,
      ...bookings.map((b) => Number(b.bookingNo.split('-')[2] ?? 0) + 1),
    ),
  )

  /* ------------------------------ packages ------------------------------ */
  const createPackage = React.useCallback<DemoActions['createPackage']>((input) => {
    const now = todayISO()
    const created: DiagnosticPackage = {
      ...input,
      id: makeId('pkg'),
      createdAt: now,
      updatedAt: now,
    }
    setPackages((list) => [created, ...list])
    return created
  }, [])

  const updatePackage = React.useCallback<DemoActions['updatePackage']>((id, patch) => {
    let updated: DiagnosticPackage | undefined
    setPackages((list) =>
      list.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, ...patch, updatedAt: todayISO() }
        return updated
      }),
    )
    return updated
  }, [])

  const deletePackage = React.useCallback<DemoActions['deletePackage']>((id) => {
    setPackages((list) => list.filter((p) => p.id !== id))
  }, [])

  const togglePackageStatus = React.useCallback<DemoActions['togglePackageStatus']>((id) => {
    setPackages((list) =>
      list.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'Active' ? 'Disabled' : 'Active', updatedAt: todayISO() }
          : p,
      ),
    )
  }, [])

  const togglePackageFeatured = React.useCallback<DemoActions['togglePackageFeatured']>((id) => {
    setPackages((list) =>
      list.map((p) => (p.id === id ? { ...p, featured: !p.featured, updatedAt: todayISO() } : p)),
    )
  }, [])

  /* ------------------------------ bookings ------------------------------ */
  const createBooking = React.useCallback<DemoActions['createBooking']>((input) => {
    const seq = seqRef.current++
    const now = new Date().toISOString()
    const booking: Booking = {
      ...input,
      id: makeId('bkg'),
      bookingNo: makeBookingNo(seq),
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'Pending',
          at: now,
          note: 'Booking placed on the website',
          by: 'Customer',
        },
      ],
    }
    setBookings((list) => [booking, ...list])
    return booking
  }, [])

  /**
   * Moves a booking to a new status. The timeline is append-only:
   *   - a real transition adds exactly one event;
   *   - re-selecting the current status is not a transition and changes nothing,
   *     so the original event keeps the timestamp it actually happened at;
   *   - a cancellation the lab reverses is recorded by marking the old event as
   *     superseded (`reversedAt`) rather than editing or dropping it.
   * History therefore never rewrites itself, and a cancellation can never sit
   * next to a status that contradicts it.
   */
  const updateBookingStatus = React.useCallback<DemoActions['updateBookingStatus']>(
    (id, status, note) => {
      let updated: Booking | undefined
      setBookings((list) =>
        list.map((b) => {
          if (b.id !== id) return b

          if (b.status === status) {
            updated = b
            return b
          }

          const at = new Date().toISOString()

          const timeline: TimelineEvent[] =
            b.status === 'Cancelled'
              ? b.timeline.map((e) =>
                  e.status === 'Cancelled' && !e.reversedAt ? { ...e, reversedAt: at } : e,
                )
              : b.timeline

          updated = {
            ...b,
            status,
            timeline: [
              ...timeline,
              {
                status,
                at,
                note: note ?? reversalNote(b.status, status) ?? defaultStatusNote(status),
                by: 'LabCare Staff' as const,
              },
            ],
            updatedAt: at,
            reportReadyAt: status === 'Report Ready' ? at : b.reportReadyAt,
          }
          return updated
        }),
      )
      return updated
    },
    [],
  )

  const cancelBooking = React.useCallback<DemoActions['cancelBooking']>(
    (id, reason) => updateBookingStatus(id, 'Cancelled', reason ?? 'Cancelled by customer request'),
    [updateBookingStatus],
  )

  const getBooking = React.useCallback((id: string) => bookings.find((b) => b.id === id), [bookings])

  /* -------------------------------- auth -------------------------------- */
  const loginAdmin = React.useCallback<DemoActions['loginAdmin']>(async (email, password) => {
    await wait(700)
    if (
      email.trim().toLowerCase() === DEMO_CREDENTIALS.admin.email &&
      password === DEMO_CREDENTIALS.admin.password
    ) {
      setSession(DEMO_ADMIN)
      writeJSON(StorageKeys.session, DEMO_ADMIN)
      return { ok: true, message: 'Signed in' }
    }
    return { ok: false, message: 'Invalid demo credentials. Use admin@labcare-demo.in / Demo@12345' }
  }, [])

  const loginCustomer = React.useCallback<DemoActions['loginCustomer']>(async (email, password) => {
    await wait(650)
    const user: SessionUser = {
      id: DEMO_CUSTOMER_LOGIN.id,
      name: DEMO_CUSTOMER_LOGIN.name,
      email: email.trim() || DEMO_CUSTOMER_LOGIN.email,
      role: 'customer',
      customerId: DEMO_CUSTOMER_LOGIN.id,
    }
    if (password.length < 6) {
      return { ok: false, message: 'Demo password must be at least 6 characters (try Demo@12345).' }
    }
    setSession(user)
    writeJSON(StorageKeys.session, user)
    return { ok: true, message: 'Signed in' }
  }, [])

  const logout = React.useCallback(() => {
    setSession(null)
    writeJSON(StorageKeys.session, null)
  }, [])

  const resetDemo = React.useCallback(() => {
    resetDemoStorage()
    setPackages(PACKAGES)
    setBookings(SEED_BOOKINGS)
    setSession(null)
    seqRef.current = NEXT_BOOKING_SEQ
  }, [])

  const stats = React.useMemo(() => computeStats(bookings, packages), [bookings, packages])

  const value = React.useMemo<DemoContextValue>(
    () => ({
      packages,
      bookings,
      customers: CUSTOMERS,
      session,
      hydrated,
      createPackage,
      updatePackage,
      deletePackage,
      togglePackageStatus,
      togglePackageFeatured,
      createBooking,
      updateBookingStatus,
      cancelBooking,
      getBooking,
      loginAdmin,
      loginCustomer,
      logout,
      resetDemo,
      stats,
    }),
    [
      packages,
      bookings,
      session,
      hydrated,
      createPackage,
      updatePackage,
      deletePackage,
      togglePackageStatus,
      togglePackageFeatured,
      createBooking,
      updateBookingStatus,
      cancelBooking,
      getBooking,
      loginAdmin,
      loginCustomer,
      logout,
      resetDemo,
      stats,
    ],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

/** Describes the one transition that reverses an earlier event. */
function reversalNote(from: BookingStatus, to: BookingStatus): string | undefined {
  if (from !== 'Cancelled') return undefined
  return `Cancellation reversed — booking reinstated as ${to}`
}

function defaultStatusNote(status: BookingStatus) {
  switch (status) {
    case 'Confirmed':
      return 'Booking confirmed by the lab'
    case 'Sample Collection Scheduled':
      return 'Technician assigned for sample collection'
    case 'Sample Collected':
      return 'Sample received at the laboratory'
    case 'Processing':
      return 'Sample under analysis'
    case 'Report Ready':
      return 'Digital report available for download'
    case 'Completed':
      return 'Report shared with the patient'
    case 'Cancelled':
      return 'Booking cancelled'
    default:
      return 'Status updated'
  }
}

export function useDemoStore() {
  const ctx = React.useContext(DemoContext)
  if (!ctx) throw new Error('useDemoStore must be used inside <DemoProvider>')
  return ctx
}

export function usePackages() {
  const { packages, createPackage, updatePackage, deletePackage, togglePackageStatus, togglePackageFeatured } =
    useDemoStore()
  return { packages, createPackage, updatePackage, deletePackage, togglePackageStatus, togglePackageFeatured }
}

export function useBookings() {
  const { bookings, createBooking, updateBookingStatus, cancelBooking, getBooking } = useDemoStore()
  return { bookings, createBooking, updateBookingStatus, cancelBooking, getBooking }
}

export function useAuth() {
  const { session, loginAdmin, loginCustomer, logout } = useDemoStore()
  return { session, loginAdmin, loginCustomer, logout }
}

export function useAdminStats() {
  return useDemoStore().stats
}
