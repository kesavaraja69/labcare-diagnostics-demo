import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { DemoRibbon } from '@/components/brand/DemoNotice'

/**
 * Customer-facing shell. `flush` pages (booking wizard, confirmation) render
 * without the standard top padding so they can use their own spacing.
 */
export function PublicLayout() {
  const { pathname } = useLocation()
  const flush = pathname.startsWith('/book') || pathname.includes('confirmation')

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <DemoRibbon />
      <SiteHeader />
      <main className={flush ? 'flex-1' : 'flex-1'}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
