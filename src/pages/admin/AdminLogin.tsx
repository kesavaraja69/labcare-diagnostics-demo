import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarRange,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError, Label } from '@/components/ui/label'
import { Logo } from '@/components/brand/Logo'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { useAuth } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { DEMO_CREDENTIALS } from '@/services/api'

const CAPABILITIES = [
  { icon: LayoutDashboard, label: 'Live booking dashboard' },
  { icon: CalendarRange, label: 'Status workflow control' },
  { icon: Boxes, label: 'Package management' },
  { icon: Users, label: 'Customer history' },
  { icon: BarChart3, label: 'Operational reports' },
]

export default function AdminLoginPage() {
  const { loginAdmin, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error } = useToast()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPw, setShowPw] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [formError, setFormError] = React.useState('')

  const redirectTo = (location.state as { from?: string } | null)?.from

  React.useEffect(() => {
    if (session?.role === 'admin') navigate(redirectTo ?? '/admin/dashboard', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  React.useEffect(() => {
    document.title = 'Admin sign in | LabCare Diagnostics (demo)'
    return () => {
      document.title = 'LabCare Diagnostics | Online Test & Health Package Booking'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!email.trim() || !password) {
      setFormError('Enter both the demo admin email and password to continue.')
      error('Missing details', 'Both fields are required for the demo sign-in.')
      return
    }

    setBusy(true)
    const res = await loginAdmin(email, password)
    setBusy(false)

    if (!res.ok) {
      setFormError(res.message)
      error('Demo sign-in failed', res.message)
      return
    }

    success('Welcome back', 'Demo admin console unlocked.')
    navigate(redirectTo ?? '/admin/dashboard', { replace: true })
  }

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.admin.email)
    setPassword(DEMO_CREDENTIALS.admin.password)
    setFormError('')
  }

  return (
    <div className="min-h-dvh bg-navy-900 lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 grid-pattern opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-hero-sheen" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo variant="light" showTagline />

          <div>
            <h1 className="max-w-md text-3xl font-bold leading-tight text-white xl:text-4xl">
              LabCare Admin Console
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Manage bookings, move samples through the laboratory workflow, maintain the package catalogue and review
              operational performance — all from one place.
            </p>

            <ul className="mt-9 space-y-3.5">
              {CAPABILITIES.map((c) => (
                <li key={c.label} className="flex items-center gap-3 text-[14px] text-white/80">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                    <c.icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>

          <DemoNotice className="border-white/15 bg-white/[0.06] text-white/60">
            Demonstration console. All bookings, patients, packages and figures shown after sign-in are fictional sample
            data.
          </DemoNotice>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-dvh flex-col justify-center bg-navy-50/40 px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900 text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-[19px] font-bold tracking-tight">Admin sign in</h2>
                <p className="text-[12.5px] text-navy-500">Mock authentication for this demonstration</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-navy-100 bg-navy-50/70 p-4">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-navy-500">
                <KeyRound className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                Demo credentials
              </p>
              <div className="mt-2.5 space-y-1">
                <p className="font-mono text-[13px] font-semibold text-navy-900">{DEMO_CREDENTIALS.admin.email}</p>
                <p className="font-mono text-[13px] font-semibold text-navy-900">{DEMO_CREDENTIALS.admin.password}</p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-3 text-[12.5px] font-semibold text-teal-600 hover:underline"
              >
                Fill these credentials automatically
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5"
              >
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                <p className="text-[13px] font-medium leading-relaxed text-red-700">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <Label htmlFor="admin-login-email" required>
                  Email
                </Label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                    aria-hidden
                  />
                  <Input
                    id="admin-login-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    placeholder={DEMO_CREDENTIALS.admin.email}
                    className="pl-10"
                    invalid={Boolean(formError)}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="admin-login-pw" required>
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                    aria-hidden
                  />
                  <Input
                    id="admin-login-pw"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    placeholder={DEMO_CREDENTIALS.admin.password}
                    className="pl-10 pr-11"
                    invalid={Boolean(formError)}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError>{formError ? 'Check the demo credentials and try again' : undefined}</FieldError>
              </div>

              <Button type="submit" size="lg" variant="accent" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Verifying demo credentials…
                  </>
                ) : (
                  <>
                    Sign in to admin console
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-5">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-navy-500 hover:text-navy-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to customer website
              </Link>
              <Link to="/login" className="text-[12.5px] font-semibold text-teal-600 hover:underline">
                Patient login instead
              </Link>
            </div>
          </div>

          <DemoNotice className="mt-5">
            This is a mock sign-in. The password is checked in the browser only, no session token is issued, and no real
            account exists. Never enter genuine credentials.
          </DemoNotice>
        </div>
      </div>
    </div>
  )
}
