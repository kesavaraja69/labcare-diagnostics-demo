const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// Relative to this script, so screenshots land in the project on any machine.
const OUT = path.join(__dirname, 'screenshots')

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const page = await browser.newPage()

  const shot = async (name, path, { width = 1440, height = 1000, full = true, wait = 1200, pre } = {}) => {
    await page.setViewport({ width, height })
    await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle2' })
    await sleep(wait)
    if (pre) await pre()
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
    console.log('captured', name)
  }

  await shot('01-home-desktop', '/')
  await shot('02-catalogue', '/packages')
  await shot('03-package-details', '/packages/comprehensive-full-body-checkup')
  await shot('04-booking-step1', '/book/comprehensive-full-body-checkup', {
    pre: async () => {
      await page.evaluate(() => {
        const set = (sel, val) => {
          const el = document.querySelector(sel)
          if (!el) return
          const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val)
          el.dispatchEvent(new Event('input', { bubbles: true }))
        }
        set('#patient-name', 'Ravi Kumar')
        set('#patient-age', '38')
        const g = document.querySelector('#patient-gender')
        if (g) {
          Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(g, 'Male')
          g.dispatchEvent(new Event('change', { bubbles: true }))
        }
        set('#patient-mobile', '9876543210')
        set('#patient-email', 'ravi.kumar@example.com')
      })
      await sleep(600)
    },
  })
  await shot('05-my-bookings', '/my-bookings')
  await shot('06-booking-detail', '/my-bookings/bkg-114')
  await shot('07-admin-login', '/admin/login')

  // Admin screens with a signed-in session
  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' })
  await sleep(900)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Fill these credentials'))
    b && b.click()
  })
  await sleep(300)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Sign in to admin console'))
    b && b.click()
  })
  await sleep(2200)

  for (const [name, path] of [
    ['08-admin-dashboard', '/admin/dashboard'],
    ['09-admin-bookings', '/admin/bookings'],
    ['10-admin-packages', '/admin/packages'],
    ['11-admin-customers', '/admin/customers'],
    ['12-admin-reports', '/admin/reports'],
  ]) {
    await shot(name, path, { wait: 1400 })
  }

  // Mobile
  await shot('13-mobile-home', '/', { width: 390, height: 844 })
  await shot('14-mobile-booking', '/book/comprehensive-full-body-checkup', { width: 390, height: 844 })

  await browser.close()
  console.log('done')
})()
