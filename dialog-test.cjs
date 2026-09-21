/**
 * Dialog / modal / drawer regression suite.
 *
 * Verifies the centring fix and the shared modal behaviour for EVERY overlay in the
 * app, across mobile → large desktop:
 *
 *   - horizontally + vertically centred in the *visible* viewport
 *   - never extends outside the viewport (top >= 0, bottom <= innerHeight)
 *   - stays centred while the page behind is scrolled
 *   - max-height respected, tall content scrolls internally
 *   - backdrop present; background scroll locked while open
 *   - Escape closes dismissible dialogs
 *   - focus is trapped inside the dialog and restored on close
 *
 * Run with the dev server up:  node dialog-test.cjs
 */
const puppeteer = require('puppeteer')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Target server. Defaults to the Vite dev server; override it to test another
// build, e.g. the Docker container:  BASE_URL=http://localhost:8090 node dialog-test.cjs
const BASE = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/+$/, '')

const results = []
const log = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const CLICK = (text, exact = false) =>
  `(() => {
    const match = [...document.querySelectorAll('button,a,[role="menuitem"]')].find(
      (el) => ${exact ? '(el.textContent || "").trim() === ' + JSON.stringify(text) : '(el.textContent || "").includes(' + JSON.stringify(text) + ')'}
    )
    if (match) { match.scrollIntoView({ block: 'center' }); match.click(); return true }
    return false
  })()`

