import type { FaqItem, Testimonial } from '@/types'

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Anitha K',
    area: 'Rajapalayam',
    quote:
      'Booked the full body package online at night and the technician came home the next morning. The report was on my phone within a day.',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Sundar V',
    area: 'Watrap',
    quote:
      'Very calm, clean lab. The staff explained what each test in the package was for. Booking the slot online saved a lot of waiting.',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Priya S',
    area: 'Rajapalayam Bazaar',
    quote:
      'I liked that I could see the offer price and the number of tests before booking. No hidden charges at the counter.',
    rating: 4,
  },
]

export const FAQS: FaqItem[] = [
  {
    id: 'f1',
    question: 'Do I need to fast before my test?',
    answer:
      'Some panels include tests that are usually done after a fasting window, while others need no fasting at all. Each package page shows a preparation note, and the lab shares detailed instructions after your booking is confirmed. Always follow the instructions given by the laboratory or your doctor.',
  },
  {
    id: 'f2',
    question: 'Is home sample collection available?',
    answer:
      'Yes. Home sample collection is available across Rajapalayam and nearby areas for most packages. Choose “Home Sample Collection” during booking, pick a convenient time slot, and a trained technician will visit. A small collection fee may apply and is always shown in your booking summary before payment.',
  },
  {
    id: 'f3',
    question: 'How soon will I receive my reports?',
    answer:
      'Most routine packages are reported within 24 to 48 hours. Your booking page in “My Bookings” shows the live status, and a digital report becomes available as soon as processing is complete.',
  },
  {
    id: 'f4',
    question: 'Can I reschedule or cancel my booking?',
    answer:
      'Yes. Online bookings can be rescheduled or cancelled before the sample is collected. Call the lab on the number listed on the Contact page and quote your booking ID, and our team will help you.',
  },
  {
    id: 'f5',
    question: 'Is payment online safe, and can I pay at the lab?',
    answer:
      'You can pay online by UPI, card or net banking, or simply select “Cash at Lab” and settle the amount when you visit. On this demonstration website, online payments are simulated — no real money is collected and no card details are stored.',
  },
  {
    id: 'f6',
    question: 'Can family members book together?',
    answer:
      'Absolutely. You can book one package per booking and add another booking for a family member in a couple of taps. For large family or corporate bookings, contact the lab and the team will arrange a combined collection visit.',
  },
]

export const WHY_CHOOSE: { title: string; description: string; icon: string }[] = [
  {
    title: 'Convenient online booking',
    description: 'Pick a package, choose a slot and confirm in under three minutes.',
    icon: 'MousePointerClick',
  },
  {
    title: 'Multiple test packages',
    description: 'Fifteen demo packages across full body, diabetes, thyroid, women’s, men’s and senior care.',
    icon: 'Layers',
  },
  {
    title: 'Home collection option',
    description: 'Trained phlebotomists visit your address in a slot you select.',
    icon: 'Home',
  },
  {
    title: 'Easy appointment scheduling',
    description: 'Early-morning slots from 6:00 AM, with live availability for each slot.',
    icon: 'CalendarClock',
  },
  {
    title: 'Digital report access',
    description: 'Track each stage of your sample and download reports from your dashboard.',
    icon: 'FileText',
  },
  {
    title: 'Qualified lab professionals',
    description: 'Experienced technicians and a quality-controlled in-house processing workflow.',
    icon: 'BadgeCheck',
  },
]

export const TRUST_STRIP: { title: string; description: string; icon: string }[] = [
  { title: 'Accurate Testing', description: 'Quality-controlled demo workflow', icon: 'Target' },
  { title: 'Qualified Lab Professionals', description: 'Trained technicians & analysts', icon: 'BadgeCheck' },
  { title: 'Convenient Booking', description: 'Book online in minutes', icon: 'CalendarCheck' },
  { title: 'Home Sample Collection', description: 'Across Rajapalayam area', icon: 'Home' },
  { title: 'Digital Reports', description: 'Access and download online', icon: 'FileText' },
]

export const HOW_IT_WORKS: { step: string; title: string; description: string; icon: string }[] = [
  {
    step: '01',
    title: 'Choose your package',
    description: 'Browse health packages or search for a single test and compare what is included.',
    icon: 'Search',
  },
  {
    step: '02',
    title: 'Book a slot',
    description: 'Add patient details, choose home collection or lab visit, and select a time slot.',
    icon: 'CalendarClock',
  },
  {
    step: '03',
    title: 'Sample collection',
    description: 'A qualified technician collects your sample at home or at the lab as scheduled.',
    icon: 'Syringe',
  },
  {
    step: '04',
    title: 'Reports online',
    description: 'Track processing live and download your digital report once it is ready.',
    icon: 'FileCheck2',
  },
]

export const TIME_SLOTS = [
  '6:00 AM – 7:00 AM',
  '7:00 AM – 8:00 AM',
  '8:00 AM – 9:00 AM',
  '9:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
]

/** Demo slot availability logic — deterministic per date + slot so the demo is stable. */
export const isSlotAvailable = (isoDate: string, slot: string): boolean => {
  if (!isoDate) return true
  const slotIndex = TIME_SLOTS.indexOf(slot)
  const [y, m, d] = isoDate.split('-').map(Number)
  const seed = (y * 372 + m * 31 + d) % 7
  // Two deterministic unavailable slots per date, never the same pair.
  const blockedA = seed % TIME_SLOTS.length
  const blockedB = (seed + 3) % TIME_SLOTS.length
  return slotIndex !== blockedA && slotIndex !== blockedB
}

export const slotUnavailableReason = (isoDate: string, slot: string): string => {
  const [y, m, d] = isoDate.split('-').map(Number)
  const seed = (y * 372 + m * 31 + d) % 7
  const slotIndex = TIME_SLOTS.indexOf(slot)
  if (slotIndex === seed % TIME_SLOTS.length) return 'Fully booked'
  return 'Not available'
}
