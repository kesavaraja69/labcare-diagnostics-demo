import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BadgeCheck,
  Beaker,
  BriefcaseMedical,
  CalendarCheck,
  CalendarClock,
  Droplets,
  FileCheck2,
  FileText,
  Flower2,
  Gauge,
  HeartPulse,
  Home,
  Layers,
  MousePointerClick,
  Search,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  Syringe,
  Target,
  TestTubes,
  Waves,
} from 'lucide-react'

/**
 * Explicit icon registry.
 * Packages reference icons by name (stored with the package record), so we map
 * the supported names here rather than importing the whole icon library — this
 * keeps the production bundle small while still letting the admin panel change
 * a demo package icon without a code change.
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  Activity,
  BadgeCheck,
  Beaker,
  BriefcaseMedical,
  CalendarCheck,
  CalendarClock,
  Droplets,
  FileCheck2,
  FileText,
  Flower2,
  Gauge,
  HeartPulse,
  Home,
  Layers,
  MousePointerClick,
  Search,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  Syringe,
  Target,
  TestTubes,
  Waves,
}

export const ICON_NAMES = Object.keys(ICON_REGISTRY)

/** Renders a registered icon by name, falling back to a neutral default. */
export function DynamicIcon({
  name,
  className,
  strokeWidth = 1.9,
}: {
  name: string
  className?: string
  strokeWidth?: number
}) {
  const Icon = ICON_REGISTRY[name] ?? Activity
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />
}
