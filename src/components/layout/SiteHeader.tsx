import * as React from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Logo } from '@/components/brand/Logo'
import { useAuth } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { cn } from '@/lib/utils'
import { LAB_INFO } from '@/data/lab'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Tests & Packages', to: '/packages' },
  { label: 'My Bookings', to: '/my-bookings' },
  { label: 'About Lab', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { info } = useToast()

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSignOut = () => {
    logout()
    info('Signed out', 'You have been signed out of the demo account.')
    navigate('/')
  }

  return (
    <>
      {/* Contact strip */}
      <div className="hidden bg-navy-900 text-white lg:block no-print">
        <div className="container-page flex h-9 items-center justify-between text-[12px]">
          <p className="flex items-center gap-2 text-white/75">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-300" aria-hidden />
            NABL-style quality workflow · Demo website for client presentation
          </p>
          <div className="flex items-center gap-5 text-white/80">
            <a href={`tel:${LAB_INFO.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {LAB_INFO.phone}
            </a>
            <span className="text-white/30">|</span>
            <span>{LAB_INFO.addressLine}</span>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-shadow no-print',
          scrolled ? 'border-navy-100 shadow-soft' : 'border-transparent',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="shrink-0" aria-label="LabCare Diagnostics home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-2.5 py-2 text-[13.5px] font-semibold transition-colors xl:px-3',
                    isActive ? 'bg-navy-50 text-navy-900' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {/* The admin shortcut appears from xl so the header never crowds at 1024px */}
            <Button variant="ghost" size="sm" asChild className="hidden xl:inline-flex">
              <Link to="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            </Button>

            {session?.role === 'admin' ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            ) : session ? (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/my-bookings">
                    <User className="h-4 w-4" />
                    {session.name.split(' ')[0]}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={handleSignOut} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}

            <Button size="sm" asChild>
              <Link to="/packages">
                <CalendarCheck className="h-4 w-4" />
                Book a Test
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy-200 text-navy-700 transition-colors hover:bg-navy-50 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer — modal Sheet: portal, backdrop, scroll lock, Escape, focus trap */}
      <Sheet open={open} onOpenChange={setOpen} modal>
        <SheetContent id="mobile-nav" side="right" label="Site menu" className="lg:hidden">
          <div className="flex items-center border-b border-navy-100 px-4 py-3.5 pr-14">
            <Logo />
          </div>

          <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-colors',
                    isActive ? 'bg-navy-50 text-navy-900' : 'text-navy-700 hover:bg-navy-50',
                  )
                }
              >
                {item.label}
                <ChevronRight className="h-4 w-4 text-navy-300" aria-hidden />
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className="mt-1 flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-semibold text-navy-700 transition-colors hover:bg-navy-50"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-teal-600" />
                Admin Panel
              </span>
              <ChevronRight className="h-4 w-4 text-navy-300" aria-hidden />
            </NavLink>
          </nav>

          <div className="space-y-2 border-t border-navy-100 p-4">
            {session ? (
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out {session.name.split(' ')[0]}
              </Button>
            ) : (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">
                  <User className="h-4 w-4" />
                  Login / Demo Account
                </Link>
              </Button>
            )}
            <Button className="w-full" asChild>
              <Link to="/packages">
                <CalendarCheck className="h-4 w-4" />
                Book a Test
              </Link>
            </Button>
            <a
              href={`tel:${LAB_INFO.phone.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2 pt-1 text-[13px] font-semibold text-navy-600"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {LAB_INFO.phone}
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
