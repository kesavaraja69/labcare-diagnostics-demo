import type {
  Booking,
  BookingStatus,
  CollectionMethod,
  HomeCollectionAddress,
  PaymentMethod,
  TimelineEvent,
} from '@/types'
import { PACKAGES, discountPercent } from '@/data/packages'
import { CUSTOMERS } from '@/data/customers'
import { isoDaysFromToday } from '@/lib/date'
import { makeBookingNo } from '@/lib/utils'

/** DEMO DATA — 20 fictional bookings spread across every status. */

const pkg = (id: string) => {
  const found = PACKAGES.find((p) => p.id === id)
  if (!found) throw new Error(`Unknown demo package ${id}`)
  return found
}

const customer = (id: string) => {
  const found = CUSTOMERS.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown demo customer ${id}`)
  return found
}

const ADDRESSES: Record<string, HomeCollectionAddress> = {
  ravi: {
    line1: '12A, Kamarajar Nagar, 3rd Street',
    area: 'Krishnapuram',
    city: 'Rajapalayam',
    pincode: '626136',
    landmark: 'Opposite Sri Balaji Store',
  },
  priya: {
    line1: '4/88, Bazaar Street',
    area: 'Rajapalayam Bazaar',
    city: 'Rajapalayam',
    pincode: '626117',
    landmark: 'Near Old Bus Stand',
  },
  arjun: {
    line1: '27, Sundaram Street',
    area: 'Sundaram Street',
    city: 'Rajapalayam',
    pincode: '626117',
    landmark: 'Behind Corporation Bank',
  },
  meena: {
    line1: '9, Chinnamanoor Main Road',
    area: 'Chinnamanoor Road',
    city: 'Rajapalayam',
    pincode: '626117',
    landmark: 'Next to Annai Medicals',
  },
  karthik: {
    line1: '15B, Thiruvengadam Kovil Street',
    area: 'Thiruvengadam',
    city: 'Rajapalayam',
    pincode: '626136',
    landmark: 'Near Vinayagar Temple',
  },
  lakshmi: {
    line1: '3/45, Seithur Road',
    area: 'Seithur',
    city: 'Rajapalayam',
    pincode: '626201',
    landmark: 'Near Panchayat Office',
  },
  sundar: {
    line1: '22, Watrap Bypass Road',
    area: 'Watrap',
    city: 'Watrap',
    pincode: '626132',
    landmark: 'Opposite Bus Depot',
  },
  divya: {
    line1: '18, Srivilliputhur Main Road',
    area: 'Srivilliputhur',
    city: 'Srivilliputhur',
    pincode: '626125',
    landmark: 'Near Periyakulam Junction',
  },
  anitha: {
    line1: '41, Sundaram Street, 2nd Cross',
    area: 'Sundaram Street',
    city: 'Rajapalayam',
    pincode: '626117',
    landmark: 'Above Sri Ganesh Traders',
  },
  sowmya: {
    line1: '7/12, Chinnamanoor Road',
    area: 'Chinnamanoor Road',
    city: 'Rajapalayam',
    pincode: '626117',
    landmark: 'Beside Sweet Corner',
  },
}

interface SeedSpec {
  seq: number
  customerId: string | null
  patientName: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  mobile: string
  email: string
  packageId: string
  method: CollectionMethod
  addressKey?: keyof typeof ADDRESSES | null
  apptOffset: number
  slot: string
  status: BookingStatus
  paymentMethod: PaymentMethod
  paid: boolean
  createdOffset: number
  createdHour: number
  source: Booking['source']
  notes?: string
}

const SPECS: SeedSpec[] = [
  {
    seq: 108,
    customerId: 'cus-006',
    patientName: 'Lakshmi R',
    age: 42,
    gender: 'Female',
    mobile: '+91 97911 20094',
    email: 'lakshmi.r@example.com',
    packageId: 'pkg-full-body',
    method: 'Visit Lab',
    apptOffset: -22,
    slot: '7:00 AM – 8:00 AM',
    status: 'Completed',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: -24,
    createdHour: 19,
    source: 'Website',
  },
  {
    seq: 109,
    customerId: 'cus-003',
    patientName: 'Arjun Raj',
    age: 45,
    gender: 'Male',
    mobile: '+91 98654 77120',
    email: 'arjun.raj@example.com',
    packageId: 'pkg-diabetes-care',
    method: 'Home Sample Collection',
    addressKey: 'arjun',
    apptOffset: -20,
    slot: '6:00 AM – 7:00 AM',
    status: 'Completed',
    paymentMethod: 'Cash at Lab',
    paid: false,
    createdOffset: -21,
    createdHour: 21,
    source: 'Website',
  },
  {
    seq: 110,
    customerId: 'cus-011',
    patientName: 'Ganesh P',
    age: 52,
    gender: 'Male',
    mobile: '+91 99440 77823',
    email: 'ganesh.p@example.com',
    packageId: 'pkg-cardiac-risk',
    method: 'Visit Lab',
    apptOffset: -18,
    slot: '8:00 AM – 9:00 AM',
    status: 'Completed',
    paymentMethod: 'Net Banking',
    paid: true,
    createdOffset: -19,
    createdHour: 10,
    source: 'Phone',
  },
  {
    seq: 111,
    customerId: 'cus-009',
    patientName: 'Mohammed Irfan',
    age: 34,
    gender: 'Male',
    mobile: '+91 89031 55420',
    email: 'irfan.m@example.com',
    packageId: 'pkg-cbc',
    method: 'Visit Lab',
    apptOffset: -17,
    slot: '9:00 AM – 10:00 AM',
    status: 'Cancelled',
    paymentMethod: 'UPI',
    paid: false,
    createdOffset: -18,
    createdHour: 16,
    source: 'Website',
    notes: 'Customer cancelled — travelling. No refund applicable on this demo record.',
  },
  {
    seq: 112,
    customerId: 'cus-004',
    patientName: 'Meena Devi',
    age: 56,
    gender: 'Female',
    mobile: '+91 90257 38844',
    email: 'meena.devi@example.com',
    packageId: 'pkg-senior-citizen',
    method: 'Home Sample Collection',
    addressKey: 'meena',
    apptOffset: -14,
    slot: '7:00 AM – 8:00 AM',
    status: 'Completed',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: -16,
    createdHour: 20,
    source: 'Website',
  },
  {
    seq: 113,
    customerId: 'cus-001',
    patientName: 'Ravi Kumar',
    age: 38,
    gender: 'Male',
    mobile: '+91 90031 22110',
    email: 'ravi.kumar@example.com',
    packageId: 'pkg-liver-function',
    method: 'Visit Lab',
    apptOffset: -12,
    slot: '10:00 AM – 11:00 AM',
    status: 'Completed',
    paymentMethod: 'Credit / Debit Card',
    paid: true,
    createdOffset: -13,
    createdHour: 11,
    source: 'Website',
  },
  {
    seq: 114,
    customerId: 'cus-002',
    patientName: 'Priya S',
    age: 31,
    gender: 'Female',
    mobile: '+91 94421 45536',
    email: 'priya.s@example.com',
    packageId: 'pkg-womens-wellness',
    method: 'Home Sample Collection',
    addressKey: 'priya',
    apptOffset: -9,
    slot: '8:00 AM – 9:00 AM',
    status: 'Report Ready',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: -11,
    createdHour: 22,
    source: 'Website',
  },
  {
    seq: 115,
    customerId: 'cus-007',
    patientName: 'Sundar V',
    age: 61,
    gender: 'Male',
    mobile: '+91 95665 41182',
    email: 'sundar.v@example.com',
    packageId: 'pkg-senior-citizen',
    method: 'Home Sample Collection',
    addressKey: 'sundar',
    apptOffset: -6,
    slot: '6:00 AM – 7:00 AM',
    status: 'Report Ready',
    paymentMethod: 'Cash at Lab',
    paid: false,
    createdOffset: -7,
    createdHour: 18,
    source: 'Phone',
  },
  {
    seq: 116,
    customerId: null,
    patientName: 'Nithya S',
    age: 35,
    gender: 'Female',
    mobile: '+91 99942 11038',
    email: 'nithya.s@example.com',
    packageId: 'pkg-thyroid-profile',
    method: 'Visit Lab',
    apptOffset: -5,
    slot: '9:00 AM – 10:00 AM',
    status: 'Report Ready',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: -6,
    createdHour: 9,
    source: 'Website',
  },
  {
    seq: 117,
    customerId: 'cus-005',
    patientName: 'Karthik M',
    age: 29,
    gender: 'Male',
    mobile: '+91 98401 66235',
    email: 'karthik.m@example.com',
    packageId: 'pkg-vitamin-mineral',
    method: 'Home Sample Collection',
    addressKey: 'karthik',
    apptOffset: -3,
    slot: '7:00 AM – 8:00 AM',
    status: 'Processing',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: -4,
    createdHour: 20,
    source: 'Website',
  },
  {
    seq: 118,
    customerId: 'cus-010',
    patientName: 'Anitha K',
    age: 48,
    gender: 'Female',
    mobile: '+91 97882 30015',
    email: 'anitha.k@example.com',
    packageId: 'pkg-anaemia-profile',
    method: 'Home Sample Collection',
    addressKey: 'anitha',
    apptOffset: -2,
    slot: '8:00 AM – 9:00 AM',
    status: 'Processing',
    paymentMethod: 'Net Banking',
    paid: true,
    createdOffset: -3,
    createdHour: 13,
    source: 'Website',
  },
  {
    seq: 119,
    customerId: 'cus-003',
    patientName: 'Arjun Raj',
    age: 45,
    gender: 'Male',
    mobile: '+91 98654 77120',
    email: 'arjun.raj@example.com',
    packageId: 'pkg-mens-health',
    method: 'Visit Lab',
    apptOffset: -1,
    slot: '6:00 AM – 7:00 AM',
    status: 'Sample Collected',
    paymentMethod: 'Credit / Debit Card',
    paid: true,
    createdOffset: -2,
    createdHour: 21,
    source: 'Website',
  },
  {
    seq: 120,
    customerId: 'cus-002',
    patientName: 'Priya S',
    age: 31,
    gender: 'Female',
    mobile: '+91 94421 45536',
    email: 'priya.s@example.com',
    packageId: 'pkg-hba1c',
    method: 'Home Sample Collection',
    addressKey: 'priya',
    apptOffset: 0,
    slot: '9:00 AM – 10:00 AM',
    status: 'Sample Collection Scheduled',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: -1,
    createdHour: 8,
    source: 'Website',
  },
  {
    seq: 121,
    customerId: 'cus-012',
    patientName: 'Sowmya N',
    age: 37,
    gender: 'Female',
    mobile: '+91 90807 12346',
    email: 'sowmya.n@example.com',
    packageId: 'pkg-diabetes-care',
    method: 'Home Sample Collection',
    addressKey: 'sowmya',
    apptOffset: 0,
    slot: '7:00 AM – 8:00 AM',
    status: 'Confirmed',
    paymentMethod: 'Cash at Lab',
    paid: false,
    createdOffset: -1,
    createdHour: 6,
    source: 'Website',
  },
  {
    seq: 122,
    customerId: 'cus-008',
    patientName: 'Divya B',
    age: 26,
    gender: 'Female',
    mobile: '+91 93450 91277',
    email: 'divya.b@example.com',
    packageId: 'pkg-womens-wellness',
    method: 'Visit Lab',
    apptOffset: 0,
    slot: '10:00 AM – 11:00 AM',
    status: 'Confirmed',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: 0,
    createdHour: 7,
    source: 'Website',
    notes: 'Booked on behalf of a family member.',
  },
  {
    seq: 123,
    customerId: 'cus-001',
    patientName: 'Ravi Kumar',
    age: 38,
    gender: 'Male',
    mobile: '+91 90031 22110',
    email: 'ravi.kumar@example.com',
    packageId: 'pkg-full-body',
    method: 'Home Sample Collection',
    addressKey: 'ravi',
    apptOffset: 6,
    slot: '7:00 AM – 8:00 AM',
    status: 'Pending',
    paymentMethod: 'Cash at Lab',
    paid: false,
    createdOffset: 0,
    createdHour: 10,
    source: 'Website',
  },
  {
    seq: 124,
    customerId: 'cus-011',
    patientName: 'Ganesh P',
    age: 52,
    gender: 'Male',
    mobile: '+91 99440 77823',
    email: 'ganesh.p@example.com',
    packageId: 'pkg-pre-employment',
    method: 'Visit Lab',
    apptOffset: 3,
    slot: '8:00 AM – 9:00 AM',
    status: 'Pending',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: 0,
    createdHour: 11,
    source: 'Phone',
  },
  {
    seq: 125,
    customerId: 'cus-004',
    patientName: 'Meena Devi',
    age: 56,
    gender: 'Female',
    mobile: '+91 90257 38844',
    email: 'meena.devi@example.com',
    packageId: 'pkg-thyroid-advanced',
    method: 'Home Sample Collection',
    addressKey: 'meena',
    apptOffset: 4,
    slot: '6:00 AM – 7:00 AM',
    status: 'Confirmed',
    paymentMethod: 'Cash at Lab',
    paid: false,
    createdOffset: 0,
    createdHour: 12,
    source: 'Website',
  },
  {
    seq: 126,
    customerId: 'cus-006',
    patientName: 'Lakshmi R',
    age: 42,
    gender: 'Female',
    mobile: '+91 97911 20094',
    email: 'lakshmi.r@example.com',
    packageId: 'pkg-kidney-function',
    method: 'Visit Lab',
    apptOffset: 8,
    slot: '9:00 AM – 10:00 AM',
    status: 'Pending',
    paymentMethod: 'Cash at Lab',
    paid: false,
    createdOffset: 0,
    createdHour: 13,
    source: 'Website',
  },
  {
    seq: 127,
    customerId: 'cus-010',
    patientName: 'Anitha K',
    age: 48,
    gender: 'Female',
    mobile: '+91 97882 30015',
    email: 'anitha.k@example.com',
    packageId: 'pkg-womens-wellness',
    method: 'Home Sample Collection',
    addressKey: 'anitha',
    apptOffset: 2,
    slot: '7:00 AM – 8:00 AM',
    status: 'Confirmed',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: 0,
    createdHour: 14,
    source: 'Website',
  },
  {
    seq: 128,
    customerId: 'cus-005',
    patientName: 'Karthik M',
    age: 29,
    gender: 'Male',
    mobile: '+91 98401 66235',
    email: 'karthik.m@example.com',
    packageId: 'pkg-cbc',
    method: 'Visit Lab',
    apptOffset: -1,
    slot: '10:00 AM – 11:00 AM',
    status: 'Completed',
    paymentMethod: 'UPI',
    paid: true,
    createdOffset: -2,
    createdHour: 17,
    source: 'Walk-in',
  },
]

/** "2026-09-25" -> day offset relative to today (negative = past). */
const isoAt = (dayOffset: number, hour = 9, minute = 15) => {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const buildTimeline = (
  status: BookingStatus,
  createdAt: string,
  apptOffset: number,
  notes?: string,
): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    { status: 'Pending', at: createdAt, note: 'Booking placed on the website', by: 'Customer' },
  ]

  if (status === 'Cancelled') {
    events.push({
      status: 'Cancelled',
      at: isoAt(Math.min(apptOffset - 1, -1), 15, 30),
      note: notes ?? 'Cancelled on customer request',
      by: 'LabCare Staff',
    })
    return events
  }

  if (status === 'Pending') return events

  events.push({
    status: 'Confirmed',
    at: new Date(new Date(createdAt).getTime() + 45 * 60 * 1000).toISOString(),
    note: 'Booking confirmed by the lab',
    by: 'LabCare Staff',
  })

  const reached = (target: BookingStatus) => {
    const order: BookingStatus[] = [
      'Pending',
      'Confirmed',
      'Sample Collection Scheduled',
      'Sample Collected',
      'Processing',
      'Report Ready',
      'Completed',
    ]
    return order.indexOf(status) >= order.indexOf(target)
  }

  if (reached('Sample Collection Scheduled')) {
    events.push({
      status: 'Sample Collection Scheduled',
      at: isoAt(apptOffset - 1, 20, 10),
      note: 'Technician assigned for sample collection',
      by: 'LabCare Staff',
    })
  }
  if (reached('Sample Collected')) {
    events.push({
      status: 'Sample Collected',
      at: isoAt(apptOffset, 8, 35),
      note: 'Sample received at the laboratory',
      by: 'LabCare Staff',
    })
  }
  if (reached('Processing')) {
    events.push({
      status: 'Processing',
      at: isoAt(apptOffset, 11, 5),
      note: 'Sample under analysis',
      by: 'LabCare Staff',
    })
  }
  if (reached('Report Ready')) {
    events.push({
      status: 'Report Ready',
      at: isoAt(apptOffset + 1, 17, 40),
      note: 'Digital report available for download',
      by: 'System',
    })
  }
  if (status === 'Completed') {
    events.push({
      status: 'Completed',
      at: isoAt(apptOffset + 2, 10, 0),
      note: 'Report shared with the patient',
      by: 'System',
    })
  }
  return events
}

export const SEED_BOOKINGS: Booking[] = SPECS.map((spec) => {
  const p = pkg(spec.packageId)
  const cust = spec.customerId ? customer(spec.customerId) : null
  const discount = p.mrp - p.price
  const fee = spec.method === 'Home Sample Collection' ? p.homeCollectionFee : 0
  const appointmentDate = isoDaysFromToday(spec.apptOffset)
  const createdAt = isoAt(spec.createdOffset, spec.createdHour, 18)
  const timeline = buildTimeline(spec.status, createdAt, spec.apptOffset, spec.notes)
  const reportEvent = timeline.find((e) => e.status === 'Report Ready')

  return {
    id: `bkg-${spec.seq}`,
    bookingNo: makeBookingNo(spec.seq),
    packageId: p.id,
    packageName: p.name,
    packageCategory: p.category,
    patient: {
      id: `pat-${spec.seq}`,
      fullName: spec.patientName,
      age: spec.age,
      gender: spec.gender,
      mobile: spec.mobile,
      email: spec.email,
    },
    customerId: cust?.id ?? null,
    collectionMethod: spec.method,
    address:
      spec.method === 'Home Sample Collection' && spec.addressKey ? ADDRESSES[spec.addressKey] : null,
    appointmentDate,
    timeSlot: spec.slot,
    testsCount: p.includedTests.length,
    reportAvailability: p.reportAvailability,
    pricing: {
      mrp: p.mrp,
      packagePrice: p.price,
      discount,
      homeCollectionFee: fee,
      total: p.price + fee,
    },
    payment: {
      method: spec.paymentMethod,
      state: spec.paid ? 'Paid' : 'Pay at Lab',
      reference: spec.paid
        ? `DEMO-${spec.paymentMethod.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-${100000 + spec.seq * 37}`
        : null,
      paidAt: spec.paid ? createdAt : null,
      amountPaid: spec.paid ? p.price + fee : 0,
    },
    status: spec.status,
    timeline,
    createdAt,
    updatedAt: timeline[timeline.length - 1]?.at ?? createdAt,
    source: spec.source,
    isDemo: true,
    reportReadyAt: reportEvent?.at ?? null,
    notes: spec.notes,
  }
})

/** Sequence number that new demo bookings continue from. */
export const NEXT_BOOKING_SEQ = 129

export { discountPercent }
export const ADDRESS_BOOK = ADDRESSES
