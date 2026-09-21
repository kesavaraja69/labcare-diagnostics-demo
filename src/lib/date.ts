/** Date helpers — all demo dates are derived from "today" so the demo always looks current. */

const pad = (n: number) => String(n).padStart(2, '0')

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayISO = () => toISODate(new Date())

export const addDays = (days: number, from: Date = new Date()) => {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d
}

export const isoDaysFromToday = (days: number) => toISODate(addDays(days))

export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** "25 September 2026" */
export const formatLongDate = (iso: string) => {
  if (!iso) return '—'
  return parseISODate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "25 Sep 2026" */
export const formatShortDate = (iso: string) => {
  if (!iso) return '—'
  return parseISODate(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "Fri, 25 Sep" */
export const formatDayMonth = (iso: string) => {
  if (!iso) return '—'
  return parseISODate(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** "25 Sep 2026, 7:42 PM" */
export const formatDateTime = (isoDateTime: string) => {
  if (!isoDateTime) return '—'
  const d = new Date(isoDateTime)
  if (Number.isNaN(d.getTime())) return isoDateTime
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** "7:42 PM" */
export const formatTime = (isoDateTime: string) => {
  const d = new Date(isoDateTime)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export const relativeLabel = (iso: string) => {
  const diff = Math.round(
    (parseISODate(iso).getTime() - parseISODate(todayISO()).getTime()) / 86_400_000,
  )
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1) return `In ${diff} days`
  return `${Math.abs(diff)} days ago`
}

export const monthLabel = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' })

export const isPast = (iso: string) => parseISODate(iso).getTime() < parseISODate(todayISO()).getTime()

export const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
