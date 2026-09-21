import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  FlaskConical,
  Home,
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Select, Textarea } from '@/components/ui/input'
import { FieldError, Label } from '@/components/ui/label'
import { Separator, RadioCard, RadioGroup, StepIndicator, Switch } from '@/components/ui/misc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PackageArtwork } from '@/components/brand/PackageArtwork'
import { DemoNotice } from '@/components/brand/DemoNotice'
import { InlineSpinner } from '@/components/common/Loaders'
import { useBookings, usePackages } from '@/store/DemoStore'
import { useToast } from '@/store/toast'
import { TIME_SLOTS, isSlotAvailable, slotUnavailableReason } from '@/data/cms'
import { LAB_INFO } from '@/data/lab'
import { isoDaysFromToday, formatLongDate, formatDayMonth, parseISODate, relativeLabel } from '@/lib/date'
import { cn, inr } from '@/lib/utils'
import {
  hasErrors,
  sanitiseAge,
  sanitiseMobile,
  sanitisePincode,
  validateAddress,
  validatePatient,
  type Errors,
} from '@/lib/validation'
import {
  StorageKeys,
  readJSON,
  removeKey,
  writeJSON,
} from '@/store/storage'
import type {
  Booking,
  BookingDraft,
  CollectionMethod,
  Gender,
  HomeCollectionAddress,
  PaymentMethod,
  PatientDraft,
} from '@/types'

const STEPS = [
  { label: 'Patient', short: 'Patient' },
  { label: 'Collection', short: 'Collection' },
  { label: 'Date & Time', short: 'Slot' },
  { label: 'Summary', short: 'Summary' },
  { label: 'Payment', short: 'Payment' },
]

const EMPTY_PATIENT: PatientDraft = {
  fullName: '',
  age: 0,
  gender: '' as Gender,
  mobile: '',
  email: '',
}

const EMPTY_ADDRESS: HomeCollectionAddress = {
  line1: '',
  area: '',
  city: 'Rajapalayam',
  pincode: '',
  landmark: '',
}

const PAYMENT_OPTIONS: {
  id: PaymentMethod
  label: string
  description: string
  icon: React.ElementType
  badge?: string
}[] = [
  {
    id: 'UPI',
    label: 'UPI',
    description: 'Pay using any UPI app — GPay, PhonePe, Paytm or your bank app.',
    icon: Smartphone,
    badge: 'Popular',
  },
  {
    id: 'Credit / Debit Card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay and Amex cards accepted at the counter gateway.',
    icon: CreditCard,
  },
  {
    id: 'Net Banking',
    label: 'Net Banking',
    description: 'Pay directly from your bank account through the secure gateway.',
    icon: Landmark,
  },
  {
    id: 'Cash at Lab',
    label: 'Cash at Lab',
    description: 'Pay in cash when you visit the laboratory for sample collection.',
    icon: Wallet,
  },
]

