const puppeteer = require('puppeteer')
const path = require('path')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// Relative to this script, so the audit works on any machine.
const OUT = path.join(__dirname, 'screenshots')
const results = []
const log = (n, ok, x='') => { results.push({n, ok}); console.log(`${ok?'PASS':'FAIL'}  ${n}${x?` — ${x}`:''}`) }

const ROUTES = ['/', '/packages', '/packages/diabetes-care-package', '/my-bookings', '/my-bookings/bkg-114',
  '/about', '/contact', '/login', '/admin/login', '/book/thyroid-profile']

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-dev-shm-usage'] })
  const page = await browser.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()) })

  for (const w of [320, 375, 390, 430, 768, 834, 1024, 1366, 1440, 1920]) {
    await page.setViewport({ width: w, height: 900 })
    let worst = null
    for (const r of ROUTES) {
      await page.goto('http://localhost:5173'+r, { waitUntil: 'networkidle2' })
      await sleep(900)
      const m = await page.evaluate(() => ({
        over: document.documentElement.scrollWidth - window.innerWidth,
        path: location.pathname,
        // elements wider than viewport
        wide: [...document.querySelectorAll('body *')].filter(el => {
          const rect = el.getBoundingClientRect()
          return rect.width > window.innerWidth + 2 && getComputedStyle(el).overflowX !== 'auto' && el.scrollWidth > el.clientWidth + 2
        }).slice(0,3).map(el => el.tagName + '.' + (el.className||'').toString().slice(0,60))
      }))
      if (m.over > 2) worst = { route: m.path, over: m.over, wide: m.wide }
    }
    log(`No horizontal overflow @${w}px (10 routes)`, !worst, worst ? JSON.stringify(worst) : '')
  }

  // signed-in admin routes at 1024 and 1440
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' }); await sleep(800)
  await page.evaluate(() => [...document.querySelectorAll('button')].find(x=>x.textContent.includes('Fill these credentials'))?.click())
  await sleep(300)
  await page.evaluate(() => [...document.querySelectorAll('button')].find(x=>x.textContent.includes('Sign in to admin console'))?.click())
  await sleep(2000)
  for (const w of [320, 390, 768, 1024, 1366, 1440, 1920]) {
    await page.setViewport({ width: w, height: 900 })
    let bad = null
    for (const r of ['/admin/dashboard','/admin/bookings','/admin/packages','/admin/customers','/admin/reports']) {
      await page.goto('http://localhost:5173'+r, { waitUntil: 'networkidle2' }); await sleep(1000)
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (over > 2) bad = { r, over }
    }
    log(`Admin routes fit @${w}px`, !bad, bad ? JSON.stringify(bad) : '')
  }

  // Deep-link + back-button sanity
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://localhost:5173/packages', { waitUntil: 'networkidle2' }); await sleep(900)
  await page.goto('http://localhost:5173/packages/diabetes-care-package', { waitUntil: 'networkidle2' }); await sleep(800)
  await page.goBack(); await sleep(900)
  log('Browser back returns to catalogue', (await page.evaluate(()=>location.pathname)) === '/packages')

  // localStorage persistence check
  await page.goto('http://localhost:5173/my-bookings', { waitUntil: 'networkidle2' }); await sleep(1000)
  const before = await page.evaluate(() => document.body.innerText.match(/LAB-2026-\d+/g)?.length || 0)
  await page.reload({ waitUntil: 'networkidle2' }); await sleep(1200)
  const after = await page.evaluate(() => document.body.innerText.match(/LAB-2026-\d+/g)?.length || 0)
  log('Bookings persist across reload', before === after && before > 0, `${before} → ${after}`)

  await page.screenshot({ path: `${OUT}/final-mybookings-1440.png`, fullPage: false })
  console.log('\nRuntime errors:', errs.length)
  errs.slice(0,5).forEach(e => console.log('  !', e.slice(0,200)))
  const failed = results.filter(r=>!r.ok)
  console.log(`\n${results.length-failed.length}/${results.length} passed`)
  await browser.close()
  process.exit(failed.length || errs.length ? 1 : 0)
})()
