import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Compass, FlaskConical, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
          <Compass className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-6 label-caps text-teal-600">404 — Page not found</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          This page isn’t part of the demo
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-navy-500">
          We couldn’t find <span className="font-mono text-[13px] text-navy-700">{pathname}</span> in the LabCare
          Diagnostics demonstration. Use one of the links below to continue the demo walkthrough.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button variant="accent" asChild>
            <Link to="/packages">
              <Search className="h-4 w-4" />
              Browse tests &amp; packages
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/my-bookings">
              <FlaskConical className="h-4 w-4" />
              My bookings
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
          {[
            { label: 'Home', to: '/' },
            { label: 'Booking flow', to: '/packages' },
            { label: 'Admin panel', to: '/admin/login' },
          ].map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-[13px] font-semibold text-navy-700 shadow-soft transition-colors hover:border-teal-200 hover:text-teal-700"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