export default function BookingWizardPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { packages } = usePackages()
  const { createBooking } = useBookings()
  const { success, error, info } = useToast()

  const pkg = packages.find((p) => p.slug === slug)

  const [step, setStep] = React.useState(1)
  const [patient, setPatient] = React.useState<PatientDraft>(EMPTY_PATIENT)
  const [patientErrors, setPatientErrors] = React.useState<Errors<PatientDraft>>({})
  const [method, setMethod] = React.useState<CollectionMethod | null>(null)
  const [address, setAddress] = React.useState<HomeCollectionAddress>(EMPTY_ADDRESS)
  const [addressErrors, setAddressErrors] = React.useState<Errors<HomeCollectionAddress>>({})
  const [date, setDate] = React.useState(isoDaysFromToday(1))
  const [slot, setSlot] = React.useState('')
  const [slotError, setSlotError] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('UPI')
  const [processing, setProcessing] = React.useState(false)
  const [processStage, setProcessStage] = React.useState(0)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  /** Where the user asked to go when they tried to leave mid-booking. */
  const [pendingNav, setPendingNav] = React.useState<string | null>(null)
  const [terms, setTerms] = React.useState(false)
  const [saveDetails, setSaveDetails] = React.useState(true)
  const [stepError, setStepError] = React.useState('')
  const restoredRef = React.useRef(false)

  /**
   * Leaving mid-booking asks for confirmation once the user has started the form
   * (`step > 1`). Step 1 holds nothing but an untouched form, so it navigates straight
   * away — the draft is persisted either way.
   */
  const guardedNavigate = (to: string) => {
    if (step > 1) {
      setPendingNav(to)
      setConfirmOpen(true)
      return
    }
    navigate(to)
  }

  /* ------------------------- restore a saved demo draft ------------------------ */
  React.useEffect(() => {
    if (!pkg) return
    const draft = readJSON<BookingDraft | null>(StorageKeys.draft, null)
    if (draft && draft.packageId === pkg.id) {
      setPatient(draft.patient ?? EMPTY_PATIENT)
      setMethod(draft.collectionMethod ?? null)
      if (draft.address) setAddress(draft.address)
      if (draft.appointmentDate) setDate(draft.appointmentDate)
      if (draft.timeSlot) setSlot(draft.timeSlot)
      // Guarded so StrictMode's double-invoked effect can't fire two identical toasts.
      if (!restoredRef.current) {
        restoredRef.current = true
        info('Draft restored', 'We restored the demo booking draft you started earlier. You can clear it any time.')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg?.id])

  /* --------------------------------- persistence ------------------------------- */
  React.useEffect(() => {
    if (!pkg) return
    if (!patient.fullName && !patient.mobile && !method) return
    writeJSON<BookingDraft>(StorageKeys.draft, {
      packageId: pkg.id,
      patient,
      collectionMethod: method,
      address: method === 'Home Sample Collection' ? address : null,
      appointmentDate: date,
      timeSlot: slot,
    })
  }, [pkg, patient, method, address, date, slot])

  /* ------------------------------------ dates ---------------------------------- */
  const dateOptions = React.useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const offset = i + 1
        const iso = isoDaysFromToday(offset)
        const d = parseISODate(iso)
        return {
          iso,
          offset,
          day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
          dateNum: d.getDate(),
          month: d.toLocaleDateString('en-GB', { month: 'short' }),
          relative: relativeLabel(iso),
          availableSlots: TIME_SLOTS.filter((s) => isSlotAvailable(iso, s)).length,
        }
      }),
    [],
  )

  React.useEffect(() => {
    if (slot && !isSlotAvailable(date, slot)) setSlot('')
  }, [date, slot])

  if (!pkg) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
            <FlaskConical className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-xl font-bold">Package not found</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-navy-500">
            We couldn’t find that package in the demo catalogue. Choose a package to continue booking.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/packages">Browse packages</Link>
          </Button>
        </div>
      </div>
    )
  }

  const discount = pkg.mrp - pkg.price
  const discountPct = pkg.mrp > 0 ? Math.round((discount / pkg.mrp) * 100) : 0
  const collectionFee = method === 'Home Sample Collection' ? pkg.homeCollectionFee : 0
  const total = pkg.price + collectionFee
  const payOnline = paymentMethod !== 'Cash at Lab'

  /* --------------------------------- navigation -------------------------------- */
  const goNext = () => {
    setStepError('')

    if (step === 1) {
      const e = validatePatient(patient)
      setPatientErrors(e)
      if (hasErrors(e)) {
        setStepError('Please correct the highlighted patient details before continuing.')
        return
      }
    }

    if (step === 2) {
      if (!method) {
        setStepError('Choose how the sample should be collected.')
        return
      }
      if (method === 'Home Sample Collection') {
        const e = validateAddress(address)
        setAddressErrors(e)
        if (hasErrors(e)) {
          setStepError('Please complete the home collection address.')
          return
        }
      }
    }

    if (step === 3 && !slot) {
      setSlotError('Select an available time slot to continue.')
      setStepError('Please select a time slot for the collection appointment.')
      return
    }

    setStep((s) => Math.min(s + 1, STEPS.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStepError('')
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ---------------------------------- payment ---------------------------------- */
  const runDemoPayment = async () => {
    if (!terms) {
      setStepError('Please confirm the demo acknowledgement before continuing.')
      return
    }
    setStepError('')
    setProcessing(true)
    setProcessStage(0)

    const stages = payOnline ? 4 : 2
    for (let i = 1; i <= stages; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 700))
      setProcessStage(i)
    }

    const booking = finaliseBooking()
    setProcessing(false)
    removeKey(StorageKeys.draft)
    success('Booking created', `Booking ${booking.bookingNo} has been added to your demo bookings.`)
    navigate(`/booking-confirmation/${booking.id}`, { replace: true })
  }

  const finaliseBooking = (): Booking => {
    const isCash = paymentMethod === 'Cash at Lab'
    const now = new Date().toISOString()

    const booking = createBooking({
      packageId: pkg.id,
      packageName: pkg.name,
      packageCategory: pkg.category,
      patient: { ...patient, id: `pat-${Date.now()}` },
      customerId: saveDetails ? 'cus-001' : null,
      collectionMethod: method as CollectionMethod,
      address: method === 'Home Sample Collection' ? address : null,
      appointmentDate: date,
      timeSlot: slot,
      testsCount: pkg.includedTests.length,
      reportAvailability: pkg.reportAvailability,
      pricing: {
        mrp: pkg.mrp,
        packagePrice: pkg.price,
        discount,
        homeCollectionFee: collectionFee,
        total,
      },
      payment: {
        method: paymentMethod,
        state: isCash ? 'Pay at Lab' : 'Paid',
        reference: isCash ? null : `DEMO-${paymentMethod.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 899999)}`,
        paidAt: isCash ? null : now,
        amountPaid: isCash ? 0 : total,
      },
      status: 'Pending',
      source: 'Website',
      isDemo: true,
      reportReadyAt: null,
    })

    return booking
  }

  const clearDraft = () => {
    removeKey(StorageKeys.draft)
    setPatient(EMPTY_PATIENT)
    setPatientErrors({})
    setAddress(EMPTY_ADDRESS)
    setAddressErrors({})
    setMethod(null)
    setSlot('')
    setStep(1)
    info('Draft cleared', 'The saved demo booking draft has been removed.')
  }

  return (
    <div className="bg-background">
      {/* Sticky wizard header */}
      <div className="border-b border-navy-100 bg-white">
        <div className="container-page py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <nav className="flex items-center gap-1.5 text-[12px] text-navy-400" aria-label="Breadcrumb">
                <button type="button" onClick={() => guardedNavigate('/')} className="hover:text-navy-700">
                  Home
                </button>
                <span>/</span>
                <button type="button" onClick={() => guardedNavigate('/packages')} className="hover:text-navy-700">
                  Packages
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => guardedNavigate(`/packages/${pkg.slug}`)}
                  className="hover:text-navy-700"
                >
                  {pkg.shortName}
                </button>
                <span>/</span>
                <span className="font-medium text-navy-600">Book</span>
              </nav>
              <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Book your health package</h1>
            </div>
            <Badge variant="accent" size="lg">
              <LockKeyhole className="h-3.5 w-3.5" />
              Demo booking — no real payment
            </Badge>
          </div>

          <div className="mt-6">
            <StepIndicator steps={STEPS} current={step} />
          </div>
        </div>
      </div>

      <div className="container-page py-7 lg:py-9">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
          {/* ------------------------------------------------------- Wizard body */}
          <div className="min-w-0">
            {stepError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 animate-fade-in"
              >
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600" aria-hidden />
                <p className="text-[13.5px] font-medium leading-relaxed text-red-700">{stepError}</p>
              </div>
            )}

            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
              {/* ------------------------------------------------ STEP 1: PATIENT */}
              {step === 1 && (
                <section className="animate-fade-up" aria-labelledby="step-patient">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
                      <User className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 id="step-patient" className="text-[17px] font-semibold">
                        Select patient
                      </h2>
                      <p className="text-[13px] text-navy-500">
                        Enter the details of the person whose sample will be collected.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="patient-name" required>
                        Patient full name
                      </Label>
                      <Input
                        id="patient-name"
                        value={patient.fullName}
                        invalid={Boolean(patientErrors.fullName)}
                        autoComplete="name"
                        placeholder="e.g. Ravi Kumar"
                        className="mt-1.5"
                        onChange={(e) => setPatient((p) => ({ ...p, fullName: e.target.value }))}
                        onBlur={() => setPatientErrors(validatePatient(patient))}
                      />
                      <FieldError>{patientErrors.fullName}</FieldError>
                    </div>

                    <div>
                      <Label htmlFor="patient-age" required>
                        Age
                      </Label>
                      <Input
                        id="patient-age"
                        inputMode="numeric"
                        value={patient.age || ''}
                        invalid={Boolean(patientErrors.age)}
                        placeholder="e.g. 38"
                        className="mt-1.5"
                        onChange={(e) =>
                          setPatient((p) => ({ ...p, age: Number(sanitiseAge(e.target.value)) || 0 }))
                        }
                        onBlur={() => setPatientErrors(validatePatient(patient))}
                      />
                      <FieldError>{patientErrors.age}</FieldError>
                    </div>

                    <div>
                      <Label htmlFor="patient-gender" required>
                        Gender
                      </Label>
                      <div className="mt-1.5">
                        <Select
                          id="patient-gender"
                          value={patient.gender}
                          invalid={Boolean(patientErrors.gender)}
                          onChange={(e) => setPatient((p) => ({ ...p, gender: e.target.value as Gender }))}
                          onBlur={() => setPatientErrors(validatePatient(patient))}
                        >
                          <option value="">Select gender</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </Select>
                      </div>
                      <FieldError>{patientErrors.gender}</FieldError>
                    </div>

                    <div>
                      <Label htmlFor="patient-mobile" required hint="10-digit mobile">
                        Mobile number
                      </Label>
                      <Input
                        id="patient-mobile"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={patient.mobile}
                        invalid={Boolean(patientErrors.mobile)}
                        placeholder="98765 43210"
                        className="mt-1.5"
                        onChange={(e) =>
                          setPatient((p) => ({ ...p, mobile: sanitiseMobile(e.target.value) }))
                        }
                        onBlur={() => setPatientErrors(validatePatient(patient))}
                      />
                      <FieldError>{patientErrors.mobile}</FieldError>
                    </div>

                    <div>
                      <Label htmlFor="patient-email" required>
                        Email
                      </Label>
                      <Input
                        id="patient-email"
                        type="email"
                        autoComplete="email"
                        value={patient.email}
                        invalid={Boolean(patientErrors.email)}
                        placeholder="name@example.com"
                        className="mt-1.5"
                        onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))}
                        onBlur={() => setPatientErrors(validatePatient(patient))}
                      />
                      <FieldError>{patientErrors.email}</FieldError>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/60 p-4">
                    <Switch
                      id="save-details"
                      checked={saveDetails}
                      onCheckedChange={setSaveDetails}
                      className="mt-0.5"
                    />
                    <Label htmlFor="save-details" className="cursor-pointer font-normal leading-snug text-navy-600">
                      Save these details for faster booking next time
                      <span className="mt-0.5 block text-[12px] text-navy-400">
                        Demo only — details are stored in your browser and never sent anywhere.
                      </span>
                    </Label>
                  </div>

                  <DemoNotice className="mt-4" icon>
                    This is a demonstration form. Do not enter any real patient information — use the sample data
                    suggested in the placeholders.
                  </DemoNotice>
                </section>
              )}

              {/* --------------------------------------------- STEP 2: COLLECTION */}
              {step === 2 && (
                <section className="animate-fade-up" aria-labelledby="step-collection">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
                      <Home className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 id="step-collection" className="text-[17px] font-semibold">
                        Choose collection method
                      </h2>
                      <p className="text-[13px] text-navy-500">
                        Visit the laboratory or request home sample collection.
                      </p>
                    </div>
                  </div>

                  <RadioGroup
                    value={method ?? undefined}
                    onValueChange={(v) => {
                      setMethod(v as CollectionMethod)
                      setStepError('')
                    }}
                    className="mt-6 grid gap-3 sm:grid-cols-2"
                    aria-label="Collection method"
                  >
                    <RadioCard
                      value="Visit Lab"
                      label="Visit Lab"
                      icon={<Building2 className="h-5 w-5" />}
                      description="Walk in at your chosen slot. A technician collects the sample at the laboratory."
                      meta="No collection fee"
                    />
                    <RadioCard
                      value="Home Sample Collection"
                      label="Home Sample Collection"
                      icon={<Home className="h-5 w-5" />}
                      description="Our phlebotomist visits your address within the slot you select."
                      meta={
                        pkg.homeCollectionAvailable
                          ? pkg.homeCollectionFee
                            ? `${inr(pkg.homeCollectionFee)} collection fee`
                            : 'Free collection'
                          : 'Not available for this package'
                      }
                      disabled={!pkg.homeCollectionAvailable}
                    />
                  </RadioGroup>

                  {method === 'Visit Lab' && (
                    <div className="mt-5 animate-fade-in rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                      <p className="flex items-center gap-2 text-[13.5px] font-semibold text-navy-900">
                        <MapPin className="h-4 w-4 text-teal-600" aria-hidden />
                        Lab address for sample collection
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-navy-600">
                        {LAB_INFO.addressLine1}, {LAB_INFO.addressLine2}
                      </p>
                      <p className="mt-1.5 text-[12.5px] text-navy-500">
                        Open Mon–Sat 6:00 AM – 8:30 PM, Sunday 7:00 AM – 1:00 PM. Carry a photo ID and your booking ID.
                      </p>
                    </div>
                  )}

                  {method === 'Home Sample Collection' && (
                    <div className="mt-5 animate-fade-in">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-[15px] font-semibold">Home collection address</h3>
                        <Badge variant="accent">
                          {pkg.homeCollectionFee ? `${inr(pkg.homeCollectionFee)} fee` : 'Free collection'}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Label htmlFor="addr-line1" required>
                            Address (house / flat, street)
                          </Label>
                          <Textarea
                            id="addr-line1"
                            value={address.line1}
                            invalid={Boolean(addressErrors.line1)}
                            placeholder="e.g. 12A, Kamarajar Nagar, 3rd Street"
                            className="mt-1.5 min-h-[80px]"
                            onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                            onBlur={() => setAddressErrors(validateAddress(address))}
                          />
                          <FieldError>{addressErrors.line1}</FieldError>
                        </div>

                        <div>
                          <Label htmlFor="addr-area" required>
                            Area
                          </Label>
                          <Input
                            id="addr-area"
                            value={address.area}
                            invalid={Boolean(addressErrors.area)}
                            placeholder="e.g. Krishnapuram"
                            className="mt-1.5"
                            list="demo-areas"
                            onChange={(e) => setAddress((a) => ({ ...a, area: e.target.value }))}
                            onBlur={() => setAddressErrors(validateAddress(address))}
                          />
                          <datalist id="demo-areas">
                            {LAB_INFO.serviceAreas.map((area) => (
                              <option key={area} value={area} />
                            ))}
                          </datalist>
                          <FieldError>{addressErrors.area}</FieldError>
                        </div>

                        <div>
                          <Label htmlFor="addr-city" required>
                            City / Town
                          </Label>
                          <Input
                            id="addr-city"
                            value={address.city}
                            invalid={Boolean(addressErrors.city)}
                            placeholder="e.g. Rajapalayam"
                            className="mt-1.5"
                            onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                            onBlur={() => setAddressErrors(validateAddress(address))}
                          />
                          <FieldError>{addressErrors.city}</FieldError>
                        </div>

                        <div>
                          <Label htmlFor="addr-pincode" required hint="6 digits">
                            Pincode
                          </Label>
                          <Input
                            id="addr-pincode"
                            inputMode="numeric"
                            value={address.pincode}
                            invalid={Boolean(addressErrors.pincode)}
                            placeholder="e.g. 626117"
                            className="mt-1.5"
                            onChange={(e) =>
                              setAddress((a) => ({ ...a, pincode: sanitisePincode(e.target.value) }))
                            }
                            onBlur={() => setAddressErrors(validateAddress(address))}
                          />
                          <FieldError>{addressErrors.pincode}</FieldError>
                        </div>

                        <div>
                          <Label htmlFor="addr-landmark" hint="optional">
                            Landmark
                          </Label>
                          <Input
                            id="addr-landmark"
                            value={address.landmark}
                            placeholder="e.g. Opposite Sri Balaji Store"
                            className="mt-1.5"
                            onChange={(e) => setAddress((a) => ({ ...a, landmark: e.target.value }))}
                          />
                        </div>
                      </div>

                      <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-navy-500">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
                        Our technician calls before arriving. Please ensure someone is available at the address during
                        your chosen slot.
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* -------------------------------------------- STEP 3: DATE & TIME */}
              {step === 3 && (
                <section className="animate-fade-up" aria-labelledby="step-slot">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
                      <CalendarDays className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 id="step-slot" className="text-[17px] font-semibold">
                        Select date &amp; time
                      </h2>
                      <p className="text-[13px] text-navy-500">
                        Appointments can be booked up to 14 days in advance. Some demo slots are marked unavailable.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label required>Appointment date</Label>
                    <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                      {dateOptions.map((d) => {
                        const selected = date === d.iso
                        return (
                          <button
                            key={d.iso}
                            type="button"
                            onClick={() => setDate(d.iso)}
                            className={cn(
                              'flex w-[74px] shrink-0 flex-col items-center rounded-xl border px-2 py-3 transition-all',
                              selected
                                ? 'border-navy-900 bg-navy-900 text-white shadow-lift'
                                : 'border-navy-200 bg-white text-navy-700 hover:border-teal-300 hover:bg-teal-50/50',
                            )}
                            aria-pressed={selected}
                            aria-label={`${d.day} ${d.dateNum} ${d.month} — ${d.availableSlots} slots available`}
                          >
                            <span className={cn('text-[11px] font-semibold', selected ? 'text-white/70' : 'text-navy-400')}>
                              {d.day}
                            </span>
                            <span className="font-display text-lg font-bold leading-tight">{d.dateNum}</span>
                            <span className={cn('text-[10.5px] font-medium', selected ? 'text-white/70' : 'text-navy-400')}>
                              {d.month}
                            </span>
                            <span
                              className={cn(
                                'mt-1.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold',
                                d.availableSlots === 0
                                  ? 'bg-red-100 text-red-700'
                                  : selected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-teal-50 text-teal-700',
                              )}
                            >
                              {d.availableSlots}/5
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-1.5 text-[12.5px] text-navy-500">
                      Selected: <span className="font-semibold text-navy-800">{formatLongDate(date)}</span>{' '}
                      <span className="text-navy-400">({relativeLabel(date)})</span>
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label required>Time slot</Label>
                      <div className="flex items-center gap-3 text-[11.5px] font-medium">
                        <span className="flex items-center gap-1.5 text-navy-500">
                          <span className="h-2.5 w-2.5 rounded-full border border-navy-300 bg-white" aria-hidden />
                          Available
                        </span>
                        <span className="flex items-center gap-1.5 text-navy-400">
                          <span className="h-2.5 w-2.5 rounded-full bg-navy-200" aria-hidden />
                          Unavailable
                        </span>
                      </div>
                    </div>

                    <RadioGroup
                      value={slot}
                      onValueChange={(v) => {
                        setSlot(v)
                        setSlotError('')
                        setStepError('')
                      }}
                      className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                      aria-label="Time slot"
                    >
                      {TIME_SLOTS.map((s) => {
                        const available = isSlotAvailable(date, s)
                        return (
                          <RadioCard
                            key={s}
                            value={s}
                            disabled={!available}
                            label={s}
                            icon={<CalendarDays className="h-4.5 w-4.5" />}
                            description={
                              available
                                ? method === 'Home Sample Collection'
                                  ? 'Technician visits in this window'
                                  : 'Collect sample at the laboratory'
                                : `${slotUnavailableReason(date, s)} — try another slot`
                            }
                            className={cn(!available && 'cursor-not-allowed bg-navy-50/70 opacity-70 hover:border-navy-200')}
                          />
                        )
                      })}
                    </RadioGroup>
                    <FieldError>{slotError}</FieldError>

                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-navy-100 bg-navy-50/50 p-3.5">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                      <p className="text-[12.5px] leading-relaxed text-navy-500">
                        Availability shown is generated by the demo booking logic. In production this reads live slot
                        capacity from the laboratory’s scheduling system.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* ----------------------------------------------- STEP 4: SUMMARY */}
              {step === 4 && (
                <section className="animate-fade-up" aria-labelledby="step-summary">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
                      <ShieldCheck className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 id="step-summary" className="text-[17px] font-semibold">
                        Booking summary
                      </h2>
                      <p className="text-[13px] text-navy-500">
                        Review everything before you continue. You can go back to change any step.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <SummaryBlock
                      icon={FlaskConical}
                      title="Package"
                      onEdit={() => setStep(1)}
                      showEdit={false}
                      rows={[
                        ['Package', pkg.name],
                        ['Tests included', `${pkg.includedTests.length} tests`],
                        ['Expected report', pkg.reportAvailability],
                      ]}
                    />

                    <SummaryBlock
                      icon={User}
                      title="Patient"
                      onEdit={() => setStep(1)}
                      rows={[
                        ['Name', patient.fullName || '—'],
                        ['Age / Gender', `${patient.age || '—'} yrs · ${patient.gender || '—'}`],
                        ['Mobile', patient.mobile || '—'],
                        ['Email', patient.email || '—'],
                      ]}
                    />

                    <SummaryBlock
                      icon={Home}
                      title="Collection method"
                      onEdit={() => setStep(2)}
                      rows={
                        method === 'Home Sample Collection'
                          ? [
                              ['Method', 'Home Sample Collection'],
                              [
                                'Address',
                                `${address.line1}, ${address.area}, ${address.city} – ${address.pincode}${
                                  address.landmark ? ` (${address.landmark})` : ''
                                }`,
                              ],
                              [
                                'Collection fee',
                                pkg.homeCollectionFee ? inr(pkg.homeCollectionFee) : 'Free of charge',
                              ],
                            ]
                          : [
                              ['Method', 'Visit Lab'],
                              ['Location', `${LAB_INFO.addressLine1}, ${LAB_INFO.addressLine2}`],
                              ['Collection fee', 'Not applicable'],
                            ]
                      }
                    />

                    <SummaryBlock
                      icon={CalendarDays}
                      title="Appointment"
                      onEdit={() => setStep(3)}
                      rows={[
                        ['Date', formatLongDate(date)],
                        ['Day', formatDayMonth(date)],
                        ['Time slot', slot || '—'],
                      ]}
                    />

                    <div className="rounded-2xl border border-navy-200 bg-white p-5">
                      <h3 className="text-[15px] font-semibold">Charges</h3>
                      <dl className="mt-4 space-y-2.5 text-[13.5px]">
                        <div className="flex items-center justify-between">
                          <dt className="text-navy-500">Package MRP</dt>
                          <dd className="font-medium text-navy-500 line-through">{inr(pkg.mrp)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-navy-500">Package discount ({discountPct}%)</dt>
                          <dd className="font-semibold text-success-600">− {inr(discount)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-navy-500">Package price</dt>
                          <dd className="font-semibold text-navy-900">{inr(pkg.price)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-navy-500">Home sample collection fee</dt>
                          <dd className="font-semibold text-navy-900">
                            {method === 'Home Sample Collection'
                              ? collectionFee
                                ? inr(collectionFee)
                                : 'Free'
                              : 'Not applicable'}
                          </dd>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <dt className="text-[15px] font-bold text-navy-900">Total payable</dt>
                          <dd className="font-display text-xl font-bold text-navy-900">{inr(total)}</dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-[12px] text-navy-400">
                        Demo pricing. No real payment is collected on this website.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* ----------------------------------------------- STEP 5: PAYMENT */}
              {step === 5 && (
                <section className="animate-fade-up" aria-labelledby="step-payment">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
                      <LockKeyhole className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 id="step-payment" className="text-[17px] font-semibold">
                        Payment
                      </h2>
                      <p className="text-[13px] text-navy-500">
                        Choose how you would like to pay for this booking.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning-100 bg-warning-50 p-4">
                    <Sparkles className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warning-600" aria-hidden />
                    <div>
                      <p className="text-[13.5px] font-semibold text-warning-800">Simulated payment — demo mode</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-warning-700">
                        No payment gateway is connected. Do not enter real card or UPI credentials anywhere in this
                        demonstration.
                      </p>
                    </div>
                  </div>

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="mt-5 grid gap-3"
                    aria-label="Payment method"
                  >
                    {PAYMENT_OPTIONS.map((opt) => (
                      <RadioCard
                        key={opt.id}
                        value={opt.id}
                        label={
                          <>
                            {opt.label}
                            {opt.badge && <Badge variant="accent" size="sm">{opt.badge}</Badge>}
                          </>
                        }
                        icon={<opt.icon className="h-5 w-5" />}
                        description={opt.description}
                        meta={opt.id === 'Cash at Lab' ? 'Booking is created with “Pay at Lab” status' : undefined}
                      />
                    ))}
                  </RadioGroup>

                  {payOnline && (
                    <div className="mt-5 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                      <p className="text-[13px] font-semibold text-navy-900">
                        {paymentMethod === 'UPI'
                          ? 'Demo UPI flow'
                          : paymentMethod === 'Credit / Debit Card'
                            ? 'Demo card flow'
                            : 'Demo net banking flow'}
                      </p>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-500">
                        Continuing will run a simulated authorisation with a demo reference number. No card details are
                        requested, transmitted or stored.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['256-bit TLS (demo)', 'No card data stored', 'Instant confirmation'].map((chip) => (
                          <Badge key={chip} variant="outline" size="sm">
                            <ShieldCheck className="h-3 w-3" />
                            {chip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-navy-100 p-4">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => {
                        setTerms(e.target.checked)
                        if (e.target.checked) setStepError('')
                      }}
                      className="mt-0.5 h-4 w-4 rounded accent-teal-500"
                    />
                    <span className="text-[13px] leading-relaxed text-navy-600">
                      I understand this is a demonstration booking. The package, price and report shown are fictional
                      sample data, and no real payment is processed.
                    </span>
                  </label>
                  <FieldError>{!terms && stepError ? 'Acknowledgement is required to continue' : undefined}</FieldError>
                </section>
              )}
            </div>

            {/* Wizard navigation */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {step > 1 && (
                  <Button variant="outline" size="lg" onClick={goBack} disabled={processing}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                {step === 1 && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="hidden sm:inline-flex"
                    onClick={() => guardedNavigate(`/packages/${pkg.slug}`)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to package
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="order-2 hidden text-navy-400 underline-offset-2 hover:text-navy-700 hover:underline sm:order-1 sm:inline-flex"
                  onClick={clearDraft}
                >
                  Clear demo draft
                </Button>

                {step < STEPS.length ? (
                  <Button size="lg" variant="accent" onClick={goNext} className="sm:min-w-[210px]">
                    {step === 3 ? 'Review summary' : step === 4 ? 'Proceed to Payment' : 'Continue'}
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="accent"
                    onClick={runDemoPayment}
                    disabled={processing}
                    className="sm:min-w-[240px]"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-4.5 w-4.5" />
                        {payOnline ? `Pay ${inr(total)} (demo)` : 'Confirm booking — Pay at Lab'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile-only secondary row so nothing floats above the primary action */}
            <div className="mt-3 flex items-center justify-center gap-4 border-t border-navy-100 pt-3 sm:hidden">
              <button
                type="button"
                onClick={clearDraft}
                className="text-[12.5px] font-semibold text-navy-500 underline-offset-2 hover:text-navy-800 hover:underline"
              >
                Clear demo draft
              </button>
              <span className="h-3 w-px bg-navy-200" aria-hidden />
              <Link
                to={`/packages/${pkg.slug}`}
                className="text-[12.5px] font-semibold text-navy-500 underline-offset-2 hover:text-navy-800 hover:underline"
              >
                Package details
              </Link>
            </div>

            <p className="mt-4 text-center text-[12px] text-navy-400 sm:text-left">
              Need help? Call the demo lab on {LAB_INFO.phone} — the number is fictional and used for presentation only.
            </p>
          </div>

          {/* --------------------------------------------------------- Side rail */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
              <PackageArtwork pkg={pkg} className="h-36 w-full" />
              <div className="p-5">
                <Badge variant="accent" size="sm">
                  {pkg.category}
                </Badge>
                <h2 className="mt-2.5 text-[15.5px] font-semibold leading-snug">{pkg.name}</h2>
                <p className="mt-1.5 text-[12.5px] text-navy-500">
                  {pkg.includedTests.length} tests · {pkg.reportAvailability.replace('Reports typically available within ', 'Report in ')}
                </p>

                <Separator className="my-4" />

                <dl className="space-y-2.5 text-[13px]">
                  <Row label="Package MRP" value={inr(pkg.mrp)} muted strike />
                  <Row label={`Discount (${discountPct}%)`} value={`− ${inr(discount)}`} success />
                  <Row label="Package price" value={inr(pkg.price)} strong />
                  {method === 'Home Sample Collection' && (
                    <Row
                      label="Home collection"
                      value={pkg.homeCollectionFee ? inr(pkg.homeCollectionFee) : 'Free'}
                    />
                  )}
                </dl>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-navy-600">Total payable</span>
                  <span className="font-display text-xl font-bold text-navy-900">{inr(total)}</span>
                </div>

                <div className="mt-4 rounded-xl bg-navy-50/60 p-3.5">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-navy-400">Your selection</p>
                  <ul className="mt-2 space-y-1.5 text-[12.5px] text-navy-600">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" aria-hidden />
                      {patient.fullName ? `${patient.fullName}${patient.age ? `, ${patient.age} yrs` : ''}` : 'Patient not added yet'}
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" aria-hidden />
                      {method ?? 'Collection method not chosen'}
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" aria-hidden />
                      {slot ? `${formatDayMonth(date)} · ${slot}` : 'Slot not selected'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-navy-900">
                <ShieldCheck className="h-4 w-4 text-teal-600" aria-hidden />
                What happens after booking
              </p>
              <ol className="mt-2.5 space-y-1.5 text-[12px] leading-relaxed text-navy-500">
                <li>1. The lab confirms your appointment.</li>
                <li>2. A technician is assigned to your collection slot.</li>
                <li>3. You receive the report digitally once processing is complete.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>

      {/* ------------------------------------- Processing overlay (demo payment) */}
      <Dialog open={processing} onOpenChange={() => {}}>
        <DialogContent
          size="sm"
          hideClose
          className="text-center"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              {payOnline ? 'Processing demo payment' : 'Creating your booking'}
            </DialogTitle>
            <DialogDescription className="text-center">
              Simulated flow — please keep this window open.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
            <InlineSpinner className="h-7 w-7 border-teal-200 border-t-teal-600" />
          </div>

          <ol className="mx-auto mt-6 max-w-xs space-y-3 text-left">
            {(payOnline
              ? ['Validating booking details', 'Creating demo order', 'Simulating payment authorisation', 'Confirming booking']
              : ['Validating booking details', 'Creating booking record']
            ).map((label, i) => {
              const done = processStage > i
              const active = processStage === i
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
                      done
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : active
                          ? 'border-teal-500 text-teal-600'
                          : 'border-navy-200 text-navy-300',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn('text-[13px]', done || active ? 'font-medium text-navy-800' : 'text-navy-400')}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>

          <p className="mt-6 text-[11.5px] text-navy-400">
            No real transaction is performed. Nothing is charged.
          </p>
        </DialogContent>
      </Dialog>

      {/* ------------------- Confirmation before leaving the booking flow */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          setConfirmOpen(next)
          if (!next) setPendingNav(null)
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Leave the booking?</DialogTitle>
            <DialogDescription>
              Your progress is saved as a demo draft in this browser, so you can pick up where you left off.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Stay here
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const target = pendingNav ?? `/packages/${pkg.slug}`
                setPendingNav(null)
                setConfirmOpen(false)
                navigate(target)
              }}
            >
              <Ban className="h-4 w-4" />
              Leave booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

function SummaryBlock({
  icon: Icon,
  title,
  rows,
  onEdit,
  showEdit = true,
}: {
  icon: React.ElementType
  title: string
  rows: [string, string][]
  onEdit?: () => void
  showEdit?: boolean
}) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-[14.5px] font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          {title}
        </h3>
        {showEdit && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      <dl className="mt-3.5 space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-3">
            <dt className="text-[12.5px] font-medium text-navy-400">{label}</dt>
            <dd className="text-[13.5px] leading-relaxed text-navy-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Row({
  label,
  value,
  strong,
  success,
  muted,
  strike,
}: {
  label: string
  value: string
  strong?: boolean
  success?: boolean
  muted?: boolean
  strike?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={cn('text-navy-500', muted && 'text-navy-400')}>{label}</dt>
      <dd
        className={cn(
          'text-right font-semibold',
          strong ? 'text-navy-900' : success ? 'text-success-600' : 'text-navy-700',
          strike && 'font-normal text-navy-400 line-through',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
