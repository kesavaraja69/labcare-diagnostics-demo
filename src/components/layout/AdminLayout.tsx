import * as React from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  CalendarRange,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Users,
  X,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth, useDemoStore } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { StorageKeys, readJSON, writeJSON } from '@/store/storage'
import { DEMO_CREDENTIALS } from '@/services/api'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
  { to: '/admin/packages', label: 'Packages', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export function AdminLayout() {
  const { session, logout } = useAuth()
  const { resetDemo, stats } = useDemoStore()
  const { success, info } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  /** Desktop sidebar visibility. A presentation preference, so it is persisted. */
  const [navHidden, setNavHidden] = React.useState(() =>
    readJSON<boolean>(StorageKeys.adminNavHidden, false),
  )

  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  React.useEffect(() => {
    writeJSON(StorageKeys.adminNavHidden, navHidden)
  }, [navHidden])

  if (!session || session.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  const handleSignOut = () => {
    logout()
    info('Signed out of admin', 'Demo session ended.')
    navigate('/admin/login')
  }

  const handleReset = () => {
    resetDemo()
    success('Demo data reset', 'Packages, bookings and the customer timeline are back to the seeded story.')
    navigate('/admin/dashboard')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/admin/dashboard" aria-label="LabCare admin dashboard">
          <Logo variant="light" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden"
          aria-label="Close admin menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Demo admin</p>
        <p className="mt-1 truncate text-[12.5px] font-semibold text-white">{session.name}</p>
        <p className="mt-0.5 truncate text-[11px] leading-snug text-white/50">{session.email}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors',
                isActive ? 'bg-white text-navy-900 shadow-soft' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <link.icon className="h-4.5 w-4.5" aria-hidden />
            {link.label}
            {link.to === '/admin/bookings' && stats.metrics.pending > 0 && (
              <Badge variant="warning" size="sm" className="ml-auto">
                {stats.metrics.pending}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white" asChild>
          <Link to="/">
            <ExternalLink className="h-4 w-4" />
            View customer website
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white">
              <RefreshCw className="h-4 w-4" />
              Reset demo data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset the demonstration?</AlertDialogTitle>
              <AlertDialogDescription>
                This restores all seeded packages, bookings and statuses, and clears any bookings you created while
                demonstrating. Your admin session will be signed out.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep my changes</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} variant="destructive">
                Reset demo data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="ghost" size="sm" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh overflow-x-hidden bg-navy-50/40">
      <div className="flex">
        {/* Desktop sidebar — hideable from the header toggle. The mobile drawer
            below is independent, so small screens keep their hamburger menu. */}
        {!navHidden && (
          <aside
            id="admin-sidebar"
            className="sticky top-0 hidden h-dvh w-[268px] shrink-0 bg-navy-900 lg:block no-print"
          >
            {sidebar}
          </aside>
        )}

        {/* Mobile drawer — modal Sheet so it gets a portal, scroll lock, Escape and focus trap */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen} modal>
          <SheetContent side="left" label="Admin navigation" hideClose className="bg-navy-900 lg:hidden">
            {sidebar}
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-3 border-b border-navy-100 bg-white/90 px-4 backdrop-blur-md sm:px-6 no-print">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy-200 text-navy-700 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop sidebar toggle — always in the header on lg+, so the menu
                can be brought back when it is hidden. */}
            <button
              type="button"
              onClick={() => setNavHidden((hidden) => !hidden)}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-navy-200 text-navy-700 transition-colors hover:bg-navy-50 lg:inline-flex"
              aria-label={navHidden ? 'Show sidebar' : 'Hide sidebar'}
              aria-expanded={!navHidden}
              aria-controls="admin-sidebar"
              title={navHidden ? 'Show sidebar' : 'Hide sidebar'}
            >
              {navHidden ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-navy-900">LabCare Admin Console</p>
              <p className="hidden truncate text-[11.5px] text-navy-400 sm:block">
                Demo credentials: {DEMO_CREDENTIALS.admin.email} / {DEMO_CREDENTIALS.admin.password}
              </p>
            </div>

            <Badge variant="accent" size="lg" className="hidden sm:inline-flex">
              Demo mode
            </Badge>
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/">Customer site</Link>
            </Button>
          </header>

          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
