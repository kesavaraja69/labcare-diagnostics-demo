import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FieldError, Label } from '@/components/ui/label'
import { Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc'
import { Logo } from '@/components/brand/Logo'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { useAuth, useDemoStore } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { DEMO_CREDENTIALS } from '@/services/api'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { loginAdmin, loginCustomer } = useAuth()
  const { bookings } = useDemoStore()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = React.useState<'customer' | 'admin'>('customer')
  const [customer, setCustomer] = React.useState({ email: '', password: '' })
  const [admin, setAdmin] = React.useState({ email: '', password: '' })
  const [showCustomerPw, setShowCustomerPw] = React.useState(false)
  const [showAdminPw, setShowAdminPw] = React.useState(false)
  const [busy, setBusy] = React.useState<'customer' | 'admin' | null>(null)
  const [formError, setFormError] = React.useState('')

  const redirectTo = (location.state as { from?: string } | null)?.from

  const fillCustomerDemo = () => {
    setCustomer({ email: DEMO_CREDENTIALS.customer.email, password: DEMO_CREDENTIALS.customer.password })
    setFormError('')
  }

  const fillAdminDemo = () => {
    setAdmin({ email: DEMO_CREDENTIALS.admin.email, password: DEMO_CREDENTIALS.admin.password })
    setFormError('')
  }

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!customer.email.trim() || !customer.password) {
      setFormError('Enter your email and password — or use the demo credentials shown alongside.')
      return
    }
    setBusy('customer')
    const res = await loginCustomer(customer.email, customer.password)
    setBusy(null)
    if (!res.ok) {
      setFormError(res.message)
      error('Demo sign-in failed', res.message)
      return
    }
    success('Signed in', 'You are signed in to the demo patient account.')
    navigate(redirectTo ?? '/my-bookings')
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setBusy('admin')
    const res = await loginAdmin(admin.email, admin.password)
    setBusy(null)
    if (!res.ok) {
      setFormError(res.message)
      error('Demo sign-in failed', res.message)
      return
    }
    success('Signed in as admin', 'Demo admin console unlocked.')
    navigate(redirectTo ?? '/admin/dashboard')
  }

  return (
    <div className="bg-background">
      <div className="container-page py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* ------------------------------- Left: brand panel */}
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-3xl bg-navy-900 p-7 sm:p-9">
              <div className="absolute inset-0 grid-pattern opacity-60" aria-hidden />
              <div className="absolute inset-0 bg-hero-sheen" aria-hidden />

              <div className="relative">
                <Logo variant="light" />
                <h1 className="mt-7 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Your demo account for {`LabCare Diagnostics`}
                </h1>
                <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/70">
                  Sign in to see how patients and laboratory staff would use the platform. Two roles are available in this
                  demonstration — a patient account and an administrator console.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: User,
                      title: 'Patient account',
                      points: ['Track bookings live', 'Download demo reports', 'Repeat a booking quickly'],
                    },
                    {
                      icon: LayoutDashboard,
                      title: 'Admin console',
                      points: ['Manage bookings', 'Edit packages', 'View reports & analytics'],
                    },
                  ].map((role) => (
                    <div key={role.title} className="rounded-2xl border border-white/15 bg-white/[0.07] p-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                        <role.icon className="h-4.5 w-4.5" aria-hidden />
                      </span>
                      <p className="mt-3 text-[14px] font-semibold text-white">{role.title}</p>
                      <ul className="mt-2 space-y-1.5">
                        {role.points.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-[12.5px] leading-snug text-white/65">
                            <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" aria-hidden />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.07] p-4">
                  <p className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-teal-300">
                    <KeyRound className="h-3.5 w-3.5" aria-hidden />
                    Demo credentials
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {[
                      { role: 'Administrator', email: DEMO_CREDENTIALS.admin.email, password: DEMO_CREDENTIALS.admin.password },
                      { role: 'Patient', email: DEMO_CREDENTIALS.customer.email, password: DEMO_CREDENTIALS.customer.password },
                    ].map((c) => (
                      <div
                        key={c.role}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-navy-950/40 px-3.5 py-2.5"
                      >
                        <span className="text-[11.5px] font-semibold uppercase tracking-wider text-white/50">
                          {c.role}
                        </span>
                        <span className="font-mono text-[12.5px] text-white/90">
                          {c.email} · {c.password}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-white/50">
                    These are mock credentials created for this demonstration. Password checks happen in the browser only —
                    there is no real authentication service.
                  </p>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: CalendarDays, label: `${bookings.length} demo bookings` },
                    { icon: FileText, label: 'Digital demo reports' },
                    { icon: ShieldCheck, label: 'No real data used' },
                  ].map((item) => (
                    <p key={item.label} className="flex items-center gap-2 text-[12px] font-medium text-white/65">
                      <item.icon className="h-4 w-4 shrink-0 text-teal-300" aria-hidden />
                      {item.label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------- Right: forms */}
          <div className="order-1 lg:order-2">
            <div className="card-surface p-5 sm:p-7">
              <h2 className="text-[19px] font-bold tracking-tight">Sign in to the demo</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-navy-500">
                Choose a role below. Nothing you type leaves your browser, and no account is really created.
              </p>

              <Tabs value={tab} onValueChange={(v) => { setTab(v as 'customer' | 'admin'); setFormError('') }} className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="customer">
                    <User className="h-4 w-4" />
                    Patient login
                  </TabsTrigger>
                  <TabsTrigger value="admin">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin login
                  </TabsTrigger>
                </TabsList>

                {formError && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5"
                  >
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                    <p className="text-[13px] font-medium leading-relaxed text-red-700">{formError}</p>
                  </div>
                )}

                {/* Patient */}
                <TabsContent value="customer" className="mt-5 focus-visible:outline-none">
                  <form onSubmit={handleCustomerLogin} className="space-y-4" noValidate>
                    <div>
                      <Label htmlFor="cust-email" required>
                        Email address
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                          aria-hidden
                        />
                        <Input
                          id="cust-email"
                          type="email"
                          autoComplete="email"
                          value={customer.email}
                          placeholder="ravi.kumar@example.com"
                          className="pl-10"
                          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cust-pw" required>
                        Password
                      </Label>
                      <div className="relative mt-1.5">
                        <LockKeyhole
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                          aria-hidden
                        />
                        <Input
                          id="cust-pw"
                          type={showCustomerPw ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={customer.password}
                          placeholder="Demo@12345"
                          className="pl-10 pr-11"
                          onChange={(e) => setCustomer({ ...customer, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustomerPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                          aria-label={showCustomerPw ? 'Hide password' : 'Show password'}
                        >
                          {showCustomerPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-navy-500">
                        <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-teal-500" />
                        Keep me signed in on this device
                      </label>
                      <button
                        type="button"
                        onClick={fillCustomerDemo}
                        className="text-[12.5px] font-semibold text-teal-600 hover:underline"
                      >
                        Fill demo credentials
                      </button>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={busy === 'customer'}>
                      {busy === 'customer' ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign in as patient
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-[12.5px] text-navy-500">
                      New to LabCare?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          fillCustomerDemo()
                          setFormError('')
                        }}
                        className="font-semibold text-teal-600 hover:underline"
                      >
                        Use the demo account
                      </button>{' '}
                      — registration is intentionally disabled in this demo.
                    </p>
                  </form>
                </TabsContent>

                {/* Admin */}
                <TabsContent value="admin" className="mt-5 focus-visible:outline-none">
                  <div className="rounded-xl border border-navy-100 bg-navy-50/60 p-3.5">
                    <p className="flex items-center gap-2 text-[12.5px] font-semibold text-navy-800">
                      <Sparkles className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                      Admin console credentials
                    </p>
                    <p className="mt-1.5 font-mono text-[12.5px] text-navy-600">
                      {DEMO_CREDENTIALS.admin.email} / {DEMO_CREDENTIALS.admin.password}
                    </p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="mt-5 space-y-4" noValidate>
                    <div>
                      <Label htmlFor="admin-email" required>
                        Admin email
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                          aria-hidden
                        />
                        <Input
                          id="admin-email"
                          type="email"
                          autoComplete="email"
                          value={admin.email}
                          placeholder="admin@labcare-demo.in"
                          className="pl-10"
                          onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="admin-pw" required>
                        Password
                      </Label>
                      <div className="relative mt-1.5">
                        <LockKeyhole
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                          aria-hidden
                        />
                        <Input
                          id="admin-pw"
                          type={showAdminPw ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={admin.password}
                          placeholder="Demo@12345"
                          className="pl-10 pr-11"
                          onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                          aria-label={showAdminPw ? 'Hide password' : 'Show password'}
                        >
                          {showAdminPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={fillAdminDemo}
                      className="text-[12.5px] font-semibold text-teal-600 hover:underline"
                    >
                      Fill demo credentials
                    </button>

                    <Button type="submit" size="lg" variant="accent" className="w-full" disabled={busy === 'admin'}>
                      {busy === 'admin' ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        <>
                          Enter admin console
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="mt-4 text-[12.5px] leading-relaxed text-navy-500">
                    The admin console lets you change booking statuses, edit packages and see how the customer timeline
                    updates instantly.
                  </p>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12.5px] text-navy-500">Prefer to browse first?</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/packages">Browse packages</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/my-bookings">View demo bookings</Link>
                  </Button>
                </div>
              </div>
            </div>

            <DemoNotice className="mt-5">
              Demo authentication only. Credentials above are fake, stored in this browser, and grant access to fictional
              sample data — never enter real passwords or patient information.
            </DemoNotice>

            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-navy-100 bg-white p-3.5">
              <Badge variant="accent" size="sm">
                Note
              </Badge>
              <p className={cn('text-[12.5px] leading-relaxed text-navy-500')}>
                Final production would use a real identity provider (JWT / Firebase Auth) with role-based access control
                for patients, technicians and administrators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