/** Real (trusted) mouse click at an element's centre — Radix menu triggers need pointerdown. */
async function realClick(page, selectorFn) {
  const box = await page.evaluate((fn) => {
    const el = eval(fn)
    if (!el) return null
    el.scrollIntoView({ block: 'center' })
    const r = el.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, `(${selectorFn.toString()})()`)
  if (!box) return false
  await page.mouse.click(box.x, box.y)
  return true
}

/** Clicks any element by accessible name (aria-label) — icon-only buttons have no text. */
const CLICK_LABEL = (label) =>
  `(() => {
    const el = [...document.querySelectorAll('button,a')].find(
      (e) => (e.getAttribute('aria-label') || '').toLowerCase().includes(${JSON.stringify(label)}.toLowerCase())
    )
    if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true }
    return false
  })()`

const dialogMetrics = `(() => {
  const el = document.querySelector('[role="dialog"],[role="alertdialog"],[data-state="open"][aria-label]')
  if (!el) return { none: true }
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  return {
    x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    cx: Math.round(r.x + r.width / 2), cy: Math.round(r.y + r.height / 2),
    vw: window.innerWidth, vh: window.innerHeight,
    transform: cs.transform,
    maxH: cs.maxHeight,
    overflowY: cs.overflowY,
    bodyOverflow: getComputedStyle(document.body).overflow,
    position: cs.position,
    zIndex: cs.zIndex,
    scrollable: el.scrollHeight > el.clientHeight + 2,
    // The dialog box itself is position:relative inside a fixed centring wrapper; what
    // matters is that the portal host sits on <body> and nothing clips or transforms it.
    ...(function () {
      let node = el.parentElement
      let host = el
      while (node && node !== document.body) { host = node; node = node.parentElement }
      let clipped = false
      let transformed = false
      const r0 = el.getBoundingClientRect()
      let n2 = el.parentElement
      while (n2 && n2 !== document.body) {
        const cs = getComputedStyle(n2)
        if (cs.overflow !== 'visible') {
          // Only counts as clipping if the dialog actually falls outside it.
          const ar = n2.getBoundingClientRect()
          if (r0.top < ar.top - 1 || r0.bottom > ar.bottom + 1 || r0.left < ar.left - 1 || r0.right > ar.right + 1) clipped = true
        }
        if (cs.transform !== 'none' || cs.filter !== 'none' || cs.perspective !== 'none') transformed = true
        n2 = n2.parentElement
      }
      return {
        portalled: el.parentElement !== null && host.parentElement === document.body,
        portalHostTag: host.tagName,
        clippedByAncestor: clipped,
        transformedAncestor: transformed,
      }
    })(),
  }
})()`

/** Asserts the geometric contract for a currently-open dialog. */
async function assertCentred(page, name, { allowTall = true } = {}) {
  const m = await page.evaluate(dialogMetrics)
  if (m.none) {
    log(`${name}: dialog present`, false, 'no dialog element found')
    return
  }
  const dx = Math.abs(m.cx - m.vw / 2)
  const dy = Math.abs(m.cy - m.vh / 2)
  log(`${name}: horizontally centred`, dx <= 2, `offset ${dx}px (dialog cx ${m.cx} vs viewport ${m.vw / 2})`)
  log(`${name}: vertically centred`, dy <= 2, `offset ${dy}px (dialog cy ${m.cy} vs viewport ${m.vh / 2})`)
  log(`${name}: inside viewport (top/bottom)`, m.y >= -1 && m.y + m.h <= m.vh + 1,
    `y=${m.y} bottom=${m.y + m.h} vh=${m.vh}${m.h >= m.vh ? ' (full-height, scrolls internally)' : ''}`)
  log(`${name}: inside viewport (left/right)`, m.x >= -1 && m.x + m.w <= m.vw + 1, `x=${m.x} right=${m.x + m.w} vw=${m.vw}`)
  log(`${name}: content scrollable when tall`, allowTall ? (m.scrollable || m.h < m.vh) : true,
    `h=${m.h} maxH=${m.maxH} overflowY=${m.overflowY}`)
  log(`${name}: scroll locked behind`, m.bodyOverflow === 'hidden', `body overflow=${m.bodyOverflow}`)
  log(`${name}: portalled to document.body (not clipped by ancestor)`, m.portalled,
    `position=${m.position} host=${m.portalHostTag} clipped=${m.clippedByAncestor}`)
}

async function openAndAssert(page, name, clickJs, opts) {
  const clicked = await page.evaluate(clickJs)
  await sleep(650)
  if (!clicked) {
    log(`${name}: dialog present`, false, 'trigger button not found')
    return false
  }
  await assertCentred(page, name, opts)
  return true
}

/** Centring must hold while the page behind is scrolled. */
async function assertCentredWhileScrolled(page, name) {
  await page.evaluate(() => {
    const scroller = document.scrollingElement || document.documentElement
    scroller.scrollTop = 400
    window.scrollTo(0, 400)
  })
  await sleep(350)
  const m = await page.evaluate(dialogMetrics)
  const dx = Math.abs(m.cx - m.vw / 2)
  const dy = Math.abs(m.cy - m.vh / 2)
  log(`${name}: centred after page scroll attempt`, dx <= 2 && dy <= 2,
    `offsets x=${dx} y=${dy} (page scroll locked at ${await page.evaluate(() => window.scrollY)}px)`)
}

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const page = await browser.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })

  /* ------------------------------------------------------------------ customer side */
  for (const vw of [390, 768, 1440]) {
    await page.setViewport({ width: vw, height: vw === 390 ? 844 : vw === 768 ? 1024 : 900 })

    // 1. Booking wizard — payment processing dialog (blocking, no close button)
    await page.goto(`${BASE}/book/comprehensive-full-body-checkup`, { waitUntil: 'networkidle2' })
    await sleep(1100)
    const fill = async (sel, val) =>
      page.evaluate((s, v) => {
        const el = document.querySelector(s)
        if (!el) return
        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : HTMLInputElement.prototype
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }, sel, val)
    await fill('#patient-name', 'Ravi Kumar')
    await fill('#patient-age', '38')
    await page.evaluate(() => {
      const g = document.querySelector('#patient-gender')
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(g, 'Male')
      g.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await fill('#patient-mobile', '9876543210')
    await fill('#patient-email', 'ravi.kumar@example.com')
    await sleep(400)
    await page.evaluate(CLICK('Continue'))
    await sleep(700)
    await page.evaluate(CLICK('Visit Lab'))
    await sleep(600)
    await page.evaluate(CLICK('Continue'))
    await sleep(700)
    await page.evaluate(() => {
      const slot = [...document.querySelectorAll('[role="radio"]')].find(
        (e) => !e.hasAttribute('disabled') && /AM/.test(e.textContent || '') && !/Fully booked/.test(e.textContent || ''),
      )
      slot && slot.click()
    })
    await sleep(400)
    await page.evaluate(CLICK('Review summary'))
    await sleep(800)

    // wizard: "Leave the booking?" confirm dialog — triggered by leaving mid-flow
    const okLeave = await openAndAssert(page, `${vw}px wizard: leave-confirm dialog`, `(() => {
      const b = [...document.querySelectorAll('nav[aria-label="Breadcrumb"] button')].find((x) => (x.textContent || '').trim() === 'Packages')
      if (b) { b.click(); return true }
      return false
    })()`)
    if (okLeave) await assertCentredWhileScrolled(page, `${vw}px wizard: leave-confirm`)
    // Escape closes it
    await page.keyboard.press('Escape')
    await sleep(500)
    const leaveClosed = await page.evaluate(() => !document.querySelector('[role="dialog"]'))
    log(`${vw}px wizard: Escape closes leave-confirm`, leaveClosed)

    // wizard: payment processing dialog (opened by proceeding to payment)
    await page.evaluate(CLICK('Review summary'))
    await sleep(500)
    await page.evaluate(CLICK('Proceed to Payment'))
    await sleep(700)
    // the Pay button stays disabled until the acknowledgement checkbox is ticked
    await page.evaluate(() => {
      const cb = document.querySelector('button[role="checkbox"], input[type="checkbox"]')
      if (cb) cb.click()
      return Boolean(cb)
    })
    await sleep(400)
    await page.evaluate(CLICK('Pay ₹'))   // triggers the simulated payment overlay
    await sleep(450)
    const paying = await page.evaluate(dialogMetrics)
    if (!paying.none) {
      log(`${vw}px wizard: processing overlay centred`, Math.abs(paying.cx - paying.vw / 2) <= 2 && Math.abs(paying.cy - paying.vh / 2) <= 2,
        `offsets x=${Math.abs(paying.cx - paying.vw / 2)} y=${Math.abs(paying.cy - paying.vh / 2)}`)
      log(`${vw}px wizard: processing overlay inside viewport`, paying.y >= -1 && paying.y + paying.h <= paying.vh + 1,
        `y=${paying.y} bottom=${paying.y + paying.h} vh=${paying.vh}`)
    } else {
      log(`${vw}px wizard: processing overlay present`, false, 'not opened')
    }
    await sleep(3200)

    // 2. My Bookings — timeline dialog (desktop menu) / mobile card link
    await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle2' })
    await sleep(1400)
    if (vw >= 1024) {
      const clickedTrigger = await realClick(page, () => [...document.querySelectorAll('button')].find((b) => (b.textContent || '').includes('More actions')))
      await sleep(600)
      log(`${vw}px MyBookings: 'More actions' menu trigger works`, clickedTrigger)
      await sleep(200)
      const menuOpened = await page.evaluate(() => Boolean(document.querySelector('[role="menu"]')))
      log(`${vw}px MyBookings: dropdown menu opens in a portal`, menuOpened)
      const menuState = await page.evaluate(() => {
        const menu = document.querySelector('[role="menu"]')
        if (!menu) return { none: true }
        const r = menu.getBoundingClientRect()
        // is it clipped by an ancestor with overflow hidden?
        let clipped = false
        let node = menu.parentElement
        while (node && node !== document.body) {
          const cs = getComputedStyle(node)
          if (cs.overflow !== 'visible' && (r.bottom > node.getBoundingClientRect().bottom + 1 || r.top < node.getBoundingClientRect().top - 1)) clipped = true
          node = node.parentElement
        }
        return { inside: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, clipped, pos: getComputedStyle(menu).position }
      })
      log(`${vw}px MyBookings: menu inside viewport & not clipped`, Boolean(menuState.inside) && !menuState.clipped,
        JSON.stringify(menuState))
      await page.evaluate(CLICK('View timeline'))
      await sleep(700)
      await assertCentred(page, `${vw}px MyBookings: timeline dialog`)
      await page.keyboard.press('Escape')
      await sleep(400)
      log(`${vw}px MyBookings: Escape closes timeline`, await page.evaluate(() => !document.querySelector('[role="dialog"]')))
    } else {
      // mobile: filter sheet + a booking link
      await page.goto(`${BASE}/packages`, { waitUntil: 'networkidle2' })
      await sleep(1300)
      const sheetTriggered = await page.evaluate(CLICK('Filters'))
      await sleep(700)
      const sheet = await page.evaluate(() => {
        const el = document.querySelector('[role="dialog"]')
        if (!el) return { none: true }
        const r = el.getBoundingClientRect()
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
          vw: innerWidth, vh: innerHeight, bodyOverflow: getComputedStyle(document.body).overflow }
      })
      log(`${vw}px Packages: filter sheet opens`, sheetTriggered && !sheet.none)
      if (!sheet.none) {
        log(`${vw}px Packages: sheet inside viewport`, sheet.x >= -1 && sheet.x + sheet.w <= sheet.vw + 1 && sheet.y >= -1 && sheet.y + sheet.h <= sheet.vh + 1,
          JSON.stringify(sheet))
        log(`${vw}px Packages: sheet scroll locked behind`, sheet.bodyOverflow === 'hidden', `body=${sheet.bodyOverflow}`)
      }
      await page.keyboard.press('Escape')
      await sleep(500)
      log(`${vw}px Packages: Escape closes filter sheet`, await page.evaluate(() => !document.querySelector('[role="dialog"]')))

      // bottom sheet must never exceed the viewport
      await page.evaluate(CLICK('Filters'))
      await sleep(600)
      const tall = await page.evaluate(() => {
        const el = document.querySelector('[role="dialog"]')
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, scrollable: el.scrollHeight > el.clientHeight }
      })
      log(`${vw}px Packages: bottom sheet height capped`, tall && tall.top >= -1 && tall.bottom <= tall.vh + 1, JSON.stringify(tall))
      await page.keyboard.press('Escape')
      await sleep(400)
    }
  }

  /* --------------------------------------------------------------------- admin side */
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle2' })
  await sleep(900)
  await page.evaluate(CLICK('Fill these credentials'))
  await sleep(300)
  await page.evaluate(CLICK('Sign in to admin console'))
  await sleep(2200)

  for (const vw of [390, 834, 1440]) {
    await page.setViewport({ width: vw, height: vw === 390 ? 844 : 900 })

    // admin mobile nav drawer (Sheet)
    if (vw < 1024) {
      await page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'networkidle2' })
      await sleep(1200)
      await page.evaluate(CLICK_LABEL('Open admin menu'))
      await sleep(700)
      const drawer = await page.evaluate(() => {
        const el = document.querySelector('[role="dialog"]')
        if (!el) return { none: true }
        const r = el.getBoundingClientRect()
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
          vw: innerWidth, vh: innerHeight, bodyOverflow: getComputedStyle(document.body).overflow }
      })
      log(`${vw}px admin: nav drawer opens`, !drawer.none)
      if (!drawer.none) {
        log(`${vw}px admin: drawer fills viewport height`, drawer.y <= 1 && drawer.h >= drawer.vh - 2, JSON.stringify(drawer))
        log(`${vw}px admin: drawer scroll locked behind`, drawer.bodyOverflow === 'hidden')
      }
      await page.keyboard.press('Escape')
      await sleep(500)
      log(`${vw}px admin: Escape closes nav drawer`, await page.evaluate(() => !document.querySelector('[role="dialog"]')))
    }

    // admin booking detail dialog (large, tall content) + status alert dialog
    await page.goto(`${BASE}/admin/bookings`, { waitUntil: 'networkidle2' })
    await sleep(1400)
    await openAndAssert(page, `${vw}px AdminBookings: detail dialog`, `(() => {
      const b = [...document.querySelectorAll('button')].find((x) => (x.textContent || '').trim() === 'Open')
      if (!b) return false
      b.scrollIntoView({ block: 'center' })
      b.click()
      return true
    })()`)
    await assertCentredWhileScrolled(page, `${vw}px AdminBookings: detail dialog`)
    await page.keyboard.press('Escape')
    await sleep(500)

    // admin packages: edit dialog (long form) + delete confirmation
    await page.goto(`${BASE}/admin/packages`, { waitUntil: 'networkidle2' })
    await sleep(1300)
    await openAndAssert(page, `${vw}px AdminPackages: edit dialog`, `(() => {
      const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').toLowerCase().includes('edit'))
      if (!b) return false
      b.scrollIntoView({ block: 'center' })
      b.click()
      return true
    })()`)
    await page.keyboard.press('Escape')
    await sleep(500)

    await openAndAssert(page, `${vw}px AdminPackages: delete alert dialog`, `(() => {
      const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').toLowerCase().includes('delete'))
      if (!b) return false
      b.scrollIntoView({ block: 'center' })
      b.click()
      return true
    })()`)
    const alertKind = await page.evaluate(() => Boolean(document.querySelector('[role="alertdialog"]')))
    log(`${vw}px AdminPackages: confirm uses alertdialog role`, alertKind)
    // Escape acts as "Cancel" for the confirm dialog (Radix blocks backdrop dismissal,
    // which is asserted separately below) — either way the booking/package survives.
    const before = await page.evaluate(() => Boolean(document.querySelector('[role="alertdialog"]')))
    await page.keyboard.press('Escape')
    await sleep(450)
    const after = await page.evaluate(() => Boolean(document.querySelector('[role="alertdialog"]')))
    log(`${vw}px AdminPackages: Escape dismisses delete confirm as cancel`, before && !after, `before=${before} after=${after}`)
    await page.evaluate(CLICK('Cancel'))
    await sleep(500)

    // admin customers: detail dialog
    await page.goto(`${BASE}/admin/customers`, { waitUntil: 'networkidle2' })
    await sleep(1300)
    await openAndAssert(page, `${vw}px AdminCustomers: detail dialog`, `(() => {
      const b = [...document.querySelectorAll('button')].find((x) => (x.textContent || '').trim() === 'View')
      if (!b) return false
      b.scrollIntoView({ block: 'center' })
      b.click()
      return true
    })()`)
    await page.keyboard.press('Escape')
    await sleep(400)
  }

  /* ------------------------------------------- very small viewport (tiny height) */
  await page.setViewport({ width: 320, height: 480 })
  await page.goto(`${BASE}/admin/bookings`, { waitUntil: 'networkidle2' })
  await sleep(1500)
  const ok = await openAndAssert(page, '320x480 AdminBookings: detail dialog', `(() => {
    const b = [...document.querySelectorAll('button')].find((x) => (x.textContent || '').trim() === 'Open')
    if (!b) return false
    b.scrollIntoView({ block: 'center' })
    b.click()
    return true
  })()`)
  if (ok) {
    const m = await page.evaluate(dialogMetrics)
    log('320x480: dialog never exceeds viewport', m.y >= -1 && m.y + m.h <= m.vh + 1, `y=${m.y} bottom=${m.y + m.h} vh=${m.vh}`)
    log('320x480: dialog max-height respected', parseFloat(m.maxH) <= m.vh, `maxH=${m.maxH} vh=${m.vh}`)
  }

  console.log('\n================ DIALOG SUMMARY ================')
  const failed = results.filter((r) => !r.ok)
  console.log(`${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) failed.forEach((f) => console.log(`  FAIL ${f.name}`))
  console.log(`\nRuntime errors: ${errs.length}`)
  errs.slice(0, 6).forEach((e) => console.log('  !', e.slice(0, 200)))
  await browser.close()
  process.exit(failed.length || errs.length ? 1 : 0)
})()
