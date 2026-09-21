import type { HomeCollectionAddress, PatientDraft } from '@/types'

export type Errors<T> = Partial<Record<keyof T, string>>

const NAME_RE = /^[A-Za-z][A-Za-z .'-]{2,59}$/
const MOBILE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

const strip = (v: string) => v.replace(/[\s-]/g, '')

export function validatePatient(p: PatientDraft): Errors<PatientDraft> {
  const e: Errors<PatientDraft> = {}

  if (!p.fullName.trim()) e.fullName = 'Patient name is required'
  else if (p.fullName.trim().length < 3) e.fullName = 'Enter at least 3 characters'
  else if (!NAME_RE.test(p.fullName.trim()))
    e.fullName = 'Use letters, spaces, apostrophes or hyphens only'

  if (!p.age) e.age = 'Age is required'
  else if (Number.isNaN(Number(p.age))) e.age = 'Age must be a number'
  else if (Number(p.age) < 1) e.age = 'Age must be at least 1'
  else if (Number(p.age) > 120) e.age = 'Age must be 120 or below'

  if (!p.gender) e.gender = 'Please select a gender'

  if (!p.mobile.trim()) e.mobile = 'Mobile number is required'
  else if (!MOBILE_RE.test(strip(p.mobile)))
    e.mobile = 'Enter a valid 10-digit Indian mobile number'

  if (!p.email.trim()) e.email = 'Email is required'
  else if (!EMAIL_RE.test(p.email.trim())) e.email = 'Enter a valid email address'

  return e
}

export function validateAddress(a: HomeCollectionAddress | null): Errors<HomeCollectionAddress> {
  const e: Errors<HomeCollectionAddress> = {}
  if (!a) {
    return { line1: 'Address is required for home collection' }
  }
  if (!a.line1.trim()) e.line1 = 'House / flat number and street are required'
  else if (a.line1.trim().length < 6) e.line1 = 'Please add a little more detail'

  if (!a.area.trim()) e.area = 'Area is required'

  if (!a.city.trim()) e.city = 'City is required'

  if (!a.pincode.trim()) e.pincode = 'Pincode is required'
  else if (!/^\d{6}$/.test(a.pincode.trim())) e.pincode = 'Pincode must be 6 digits'

  return e
}

export const hasErrors = (e: Record<string, string | undefined>) => Object.values(e).some(Boolean)

/** Digits-only mask helper for the demo mobile input. */
export const sanitiseMobile = (value: string) => value.replace(/[^\d+\s-]/g, '').slice(0, 16)

export const sanitisePincode = (value: string) => value.replace(/\D/g, '').slice(0, 6)

export const sanitiseAge = (value: string) => value.replace(/\D/g, '').slice(0, 3)
