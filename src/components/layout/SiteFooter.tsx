import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { DEMO_CONTACT_NOTE, LAB_INFO } from '@/data/lab'

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Tests & Packages', to: '/packages' },
      { label: 'Book a Test', to: '/packages' },
      { label: 'My Bookings', to: '/my-bookings' },
    ],
  },
  {
    title: 'Popular Packages',
    links: [
      { label: 'Comprehensive Full Body', to: '/packages/comprehensive-full-body-checkup' },
      { label: 'Diabetes Care Package', to: '/packages/diabetes-care-package' },
      { label: 'Thyroid Profile', to: '/packages/thyroid-profile' },
      { label: "Women's Wellness", to: '/packages/womens-wellness-package' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Lab', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Login / Demo Account', to: '/login' },
      { label: 'Admin Panel', to: '/admin' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-navy-100 bg-white no-print">
      <div className="container-page py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-teal-700">
              {LAB_INFO.tagline}
            </p>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-navy-500">
              {LAB_INFO.name} is a local diagnostic laboratory in {LAB_INFO.city}, {LAB_INFO.state}, offering online
              booking for diagnostic tests and preventive health packages with home sample collection and digital
              reports.
            </p>
            <ul className="mt-5 space-y-2.5 text-[13px] text-navy-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                <span>
                  {LAB_INFO.addressLine1}
                  <br />
                  {LAB_INFO.addressLine2}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                <a href={`tel:${LAB_INFO.phone.replace(/\s/g, '')}`} className="hover:text-navy-900">
                  {LAB_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                <a href={`mailto:${LAB_INFO.email}`} className="hover:text-navy-900">
                  {LAB_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                <span>
                  Mon–Sat 6:00 AM – 8:30 PM
                  <br />
                  Sunday 7:00 AM – 1:00 PM
                </span>
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-navy-900">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[13px] text-navy-500 transition-colors hover:text-teal-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <ShieldCheck className="h-5 w-5 text-teal-600" aria-hidden />
          <p className="text-[12px] leading-relaxed text-navy-500">{DEMO_CONTACT_NOTE}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-navy-100 pt-6 text-[12px] text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {LAB_INFO.name} (demo). All content is fictional sample data for client
            presentation.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Privacy (demo)</span>
            <span>Terms (demo)</span>
            <span>Refunds (demo)</span>
            <span className="text-navy-300">{LAB_INFO.licenseNote}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
