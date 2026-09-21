import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** ₹1,999 — Indian grouping, no decimals (demo prices are whole rupees). */
export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

/** 1999 -> "₹1,999", 18450 -> "₹18,450" */
export const formatCompactINR = (value: number) => formatINR(value)

export const inr = (value: number) => `₹${new Intl.NumberFormat('en-IN').format(value)}`

export const pluralise = (count: number, singular: string, plural?: string) =>
  `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`

/** Stable, human-readable id: LAB-2026-000125 */
export const makeBookingNo = (sequence: number, year = new Date().getFullYear()) =>
  `LAB-${year}-${String(sequence).padStart(6, '0')}`

export const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 250) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const downloadFile = (filename: string, content: string, mime = 'text/html;charset=utf-8') => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
