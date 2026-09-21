import type { Booking, DemoReport, ReportRow } from '@/types'
import { formatShortDate } from '@/lib/date'

/**
 * DEMO REPORT GENERATOR
 * Produces a clearly-labelled SAMPLE report so the "Report Ready" state can be
 * demonstrated end to end. Values are deterministic demo numbers — they are
 * NOT medical data and no diagnosis is implied or provided.
 */

const CATALOGUE: Record<string, Omit<ReportRow, 'flag'>> = {
  Hemoglobin: { test: 'Hemoglobin', value: '13.8', unit: 'g/dL', referenceRange: '13.0 – 17.0' },
  'Complete Blood Count': { test: 'Total WBC Count', value: '7,400', unit: '/µL', referenceRange: '4,000 – 11,000' },
  'Fasting Blood Sugar': { test: 'Fasting Blood Sugar', value: '96', unit: 'mg/dL', referenceRange: '70 – 100' },
  HbA1c: { test: 'HbA1c', value: '5.6', unit: '%', referenceRange: '4.0 – 5.6' },
  'Lipid Profile': { test: 'Total Cholesterol', value: '182', unit: 'mg/dL', referenceRange: '< 200' },
  'Liver Function Test': { test: 'SGPT / ALT', value: '31', unit: 'U/L', referenceRange: '10 – 40' },
  'Kidney Function Test': { test: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.7 – 1.3' },
  'Thyroid Profile': { test: 'TSH', value: '2.4', unit: 'µIU/mL', referenceRange: '0.4 – 4.2' },
  'Vitamin D': { test: 'Vitamin D (25-OH)', value: '28', unit: 'ng/mL', referenceRange: '30 – 100' },
  'Vitamin B12': { test: 'Vitamin B12', value: '412', unit: 'pg/mL', referenceRange: '200 – 900' },
}

const EXTRA_SAMPLES: Omit<ReportRow, 'flag'>[] = [
  { test: 'Total RBC Count', value: '5.1', unit: 'million/µL', referenceRange: '4.5 – 5.9' },
  { test: 'Platelet Count', value: '2.6', unit: 'lakh/µL', referenceRange: '1.5 – 4.1' },
  { test: 'HDL Cholesterol', value: '48', unit: 'mg/dL', referenceRange: '> 40' },
  { test: 'LDL Cholesterol', value: '108', unit: 'mg/dL', referenceRange: '< 130' },
  { test: 'Blood Urea', value: '24', unit: 'mg/dL', referenceRange: '15 – 40' },
  { test: 'T3 — Triiodothyronine', value: '1.2', unit: 'ng/mL', referenceRange: '0.8 – 2.0' },
  { test: 'T4 — Thyroxine', value: '8.1', unit: 'µg/dL', referenceRange: '5.1 – 14.1' },
  { test: 'Serum Calcium', value: '9.4', unit: 'mg/dL', referenceRange: '8.5 – 10.5' },
  { test: 'Uric Acid', value: '5.3', unit: 'mg/dL', referenceRange: '3.5 – 7.2' },
  { test: 'ESR', value: '12', unit: 'mm/hr', referenceRange: '0 – 15' },
]

const flagFor = (index: number): ReportRow['flag'] => {
  if (index % 7 === 3) return 'Borderline'
  if (index % 11 === 5) return 'Review recommended'
  return 'Normal'
}

export const buildDemoReport = (booking: Booking, includedTests: string[] = []): DemoReport => {
  const names = includedTests.length
    ? includedTests
    : Object.keys(CATALOGUE)

  const rows: ReportRow[] = []
  names.slice(0, 12).forEach((name, i) => {
    const direct = CATALOGUE[name]
    if (direct) {
      rows.push({ ...direct, flag: flagFor(i) })
    } else {
      const fallback = EXTRA_SAMPLES[i % EXTRA_SAMPLES.length]
      rows.push({ ...fallback, flag: flagFor(i) })
    }
  })

  const collectedOffset = 1
  const reportedOffset = 2
  const collected = new Date(`${booking.appointmentDate}T08:35:00`)

  return {
    bookingNo: booking.bookingNo,
    patientName: booking.patient.fullName,
    age: booking.patient.age,
    gender: booking.patient.gender,
    collectedOn: formatShortDate(
      new Date(collected.getTime()).toISOString().slice(0, 10) || booking.appointmentDate,
    ),
    reportedOn: formatShortDate(
      new Date(collected.getTime() + reportedOffset * 86400000).toISOString().slice(0, 10),
    ),
    packageName: booking.packageName,
    rows: rows.length ? rows : EXTRA_SAMPLES.slice(0, 6).map((r, i) => ({ ...r, flag: flagFor(i) })),
    remarks:
      'This is a sample demonstration report created for the LabCare Diagnostics website demo. Values are illustrative and do not represent any real person or any medical finding. Please do not use this document for any health decision. Actual reports are reviewed and released by qualified laboratory professionals.',
  }
}

export const SAMPLE_REPORT_NOTE =
  'DEMO REPORT — NOT A REAL MEDICAL REPORT. Generated only to demonstrate the online report delivery experience.'

export const DEMO_REPORT_DISCLAIMER =
  'Illustrative sample values only. Not a diagnosis and not medical advice.'
