import * as React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageLoader } from '@/components/common/Loaders'
import { useDemoStore } from '@/store/DemoStore'

/* Customer-facing routes are eager so the booking journey always feels instant. */
import HomePage from '@/pages/Home'
import PackagesPage from '@/pages/Packages'
import BookingWizardPage from '@/pages/booking/BookingWizard'
import MyBookingsPage from '@/pages/MyBookings'
import LoginPage from '@/pages/Login'
import NotFoundPage from '@/pages/NotFound'

/* Heavier routes are code-split to keep the initial download small. */
const PackageDetailsPage = React.lazy(() => import('@/pages/PackageDetails'))
const BookingConfirmationPage = React.lazy(() => import('@/pages/booking/BookingConfirmation'))
const BookingDetailPage = React.lazy(() => import('@/pages/BookingDetail'))
const AboutPage = React.lazy(() => import('@/pages/About'))
const ContactPage = React.lazy(() => import('@/pages/Contact'))

const AdminLoginPage = React.lazy(() => import('@/pages/admin/AdminLogin'))
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminBookingsPage = React.lazy(() => import('@/pages/admin/AdminBookings'))
const AdminPackagesPage = React.lazy(() => import('@/pages/admin/AdminPackages'))
const AdminCustomersPage = React.lazy(() => import('@/pages/admin/AdminCustomers'))
const AdminReportsPage = React.lazy(() => import('@/pages/admin/AdminReports'))

/** Suspense fallback shown while a code-split route downloads. */
function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <PageLoader label="Preparing this page…" />
    </div>
  )
}

/** Resets scroll position on every navigation (except when returning to a hash). */
function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

/** Route-level suspense so skeleton/loading states are demonstrable on first paint. */
function HydrationGate({ children }: { children: React.ReactNode }) {
  const { hydrated } = useDemoStore()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (hydrated) {
      const t = setTimeout(() => setReady(true), 260)
      return () => clearTimeout(t)
    }
  }, [hydrated])

  if (!ready) return <PageLoader />
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <HydrationGate>
        <React.Suspense fallback={<RouteFallback />}>
          <Routes>
          {/* ------------------------------- Customer site ------------------------------ */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/packages/:slug" element={<PackageDetailsPage />} />
            <Route path="/book/:slug" element={<BookingWizardPage />} />
            <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* --------------------------------- Admin ---------------------------------- */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="packages" element={<AdminPackagesPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
          </Routes>
        </React.Suspense>
      </HydrationGate>
    </>
  )
}
