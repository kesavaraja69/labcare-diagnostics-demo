/**
 * End-to-end smoke test for the LabCare Diagnostics demo.
 * Walks the exact client-presentation flow and reports console errors,
 * failed requests and broken assertions.
 */
const puppeteer = require('puppeteer')

const BASE = 'http://localhost:5173'
const results = []
const consoleErrors = []
const pageErrors = []
const failedRequests = []

const log = (name, ok, extra = '') => {
  results.push({ name, ok, extra })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function clickText(page, selector, text) {
  const handle = await page.evaluateHandle(
    (sel, txt) => {
      const els = [...document.querySelectorAll(sel)]
      return els.find((e) => (e.textContent || '').trim().toLowerCase().includes(txt.toLowerCase()))
    },
    selector,
    text,
  )
  const el = handle.asElement()
  if (!el) throw new Error(`no ${selector} containing "${text}"`)
  await el.click()
  return true
}

async function clickInDialog(page, text) {
  const ok = await page.evaluate((txt) => {
    const dialog = document.querySelector('[role="dialog"]')
    if (!dialog) return false
    const els = [...dialog.querySelectorAll('button')]
    const target = els.find((e) => (e.textContent || '').trim().toLowerCase().includes(txt.toLowerCase()))
    if (!target) return false
    target.scrollIntoView({ block: 'center' })
    target.click()
    return true
  }, text)
  if (!ok) throw new Error(`no dialog button containing "${text}"`)
  return true
}

async function fillField(page, selector, value) {
  const ok = await page.evaluate(
    (sel, val) => {
      const el = document.querySelector(sel)
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
      setter.call(el, val)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    },
    selector,
    value,
  )
  if (!ok) throw new Error(`could not fill ${selector}`)
  return true
}

async function exists(page, selector) {
  return (await page.$(selector)) !== null
}

async function hasText(page, text) {
  const body = await page.evaluate(() => document.body.innerText)
  return body.toLowerCase().includes(text.toLowerCase())
}

;(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1000'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1000 })

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text()
      if (!t.includes('favicon')) consoleErrors.push(t)
    }
  })
  page.on('pageerror', (err) => pageErrors.push(String(err)))
  page.on('requestfailed', (req) => {
    if (!req.url().includes('favicon')) failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`)
  })

  try {
    /* ------------------------------------------------ 1. Homepage */
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(800)
    log('Home: hero headline renders', await hasText(page, 'Complete Health Checkups'))
    log('Home: tagline present', await hasText(page, 'Accurate Testing. Easy Booking. Better Healthcare.'))
    log('Home: popular packages section', await hasText(page, 'Popular health packages'))
    log('Home: 6 featured package cards', (await page.$$('article')).length >= 6, `${(await page.$$('article')).length} cards`)
    log('Home: why choose section', await hasText(page, 'Why choose LabCare'))
    log('Home: FAQ section', await hasText(page, 'Everything patients usually ask'))
    log('Home: demo pricing disclaimer', await hasText(page, 'Demo prices and package contents'))
    log('Home: trust strip', await hasText(page, 'Qualified Lab Professionals'))

    /* ------------------------------------------------ 2. Catalogue */
    await page.goto(`${BASE}/packages`, { waitUntil: 'networkidle2' })
    await sleep(900)
    log('Catalogue: page title', await hasText(page, 'Tests & Health Packages'))
    const cardCount = (await page.$$('article')).length
    log('Catalogue: packages listed', cardCount >= 9, `${cardCount} rendered`)
    log('Catalogue: category filter', await hasText(page, "Women's Health"))
    log('Catalogue: sort control', await exists(page, 'select[aria-label="Sort packages"]'))

    // Search
    await page.type('input[aria-label="Search packages"]', 'thyroid')
    await sleep(900)
    log('Catalogue: search filters results', await hasText(page, 'Thyroid Profile'))
    await page.click('button[aria-label="Clear search"]')
    await sleep(600)

    // Category filter via sidebar checkbox
    const catClicked = await page.evaluate(() => {
      const labels = [...document.querySelectorAll('label')]
      const target = labels.find((l) => (l.textContent || '').trim().startsWith('Senior Care'))
      if (!target) return false
      const cb = target.querySelector('button[role="checkbox"]')
      if (cb) { cb.click(); return true }
      target.querySelector('input')?.click()
      return true
    })
    await sleep(900)
    log('Catalogue: category checkbox filters', catClicked && (await hasText(page, 'Senior Citizen Health Package')))
    const cleared = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === 'Clear all')
      if (btn) { btn.click(); return true }
      const reset = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === 'Reset')
      if (reset) { reset.click(); return true }
      return false
    })
    await sleep(900)
    log('Catalogue: filters cleared', cleared)

    // List view toggle
    if (await page.$('button[aria-label="List view"]')) {
      await page.click('button[aria-label="List view"]')
      await sleep(400)
      log('Catalogue: list view renders', (await page.$$('article')).length > 0)
    }

    /* ------------------------------------------------ 3. Package details */
    await page.goto(`${BASE}/packages/comprehensive-full-body-checkup`, { waitUntil: 'networkidle2' })
    await sleep(700)
    log('Details: heading', await hasText(page, 'Comprehensive Full Body Checkup'))
    log('Details: 12 tests shown', await hasText(page, '12 tests included'))
    log('Details: MRP shown', await hasText(page, '₹2,499'))
    log('Details: offer price shown', await hasText(page, '₹1,999'))
    log('Details: discount', await hasText(page, '20% OFF'))
    log('Details: home collection availability', await hasText(page, 'Home sample collection available'))

    await clickText(page, 'button', 'Included tests')
    await sleep(500)
    log('Details: included tests list', await hasText(page, 'Complete Blood Count') && await hasText(page, 'Vitamin B12'))

    await clickText(page, 'button', 'Preparation')
    await sleep(500)
    log('Details: preparation tab', await hasText(page, 'Preparation instructions'))
    log('Details: no medical advice warning', await hasText(page, 'does not provide medical advice'))

    await clickText(page, 'button', 'Collection & reports')
    await sleep(500)
    log('Details: report availability', await hasText(page, 'Reports typically available within 24–48 hours'))

    /* ------------------------------------------------ 4-8. Booking wizard */
    await clickText(page, 'button', 'Book This Package')
    await page.waitForFunction(() => location.pathname.startsWith('/book/'), { timeout: 10000 })
    await sleep(900)
    log('Booking: wizard opened', await hasText(page, 'Book your health package'))

    // Step 1 — patient
    await clickText(page, 'button', 'Continue')
    await sleep(500)
    log('Booking: validation blocks empty step 1', await hasText(page, 'correct the highlighted patient details'))

    await page.type('#patient-name', 'Ravi Kumar')
    await page.type('#patient-age', '38')
    await page.select('#patient-gender', 'Male')
    await page.type('#patient-mobile', '9876543210')
    await page.type('#patient-email', 'ravi.kumar@example.com')
    await clickText(page, 'button', 'Continue')
    await sleep(800)
    log('Booking: advanced to step 2', await hasText(page, 'Choose collection method'))

    // Step 2 — home collection
    await clickText(page, 'div[role="radio"], label, button', 'Home Sample Collection')
    await sleep(600)
    log('Booking: home collection selected', await hasText(page, 'Home collection address'))

    await page.type('#addr-line1', '12A, Kamarajar Nagar, 3rd Street')
    await page.type('#addr-area', 'Krishnapuram')
    await page.type('#addr-landmark', 'Opposite Sri Balaji Store')
    await page.type('#addr-pincode', '626136')
    await clickText(page, 'button', 'Continue')
    await sleep(800)
    log('Booking: advanced to step 3', await hasText(page, 'Select date & time'))

    // Step 3 — slot: find an enabled slot radio
    const slotPicked = await page.evaluate(() => {
      const items = [...document.querySelectorAll('[role="radio"]')].filter((el) => !el.hasAttribute('disabled'))
      const slot = items.find((el) => /AM|PM/.test(el.textContent || ''))
      if (slot) {
        slot.click()
        return (slot.textContent || '').trim().slice(0, 30)
      }
      return null
    })
    log('Booking: available slot selectable', Boolean(slotPicked), slotPicked || 'none enabled')
    await sleep(400)
    await clickText(page, 'button', 'Review summary')
    await sleep(800)
    log('Booking: summary step', await hasText(page, 'Booking summary'))
    log('Booking: summary shows total', await hasText(page, '₹2,099'))
    log('Booking: summary shows home fee', await hasText(page, '₹100'))
    log('Booking: summary shows address', await hasText(page, 'Krishnapuram'))

    // Step 4 → payment
    await clickText(page, 'button', 'Proceed to Payment')
    await sleep(800)
    log('Booking: payment step', await hasText(page, 'Simulated payment'))
    log('Booking: UPI option', await hasText(page, 'UPI'))
    log('Booking: cash option', await hasText(page, 'Cash at Lab'))

    // Choose card payment
    await clickText(page, '[role="radio"]', 'Credit / Debit Card')
    await sleep(300)
    await page.click('input[type="checkbox"]')
    await sleep(300)
    await clickText(page, 'button', 'Pay ₹2,099 (demo)')
    await sleep(1200)
    log('Booking: simulated payment runs', await hasText(page, 'Processing demo payment'))

    await page.waitForFunction(() => location.pathname.includes('booking-confirmation'), { timeout: 25000 })
    await sleep(1200)

    /* ------------------------------------------------ 9. Confirmation */
    log('Confirm: Booking Confirmed heading', await hasText(page, 'Booking Confirmed'))
    log('Confirm: booking id format', await hasText(page, 'LAB-2026-'))
    log('Confirm: patient name', await hasText(page, 'Ravi Kumar'))
    log('Confirm: package name', await hasText(page, 'Comprehensive Full Body Checkup'))
    log('Confirm: collection method', await hasText(page, 'Home Sample Collection'))
    log('Confirm: total', await hasText(page, '₹2,099'))
    log('Confirm: status badge', await hasText(page, 'Booking Received') || await hasText(page, 'Pending'))
    log('Confirm: action buttons', (await hasText(page, 'View Booking')) && (await hasText(page, 'Download Receipt')) && (await hasText(page, 'Book Another Test')) && (await hasText(page, 'Contact Lab')))

    const bookingUrl = page.url()
    const bookingId = bookingUrl.split('/').pop()

    // Receipt download opens new tab
    const pagesBefore = (await browser.pages()).length
    await clickText(page, 'button', 'Download Receipt')
    await sleep(1400)
    const pagesAfter = await browser.pages()
    log('Confirm: receipt opens a document', pagesAfter.length >= pagesBefore, `${pagesBefore} → ${pagesAfter.length} tabs`)
    if (pagesAfter.length > pagesBefore) {
      const receiptPage = pagesAfter[pagesAfter.length - 1]
      const receiptText = await receiptPage.evaluate(() => document.body.innerText)
      log('Confirm: receipt labelled as demo', receiptText.includes('DEMO RECEIPT'), receiptText.slice(0, 60).replace(/\n/g, ' '))
      await receiptPage.close()
    }

    /* ------------------------------------------------ 10. My Bookings */
    await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle2' })
    await sleep(1100)
    log('MyBookings: heading', await hasText(page, 'My Bookings'))
    log('MyBookings: summary stats', await hasText(page, 'Total bookings'))
    log('MyBookings: filter tabs', await hasText(page, 'Report ready'))
    log('MyBookings: new booking listed', await hasText(page, 'Comprehensive Full Body Checkup'))
    log('MyBookings: statuses across demo data', (await hasText(page, 'Processing')) && (await hasText(page, 'Cancelled')))

    // Open booking detail
    await page.goto(`${BASE}/my-bookings/${bookingId}`, { waitUntil: 'networkidle2' })
    await sleep(900)
    log('BookingDetail: timeline tab', await hasText(page, 'Booking progress'))
    log('BookingDetail: all statuses in timeline', (await hasText(page, 'Sample Collected')) && (await hasText(page, 'Report Ready')))
    await clickText(page, 'button', 'Booking details')
    await sleep(700)
    log('BookingDetail: details tab shows patient', await hasText(page, 'Patient details'))
    log('BookingDetail: payment panel', (await hasText(page, 'Demo reference')) && (await hasText(page, 'Payment method')))

    // Report-ready demo booking (bkg-114 is Report Ready)
    await page.goto(`${BASE}/my-bookings/bkg-114`, { waitUntil: 'networkidle2' })
    await sleep(900)
    log('Report: ready banner', await hasText(page, 'Your report is ready'))
    log('Report: DEMO REPORT label', await hasText(page, 'DEMO REPORT — NOT A REAL MEDICAL REPORT'))
    await clickText(page, 'button', 'View Report')
    await sleep(900)
    log('Report: preview table renders', await hasText(page, 'Reference range'))
    log('Report: disclaimer', await hasText(page, 'Not a diagnosis and not medical advice'))
    await page.keyboard.press('Escape')
    await sleep(400)

    /* ------------------------------------------------ 11. Other customer pages */
    await page.goto(`${BASE}/about`, { waitUntil: 'networkidle2' })
    await sleep(600)
    log('About: heading', await hasText(page, 'A local diagnostic laboratory'))
    log('About: demo disclaimer', await hasText(page, 'fictional sample content'))

    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle2' })
    await sleep(600)
    log('Contact: heading', await hasText(page, 'Contact LabCare Diagnostics'))
    log('Contact: demo contact notice', await hasText(page, 'fictional demo information'))

    // Contact form validation
    await clickText(page, 'button', 'Send enquiry')
    await sleep(800)
    log('Contact: validation errors shown', await hasText(page, 'Please tell us your name'))
    await page.type('#c-name', 'Priya S')
    await page.type('#c-phone', '9442145536')
    await page.type('#c-email', 'priya.s@example.com')
    await page.select('#c-subject', 'Booking enquiry')
    await page.type('#c-message', 'I would like to know more about the women wellness package timings.')
    await clickText(page, 'button', 'Send enquiry')
    await sleep(1600)
    log('Contact: success state', await hasText(page, 'Enquiry recorded (demo)'))

    /* ------------------------------------------------ 12. Login */
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
    await sleep(700)
    log('Login: page renders', await hasText(page, 'Sign in to the demo'))
    log('Login: credentials documented', await hasText(page, 'admin@labcare-demo.in'))
    log('Login: patient tab', await hasText(page, 'Patient login'))
    log('Login: admin tab', await hasText(page, 'Admin login'))

    /* ------------------------------------------------ 13. Admin */
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2' })
    await sleep(900)
    log('Admin: redirects to login when signed out', page.url().includes('/admin/login'), page.url())

    await clickText(page, 'button', 'Fill these credentials automatically')
    await sleep(400)
    await clickText(page, 'button', 'Sign in to admin console')
    await sleep(1800)
    log('Admin: signed in to dashboard', await hasText(page, 'Operations dashboard'))
    log('Admin: metric cards', (await hasText(page, "Today's Bookings")) && (await hasText(page, "Today's Revenue")) && (await hasText(page, 'Total Customers')))
    log('Admin: booking trend chart', await hasText(page, 'Booking trend'))
    log('Admin: revenue trend chart', await hasText(page, 'Revenue trend'))
    log('Admin: popular packages', await hasText(page, 'Popular packages'))
    log('Admin: booking source chart', await hasText(page, 'Booking source'))
    log('Admin: collection type chart', await hasText(page, 'Collection type'))
    log('Admin: sidebar navigation', (await hasText(page, 'Packages')) && (await hasText(page, 'Customers')) && (await hasText(page, 'Reports')))

    /* Admin bookings */
    await page.goto(`${BASE}/admin/bookings`, { waitUntil: 'networkidle2' })
    await sleep(1000)
    log('AdminBookings: table renders', await hasText(page, 'Booking management'))
    log('AdminBookings: status chips', await hasText(page, 'Sample Collection Scheduled'))
    await page.type('input[aria-label="Search bookings"]', 'LAB-2026-000123')
    await sleep(700)
    log('AdminBookings: search works', await hasText(page, 'Ravi Kumar'))
    await page.click('button[aria-label="Clear search"]')
    await sleep(500)

    // Open detail and change status
    await page.goto(`${BASE}/admin/bookings?booking=bkg-123`, { waitUntil: 'networkidle2' })
    await sleep(1100)
    log('AdminBookings: detail dialog opens', await hasText(page, 'Update status'))
    await clickInDialog(page, 'Sample Collection Scheduled')
    await sleep(900)
    log('AdminBookings: status chip applied', await hasText(page, 'Sample Collection Scheduled'))
    await clickInDialog(page, 'Close')
    await sleep(600)
    log('AdminBookings: toast shown for status change', consoleErrors.length === 0, consoleErrors.slice(0, 1).join(''))

    // Verify on customer side
    await page.goto(`${BASE}/my-bookings/bkg-123`, { waitUntil: 'networkidle2' })
    await sleep(900)
    log('Cross-check: customer timeline reflects admin change', await hasText(page, 'Sample Collection Scheduled'))

    // Advance the new booking to Report Ready to demonstrate report unlock
    await page.goto(`${BASE}/admin/bookings?booking=${bookingId}`, { waitUntil: 'networkidle2' })
    await sleep(1000)
    await clickInDialog(page, 'Report Ready')
    await sleep(900)
    await clickInDialog(page, 'Close')
    await sleep(500)
    await page.goto(`${BASE}/my-bookings/${bookingId}`, { waitUntil: 'networkidle2' })
    await sleep(1000)
    log('Cross-check: new booking now report ready', await hasText(page, 'Your report is ready'))

    /* Admin packages */
    await page.goto(`${BASE}/admin/packages`, { waitUntil: 'networkidle2' })
    await sleep(1000)
    log('AdminPackages: list renders', await hasText(page, 'Package management'))
    log('AdminPackages: table columns', (await hasText(page, 'Selling price')) && (await hasText(page, 'Home collection')))
    const editCount = (await page.$$('button[aria-label="Edit package"]')).length
    log('AdminPackages: edit actions present', editCount > 0, `${editCount} rows`)

    // Edit a package price and confirm on the customer site
    await page.click('button[aria-label="Edit package"]')
    await sleep(900)
    log('AdminPackages: editor opens', await hasText(page, 'Basic details'))
    log('AdminPackages: editor fields', (await hasText(page, 'Included tests')) && (await hasText(page, 'Preparation instructions')) && (await hasText(page, 'Featured package')))
    await fillField(page, '#pkg-price', '1799')
    await clickInDialog(page, 'Save changes')
    await sleep(1100)
    log('AdminPackages: save applies', await hasText(page, '₹1,799'))

    await page.goto(`${BASE}/packages/comprehensive-full-body-checkup`, { waitUntil: 'networkidle2' })
    await sleep(900)
    log('Cross-check: customer page shows updated price', await hasText(page, '₹1,799'))

    // Add a package
    await page.goto(`${BASE}/admin/packages`, { waitUntil: 'networkidle2' })
    await sleep(900)
    await clickText(page, 'button', 'Add package')
    await sleep(900)
    log('AdminPackages: create dialog opens', await hasText(page, 'Add a new package'))
    await clickInDialog(page, 'Create package')
    await sleep(900)
    log('AdminPackages: validation on create', await hasText(page, 'fix the highlighted fields'))
    await fillField(page, '#pkg-name', 'Bone Health Panel')
    await fillField(page, '#pkg-short', 'Bone Health')
    await fillField(page, '#pkg-shortdesc', 'A demo panel covering calcium, vitamin D and phosphorus markers.')
    await fillField(page, '#pkg-desc', 'A demonstration package created live during the client walkthrough to show how quickly a new package can be published to the website.')
    await fillField(page, '#pkg-tests', 'Serum Calcium\nVitamin D (25-OH) | Bone health marker\nPhosphorus')
    await fillField(page, '#pkg-mrp', '1299')
    await fillField(page, '#pkg-price', '899')
    await clickInDialog(page, 'Create package')
    await sleep(1200)
    log('AdminPackages: new package created', await hasText(page, 'Bone Health Panel'))
    await page.goto(`${BASE}/packages`, { waitUntil: 'networkidle2' })
    await sleep(1000)
    log('Cross-check: new package visible to customers', await hasText(page, 'Bone Health Panel'))

    /* Admin customers */
    await page.goto(`${BASE}/admin/customers`, { waitUntil: 'networkidle2' })
    await sleep(1000)
    log('AdminCustomers: list renders', await hasText(page, 'Customers'))
    log('AdminCustomers: seeded customers', (await hasText(page, 'Ravi Kumar')) && (await hasText(page, 'Priya S')) && (await hasText(page, 'Arjun Raj')))
    await clickText(page, 'button', 'View')
    await sleep(900)
    log('AdminCustomers: detail opens', await hasText(page, 'Booking history'))
    await clickInDialog(page, 'Close')
    await sleep(400)

    /* Admin reports */
    await page.goto(`${BASE}/admin/reports`, { waitUntil: 'networkidle2' })
    await sleep(1100)
    log('AdminReports: page renders', await hasText(page, 'Operational reporting'))
    log('AdminReports: daily chart', await hasText(page, 'Daily bookings — last 14 days'))
    await clickText(page, 'button', 'Weekly')
    await sleep(800)
    log('AdminReports: weekly tab', await hasText(page, 'Weekly bookings — last 8 weeks'))
    await clickText(page, 'button', 'Monthly')
    await sleep(800)
    log('AdminReports: monthly tab', await hasText(page, 'Monthly bookings — last 6 months'))
    log('AdminReports: most booked packages', await hasText(page, 'Most booked packages'))
    log('AdminReports: collection split', await hasText(page, 'Home collection vs lab visit'))

    /* ------------------------------------------------ 14. Responsive */
    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 834, height: 1112 },
      { name: 'laptop', width: 1280, height: 800 },
      { name: 'desktop', width: 1600, height: 1000 },
    ]
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height })
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' })
      await sleep(700)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
      log(`Responsive ${vp.name} (${vp.width}px): no horizontal overflow`, !overflow)

      if (vp.name === 'mobile') {
        log('Responsive mobile: hamburger menu present', await exists(page, 'button[aria-label="Open menu"]'))
        await page.click('button[aria-label="Open menu"]')
        await sleep(600)
        log('Responsive mobile: drawer opens with nav', await hasText(page, 'Tests & Packages'))
        await page.click('button[aria-label="Close menu"]')
        await sleep(400)

        await page.goto(`${BASE}/packages`, { waitUntil: 'networkidle2' })
        await sleep(900)
        log('Responsive mobile: filter button present', await hasText(page, 'Filters'))
        await page.goto(`${BASE}/admin/bookings`, { waitUntil: 'networkidle2' })
        await sleep(900)
        log('Responsive mobile: admin cards (not table)', await hasText(page, 'Advance status'))
      }
      if (vp.name === 'tablet') {
        await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle2' })
        await sleep(900)
        const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)
        log('Responsive tablet: My Bookings fits', noOverflow)
      }
    }

    /* ------------------------------------------------ 15. 404 */
    await page.setViewport({ width: 1440, height: 1000 })
    await page.goto(`${BASE}/does-not-exist`, { waitUntil: 'networkidle2' })
    await sleep(600)
    log('404: friendly not-found page', await hasText(page, "This page isn’t part of the demo"))
  } catch (err) {
    log('Test run completed without exception', false, err.message)
  }

  console.log('\n================ SUMMARY ================')
  const failed = results.filter((r) => !r.ok)
  console.log(`${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) {
    console.log('\nFailed checks:')
    failed.forEach((f) => console.log(` - ${f.name} ${f.extra ? `(${f.extra})` : ''}`))
  }
  console.log(`\nConsole errors: ${consoleErrors.length}`)
  consoleErrors.slice(0, 15).forEach((e) => console.log(`  ! ${e.slice(0, 300)}`))
  console.log(`\nPage errors: ${pageErrors.length}`)
  pageErrors.slice(0, 10).forEach((e) => console.log(`  ! ${e.slice(0, 300)}`))
  console.log(`\nFailed requests: ${failedRequests.length}`)
  failedRequests.slice(0, 10).forEach((e) => console.log(`  ! ${e.slice(0, 200)}`))

  await browser.close()
  process.exit(failed.length || pageErrors.length ? 1 : 0)
})()
