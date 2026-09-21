# LabCare Diagnostics — Online Test & Health Package Booking

**Accurate Testing. Easy Booking. Better Healthcare.**

An interactive demonstration of a booking platform for a **diagnostic laboratory** in Rajapalayam, Tamil Nadu.
Customers browse health packages, compare included tests and prices, complete a five-step booking journey with
home sample collection or a lab visit, simulate payment, and track their sample through to a digital report. A
separate admin console lets the laboratory manage bookings, packages, customers and reporting.

> **This is a client demonstration, not a production system.**
> Every package, price, patient, booking, report, phone number, email address and credential in this app is
> **fictional sample data**. No real payment gateway, laboratory API, messaging provider or patient record is
> connected anywhere. Payment is simulated and labelled as such throughout.

---

## Table of contents

1. [Run locally](#run-locally)
2. [Technology stack](#technology-stack)
3. [Current architecture](#current-architecture)
4. [Demo credentials](#demo-credentials)
5. [Client demonstration script](#client-demonstration-script)
6. [Docker](#docker)
7. [What's in the demo data](#whats-in-the-demo-data)
8. [Business model mapping](#business-model-mapping)
9. [UX & accessibility notes](#ux--accessibility-notes)
10. [Compliance / safety guardrails](#compliance--safety-guardrails)
11. [Production readiness review](#production-readiness-review)
12. [Current demo stack vs recommended production stack](#current-demo-stack-vs-recommended-production-stack)
13. [Recommended production stack](#recommended-production-stack)
14. [Suggested next steps for production](#suggested-next-steps-for-production)

---

## Run locally

### Normal development

```bash
npm install
npm run dev            # Vite dev server → http://localhost:5173
```

### Production build (no Docker)

```bash
npm run build          # tsc --noEmit && vite build  → dist/
npm run preview        # serve dist/ → http://localhost:4173
```

### Type checking

```bash
npm run typecheck      # tsc --noEmit
```

### Docker

```bash
# 1. Create your environment file (safe placeholders by default)
cp .env.example .env

# 2. Build the production image
docker build -t labcare-diagnostics:local .

# 3. Run it
docker run --rm -p 8585:8080 labcare-diagnostics:local   # → http://localhost:8585

# --- or with Docker Compose ---
docker compose up -d --build         # start (build if needed)
docker compose ps                    # status + health
docker compose logs -f web           # follow logs
docker compose restart web           # restart after a config change
docker compose up -d --build --force-recreate   # rebuild + recreate containers
docker compose down                  # stop and remove containers
docker compose down -v               # also delete named volumes (wipes the DB volume)
```

Optional PostgreSQL (not used by the current demo — see
[Current demo stack vs recommended production stack](#current-demo-stack-vs-recommended-production-stack)).
It lives in a separate overlay file so the base stack never depends on it:

```bash
cp .env.example .env    # set POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB first
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up -d
```

Full Docker documentation — prerequisites, ports, volumes, health checks, troubleshooting:
[`docs/docker.md`](docs/docker.md).

### Verification scripts

Browser-driven scripts that run against a live server (they use Puppeteer, installed outside this project):

```bash
npm run dev                    # in one terminal
node e2e-test.cjs              # full 20-step flow + cross-checks + responsive + 404
node responsive-audit.cjs      # overflow / layout audit at 8 viewport widths
node dialog-test.cjs           # every dialog, modal sheet and menu across breakpoints
node screenshots.cjs           # writes reference screenshots to screenshots/
```

---

## Technology stack

Everything listed below is **actually present in this repository**. Nothing is aspirational — items that the
demo does not have (a backend, a database, linting, a test runner) are listed as `none` and covered later in the
production sections.

| Area | What this project actually uses |
|---|---|
| **Frontend framework** | React 18.3.1 — client-side SPA (no SSR/Next.js) |
| **Language** | TypeScript 5.6, `strict` mode, path alias `@/*` → `src/*` |
| **Build tool** | Vite 5.4.21 with `@vitejs/plugin-react` 4.7.0 |
| **CSS framework** | Tailwind CSS 3.4.19 (PostCSS 8 + Autoprefixer); design tokens in `tailwind.config.js` |
| **Component library** | shadcn/ui-style primitives written by hand on **Radix UI** (17 `@radix-ui/react-*` packages: dialog, alert-dialog, tabs, select, switch, checkbox, radio-group, accordion, tooltip, progress, separator, label, slot, …) |
| **Icons** | `lucide-react`, via an explicit 23-icon registry (`src/components/brand/IconRegistry.tsx`) to keep the bundle small |
| **Routing** | `react-router-dom` 6.30.6 — `BrowserRouter`, declarative `<Routes>`, lazy-loaded admin routes |
| **State management** | React Context + hooks only (`src/store/DemoStore.tsx`). No Redux/Zustand/Jotai |
| **Form handling** | Controlled React state and hand-rolled step state in the booking wizard. No `react-hook-form` |
| **Validation** | Hand-written validators in `src/lib/validation.ts` (field + address sanitising). No zod/yup |
| **Backend technology** | **None** — the app is 100% client-side |
| **API architecture** | Typed service *interfaces* in `src/services/api.ts` (`AuthService`, `PackageService`, `BookingService`, `CustomerService`, `PaymentService`, `NotificationService`, `ReportService`, `AnalyticsService`) that describe the intended REST surface. No HTTP calls are made |
| **Database** | **None** — demo data lives in the browser (`localStorage`, namespace `labcare.demo.v1.*`) |
| **Authentication** | Mock, in-browser only: credentials compared against constants, session persisted to `localStorage`. No tokens, no server |
| **File storage** | **None** — images are static files bundled in `public/images/`. Receipts/reports are generated as printable HTML in a new tab (no server round-trip) |
| **Payment architecture** | **Simulated** — a multi-stage `setTimeout` progress dialog. Four methods (UPI / Card / Net Banking / Cash at Lab) plus "Pay at Laboratory"; no gateway, no card data |
| **Charting** | Hand-rolled dependency-free SVG components (`src/components/charts/Charts.tsx`): area, bar, donut, horizontal bars, sparkline |
| **Testing** | Puppeteer-driven scripts run directly with `node` (`e2e-test.cjs` — 120 checks; `responsive-audit.cjs`; `dialog-test.cjs`). No Jest/Vitest/Playwright runner, no unit tests |
| **Linting** | **No ESLint/Prettier config.** Type safety comes from `tsc --noEmit` (`npm run typecheck`, also enforced by `npm run build`) |
| **Formatting** | **None configured** (no Prettier/EditorConfig) — code follows a consistent hand-maintained style |
| **Package manager** | npm 10.8.2 with a committed `package-lock.json` (`npm ci` in Docker) |
| **Node version** | Node 20 (`node:20-alpine` build stage) |
| **Docker** | Multi-stage `Dockerfile` → `nginxinc/nginx-unprivileged:1.27-alpine` runtime, runs as uid 101 |
| **Docker Compose** | `docker-compose.yml` (web) + `docker-compose.postgres.yml` (optional, overlay file) |
| **Reverse proxy / web server** | nginx inside the container (`docker/nginx.conf`): SPA history fallback, gzip, immutable asset caching, security headers |
| **Environment variables** | `.env.example` + build args for `VITE_*` (client bundle) and Compose runtime vars. No secrets required by the demo |

---

## Current architecture

Written for a developer who did not build this project.

### How the frontend works

It is a **static single-page application**. `index.html` loads `src/main.tsx`, which composes the provider tree:

```
StrictMode → BrowserRouter → DemoProvider → ToastProvider → TooltipProvider → App
```

`DemoProvider` is the application's single source of truth. It hydrates from `localStorage` on first paint, and
every page reads through hooks (`usePackages`, `useBookings`, `useAuth`, `useAdminStats`, …) rather than touching
storage directly. `App.tsx` wraps the route table in a `HydrationGate`, so users see a loader instead of a flash
of empty data while the store hydrates.

### How routing works

Route configuration lives in `src/App.tsx`:

- `/`, `/packages`, `/packages/:slug`, `/book/:slug`, `/booking-confirmation/:id`, `/my-bookings`,
  `/my-bookings/:id`, `/about`, `/contact`, `/login` are wrapped in `PublicLayout` (header, footer, mobile drawer).
  Any unmatched path inside that layout renders a friendly 404.
- `/admin/login` is standalone. `/admin` uses `AdminLayout`, which guards on the session and redirects
  unauthenticated visitors to `/admin/login`; its children are `dashboard`, `bookings`, `packages`, `customers`
  and `reports`.
- Customer booking routes are imported eagerly so the booking journey feels instant; the admin console and
  secondary pages are `React.lazy` chunks. A `ScrollToTop` component resets scroll on navigation.

### How data flows

```
localStorage (labcare.demo.v1.*)
        ▲                    │
        │ persisted writes   │ read on hydrate
        │                    ▼
   DemoStore (React Context)  ──► hooks ──► pages & components
        ▲
        │ seeded from
   src/data/*.ts  (packages, bookings, customers, CMS, lab profile, report templates)
```

Two directions are important:

1. **Seed → store.** On first load the store copies the seeded demo data (`PACKAGES`, `SEED_BOOKINGS`, customers)
   into `localStorage` and continues booking numbering from a stored sequence (`LAB-<year>-000000`).
2. **Mutations → everyone.** Every action (`createBooking`, `advanceBookingStatus`, `updatePackage`,
   `cancelBooking`, `resetDemo`) writes through the store, persists, and re-renders every subscribed screen. That
   is why an admin status change is instantly visible on the customer's My Bookings page.

### How booking works

`/book/:slug` renders a five-step wizard: **Patient → Collection → Date & Time → Summary → Payment**.

- Patient and address fields are validated by `src/lib/validation.ts`; an error summary appears above the form
  and each field gets `aria-invalid` plus an inline message.
- Collection method is either *Visit Lab* or *Home Sample Collection*; the latter requires address, area,
  pincode and reveals the ₹100 collection fee in the summary.
- Dates come from a 14-day strip; the five slots (6:00–11:00 AM) are enabled or disabled by `isSlotAvailable`,
  which is deterministic so a given date always shows the same availability during a demo.
- The draft is autosaved to `StorageKeys.draft` and restored (with a toast) if the visitor returns.
- Payment is simulated: a blocking dialog advances through stages with `setTimeout`, then either produces an
  online reference (`DEMO-<XXX>-######`) or marks the booking *Pay at Lab*.
- `createBooking` writes the booking with status `Pending`, persists it, and navigation moves to
  `/booking-confirmation/:id`.

### How admin functionality works

The admin console is a separate shell (`AdminLayout`) over the same store, so it manipulates the exact same data
the customer sees:

- **Dashboard** — six metric cards with sparklines, 14-day booking trend, 8-week revenue bars, collection-type
  and source donuts, popular packages, recent bookings with inline confirm, pending queue, CSV export.
- **Bookings** — search plus status/date/collection filters, a table on desktop and cards on mobile, a detail
  dialog, status transitions driven by `updateBookingStatus`, cancellation, and per-view CSV.
- **Packages** — full CRUD over the catalogue: create/edit validated dialogs, duplicate-as-draft, delete with a
  booking-count warning, enable/disable and featured toggles, preview and "open live page".
- **Customers** — merges seeded customers with customers derived from actual bookings, so spend and counts stay
  live; a drawer shows contact panels, booking history and per-booking timelines.
- **Reports** — Daily / Weekly / Monthly tabs, KPI cards with delta pills, popular packages, home-vs-lab split,
  status distribution, and CSV export (including an all-data export with UTF-8 BOM for Excel).

### Where mock data is stored

- **Seed data**: TypeScript modules in `src/data/` — `packages.ts` (15 packages), `bookings.ts` (21 bookings,
  sequence 108–128), `customers.ts` (12 customers), `cms.ts` (FAQs, testimonials, trust strip, time slots),
  `lab.ts` (lab profile), `reports.ts` (demo report generator).
- **Runtime data**: browser `localStorage` under the `labcare.demo.v1` namespace via `src/store/storage.ts`,
  with a versioned key scheme and a `resetDemoStorage()` helper. Nothing leaves the browser.

### How state is managed

One React Context (`DemoProvider`) exposing domain hooks, with persistence on every mutation and a
`hydrated` flag for gating first paint. Local UI state (open dialog, current wizard step, filters) stays in
component state. Server-state libraries (React Query/SWR) are unnecessary while there is no server.

### How dialogs are implemented

All overlays are Radix-based and come from four shared primitives:

| Primitive | File | Used for |
|---|---|---|
| `Dialog` | `src/components/ui/dialog.tsx` | booking confirmation, timeline, admin detail/edit dialogs, payment progress |
| `AlertDialog` | `src/components/ui/alert-dialog.tsx` | destructive confirmations (delete package, cancel booking, reset demo data) |
| `Sheet` | `src/components/ui/sheet.tsx` | mobile navigation drawer, admin nav drawer, catalogue filter bottom sheet |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` | per-booking "More actions" menu |

Centring is done by a **viewport-fixed flex wrapper**, not by transform utilities — see the header comment in
`dialog.tsx`. This matters: an entrance animation that writes `transform` can silently cancel
`-translate-x-1/2 -translate-y-1/2` centring, which is exactly the bug this project had. Because the wrapper is
`position: fixed` with `inset: 0`, dialogs stay centred while the page behind is scrolled; because everything is
portalled to `document.body`, they cannot be clipped by an ancestor's `overflow: hidden` or a transformed
container. Radix supplies the backdrop, body scroll lock, Escape handling, focus trap and focus restore. A shared
`zIndex` scale in `tailwind.config.js` (`header 40 < overlay 60 < modal 61 < popover 70 < toast 100`) keeps
layering predictable.

### How the project is built

`npm run build` runs `tsc --noEmit` first (a type error fails the build) and then `vite build`, emitting hashed
assets to `dist/`. Route-level code splitting keeps the initial JS payload around 540 kB (≈160 kB gzipped);
hand-rolled SVG charts avoid a charting dependency entirely.

### How the application is deployed

There is no server to deploy, so the Docker image is a static-file image:

1. Stage 1 (`node:20-alpine`) installs dependencies with `npm ci`, copies the source and runs `npm run build`.
2. Stage 2 (`nginxinc/nginx-unprivileged:1.27-alpine`) receives only `dist/` and `docker/nginx.conf`, runs as
   **uid 101 (non-root)** on port **8080**, and answers `/healthz` for health checks.

nginx handles the SPA history fallback (`try_files … /index.html`), caches hashed `/assets/` immutably, gzips
text responses, and sends baseline security headers. Configuration is driven by `.env` / build args; no secrets
are baked in.

---

## Demo credentials

Shown openly in the UI (login page and admin header) — this is intentional for a client demo.

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@labcare-demo.in` | `Demo@12345` |
| **Patient** (demo account) | `ravi.kumar@example.com` | `Demo@12345` |

Authentication is a **mock**: credentials are checked in the browser only. No token is issued and no real account
exists.

---

## Client demonstration script

Follow this order — the whole journey is functional, including cross-checking admin changes on the customer site.

| # | Step | What to show |
|---|---|---|
| 1 | Open `/` | Hero, trust indicators, six popular packages with MRP/offer/discount, "Why Choose LabCare", FAQ |
| 2 | Click **Explore Health Packages** | Catalogue with search, category filters, price range, sorting, grid/list views, load-more |
| 3 | Search "thyroid" | Live filtering across package names, descriptions and included tests |
| 4 | Open **Comprehensive Full Body Checkup** | Rating, 12 tests, MRP ₹2,499 / offer ₹1,999 / 20% off, home collection, tabs for About, **Included tests**, Preparation, Collection & reports, sticky price rail |
| 5 | Click **Book This Package** | 5-step wizard: Patient → Collection → Date & Time → Summary → Payment |
| 6 | Leave fields empty and press Continue | Inline validation + error summary ("Please correct the highlighted patient details") |
| 7 | Fill patient details (use placeholders) | Age/gender/mobile/email validation, "save details" switch, demo-data warning |
| 8 | Choose **Home Sample Collection** | Address, area, city, pincode, landmark — and the ₹100 collection fee shown up front |
| 9 | Pick a date and slot | 14-day date strip with per-day slot counts; some slots deliberately unavailable ("Fully booked") |
| 10 | Review the **Booking Summary** | Package, patient, collection, address, date, time, MRP, discount, collection fee, final total (₹2,099) |
| 11 | **Proceed to Payment** → pick UPI / Card / Net Banking / Cash at Lab | Simulated 4-stage payment overlay with progress; "Cash at Lab" creates a *Pay at Lab* booking instead |
| 12 | Confirmation page | **Booking Confirmed**, booking ID `LAB-2026-0001xx`, status *Booking Received*, timeline, **Download Receipt** (printable demo receipt), **Book Another Test**, **Contact Lab** |
| 13 | Open **My Bookings** | All seeded demo bookings, summary tiles, filter tabs, timeline progress bars, report-ready banners |
| 14 | Open any booking → **Timeline** tab | Booking Placed → Confirmed → Sample Collection → Sample Collected → Processing → Report Ready → Completed, with timestamps and who acted |
| 15 | Open a *Report Ready* booking | **View Report / Download Report** with a clearly labelled *DEMO REPORT — NOT A REAL MEDICAL REPORT* |
| 16 | Go to `/admin` | Redirects to admin sign-in; credentials are printed on the page. Click "Fill these credentials automatically" → **Sign in to admin console** |
| 17 | Admin **Dashboard** | Today's bookings, pending, confirmed, completed, today's revenue, total customers; booking trend, revenue trend, popular packages, booking source, collection type |
| 18 | Admin **Bookings** → open the booking you just created | Details dialog; click **Report Ready** (or Advance through the flow) |
| 19 | Return to **My Bookings** on the customer site | The same booking now shows *Report Ready* and the demo report is unlocked — **the status change propagates instantly** |
| 20 | Admin **Packages** → edit any package (e.g. change the selling price) | Editor with name, category, description, image, included tests, MRP, selling price, discount (auto-calculated), home collection, preparation, report availability, status, featured |
| 21 | Return to the customer catalogue / package page | The edited price and content are reflected |
| 22 | Admin **Packages** → **Add package** | Create a package live (Bone Health Panel, ₹899) — it appears in the customer catalogue immediately |
| 23 | Admin **Customers** | Customer list with phone, email, bookings, total amount, last booking; open a customer for full booking history and timelines |
| 24 | Admin **Reports** | Daily / weekly / monthly bookings, revenue, most booked packages, home collection vs lab visit, cancellation count, CSV export |
| 25 | Sidebar → **Reset demo data** | Restores all seeded packages, bookings and statuses for the next presentation |

**Tip:** resize the browser at any point to show mobile (390px), tablet (834px) and desktop (1600px) layouts.
Tables become cards, the header becomes a slide-in drawer, and the booking wizard stays comfortable on small screens.

---

## Docker

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build: `node:20-alpine` compiles the SPA → `nginx-unprivileged` serves it as uid 101 |
| `docker-compose.yml` | Base stack — the `web` service, zero required configuration |
| `docker-compose.postgres.yml` | Optional overlay adding a PostgreSQL service (separate file so it cannot break the base stack) |
| `docker/nginx.conf` | SPA fallback, gzip, immutable asset caching, `/healthz` |
| `docker/security-headers.conf` | CSP and security headers — included by the server block and by every location that sets its own headers, since a nested `add_header` replaces inheritance |
| `.dockerignore` | Keeps `node_modules`, `dist`, `.env`, screenshots and test scripts out of the build context |
| `.env.example` | Every variable the stack understands, with safe placeholders |

Highlights: multi-stage build with dependency-layer caching (`package*.json` copied before source), non-root
runtime user, container `HEALTHCHECK` plus a Compose healthcheck on `/healthz`, named volume for database data,
log rotation, and **no secrets in the image or in Compose defaults** — `postgres` deliberately refuses to start
without `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` from your `.env`, and its port is not published.

Environment variables fall into two groups:

- **Build-time (`VITE_*`)** — inlined into the client bundle by Vite. Public by definition; never put a secret here.
- **Runtime** — `APP_PORT` for Compose; `POSTGRES_*` for the optional database service.

See [`docs/docker.md`](docs/docker.md) for prerequisites, ports, volumes, health checks and troubleshooting.

---

## What's in the demo data

- **15 diagnostic packages** across 8 categories (Full Body, Diabetes, Thyroid, Women's Health, Men's Health,
  Senior Care, Preventive Health, Individual Blood Tests) with realistic included-test lists, MRP, offer price,
  discount, fasting notes, preparation instructions and report turnaround.
- **21 seeded bookings** covering every status: Pending, Confirmed, Sample Collection Scheduled, Sample
  Collected, Processing, Report Ready, Completed and Cancelled.
- **12 seeded customers** (Ravi Kumar, Priya S, Arjun Raj, Meena Devi, Karthik M and more) with booking history.
- **5 demo time slots** (6:00 AM – 11:00 AM) with deterministic availability.
- **6 FAQs, 6 "why choose" cards, 3 testimonials**, lab profile, service areas and opening hours.

All of it is fictional. Bookings placed during a demo are appended to the seeded list and persist in the browser.

---

## Business model mapping

| E-commerce idea | LabCare concept |
|---|---|
| Product | **Health Package / Individual Test** |
| Order | **Booking** |
| Customer | **Patient** |
| Fulfilment | **Sample Collection appointment** (home visit or lab visit) |
| Buy Now | **Book Now** |
| Shipping details | **Patient Details / Collection Address** |
| Order tracking | **Booking timeline** (sample journey) |
| Invoice | **Booking receipt / Diagnostic report** |

Explicitly **not** built: physical product shipping, courier integration, warehouse or inventory management,
supplier management, marketplaces, seller accounts, real payment processing, real messaging integration and real
laboratory API integration.

---

## UX & accessibility notes

- Loading skeletons for the catalogue, my-bookings list and page-level hydration.
- Empty states everywhere results can be empty (search, filters, no bookings, no customers).
- Success states (booking confirmed, receipt/report generated, package saved) and error states (validation
  summaries, failed admin sign-in).
- Toast notifications with dismiss and optional action; confirmation dialogs before every destructive action.
- Accessible form labels on every field, `aria-invalid`, `role="alert"` error text, visible keyboard focus rings,
  keyboard-operable Radix dialogs/menus, and an `aria-live` toast region.
- Modal behaviour on every overlay: backdrop, background scroll lock, Escape to close, focus trap and focus
  restore. `AlertDialog` confirmations intentionally resist backdrop dismissal so destructive actions need an
  explicit choice.
- Subtle transitions only — hover lifts, fade/slide on step changes, one progress animation.
- Responsive from 320px to ultrawide: mobile drawer navigation, filter bottom sheet, booking summary in the
  wizard rail, admin tables converted to cards under 1024px.

---

## Compliance / safety guardrails

- No real patient information — demo data only, with an explicit warning on the patient form.
- No medical diagnosis claims. Report pages carry **DEMO REPORT — NOT A REAL MEDICAL REPORT**, and preparation
  sections state that the app does not provide medical advice.
- No real payment credentials are ever requested; the payment screen states the flow is simulated.
- Contact details, registration numbers and the lab address are labelled as fictional demo information.
- Package contents are labelled as demo contents throughout catalogue, detail and admin screens.

---

## Production readiness review

An honest audit of the demo against a real diagnostic-booking website. Nothing here claims readiness that the
code does not have.

### Frontend

| Aspect | Assessment |
|---|---|
| **Scalability** | Good for a content-driven catalogue. Route-level code splitting and a small initial bundle scale fine. There is no pagination or virtualisation on the customer catalogue, and admin tables render every row — acceptable at 15 packages / 21 bookings, not at 10k bookings. |
| **Performance** | Strong baseline: lazy admin routes, hashed immutable assets, gzip, no charting dependency, images served statically. Not yet addressed: images are full-size JPEGs with no `srcset`/AVIF/WebP, no `loading="lazy"`, no service worker, and 6 images are preloaded on the home page. |
| **Accessibility** | Better than typical demo quality: labelled inputs, `aria-invalid`, error announcements, keyboard-operable Radix primitives, focus rings, focus trapping in modals, `aria-label`s on icon-only buttons. **Not verified** with a screen reader or an automated axe-style audit, and there is no skip-to-content link. |
| **SEO** | Weakest area. It is a client-rendered SPA with no SSR/SSG and a single static `index.html` title/description — per-page meta tags, Open Graph, canonical URLs, `sitemap.xml` and structured data (LocalBusiness/MedicalBusiness) are all missing. A marketing site for a real lab needs these. |
| **Responsive design** | Deliberately engineered and machine-checked: no horizontal overflow at 320/360/375/390/430/768/834/1024/1280/1440/1920px, tables become cards, nav and filters become modal sheets, the wizard reflows to a single column with a compact action bar. |
| **Maintainability** | Good structure — domain types, `src/data` seeds, `src/services` interfaces, one store, shared UI primitives, brand components, per-feature pages. Weaker points: no ESLint/Prettier to enforce consistency, no unit tests, and some pages are large single files (the booking wizard and admin package editor are the biggest). |

### Backend

| Aspect | Assessment |
|---|---|
| **API structure** | **Does not exist.** `src/services/api.ts` defines eight typed interfaces and documents the intended REST mapping, but nothing is implemented and no page performs a network call. |
| **Authentication** | **Demo-only.** `DEMO_ADMIN` / `DEMO_CUSTOMER_LOGIN` are compared in the browser and a session object is written to `localStorage`. There is no token, no expiry, no refresh, and the credentials are displayed in the UI by design. |
| **Authorization** | Client-side route guard only (`AdminLayout` redirects when no session). Because there is no server, this is a UX guard, **not** a security boundary — anyone can edit `localStorage` to reveal the admin UI. |
| **Validation** | Client-side only (`src/lib/validation.ts`). Correct for UX, insufficient for security: server-side validation must be added and treated as authoritative. |
| **Error handling** | Reasonably thorough for a client app — validation summaries, empty/error states, a not-found page, toasts, and a global `ErrorBoundary` is **not** present (a render error would blank the app). |
| **Logging** | **None** beyond the browser console. No structured logging, no request tracing, no error reporting service. |
| **Security** | No server, no database and no real data, so the current attack surface is limited to the static app. That changes completely once a backend and payments are added (see Security below). |

### Database

| Aspect | Assessment |
|---|---|
| **Schema suitability** | No database exists. The domain model in `src/types/index.ts` (booking, patient, package, customer, report, status flow) is a sound basis for a relational schema, but it is a client model: it embeds denormalised snapshot fields (`packageName`, `packageCategory`, `pricing`) inside bookings. That is deliberate (a booking must not change when the catalogue price changes) and should be preserved in SQL. |
| **Indexing** | Not applicable yet. Sensible future indexes: `booking_no` (unique), `bookings(status)`, `bookings(appointment_date, time_slot)` for capacity checks, `bookings(customer_id)`, `packages(slug)` (unique), plus a partial index for pending confirmations. |
| **Relationships** | Would need `customers 1—n bookings`, `packages 1—n bookings` (via snapshot, not a hard FK for historical rows), `bookings 1—1 report`, `bookings 1—n status_events` (the timeline is currently derived, and should become an append-only audit table). |
| **Migrations** | Not applicable yet. Any real deployment needs a migration tool from day one — never hand-edited schema. |
| **Backups** | Not applicable yet. Production requires automated daily snapshots plus point-in-time recovery, and a tested restore procedure. |

### Payments

| Aspect | Assessment |
|---|---|
| **Abstraction** | Partially there: `PaymentService` exists as an interface, the wizard is written against a `payment.state` field (`Paid` / `Pay at Lab`), and four methods are modelled. This is the right seam for a gateway. |
| **Webhook architecture** | **Does not exist.** Production requires a server endpoint that verifies the gateway signature and is the *only* thing allowed to mark a payment captured. |
| **Transaction safety** | **Does not exist.** A real flow needs the booking + payment rows written in one database transaction, and the ability to reconcile a payment that succeeds after a client disconnects. |
| **Idempotency** | **Does not exist.** Needs an idempotency key on booking creation and on webhook processing so a retried request cannot double-charge or double-book. Note the demo's booking-number sequence is stored in `localStorage` and is **not** safe for concurrent users — a real implementation must allocate it server-side (database sequence or equivalent). |

### Security

| Aspect | Assessment |
|---|---|
| **Secret management** | Correctly handled for what exists: the demo needs no secrets, `.env.example` holds only placeholders, `.env` is git-ignored and `.dockerignore`d, and the docs explicitly warn against putting secrets in `VITE_*`. Future server secrets need a real store (Docker/Compose secrets, cloud secret manager). |
| **XSS** | Low risk today — React escapes by default, there is no `dangerouslySetInnerHTML` in the running UI, and the printable receipt/report documents are built from typed data in `src/lib/documents.ts`. Those documents *are* generated HTML opened in a new tab; if their content ever accepts free user text, it must be escaped. The nginx config also sends a strict CSP (`script-src 'self'`, no `unsafe-eval`). |
| **CSRF** | Not applicable yet (no cookies, no server). Becomes relevant the moment cookie-based sessions are introduced — then require `SameSite=Lax/Strict` plus CSRF tokens on state-changing requests. |
| **Authentication security** | **Not production-grade by design.** Credentials live in client code, sessions never expire, and there is no rate limiting, lockout or MFA. All of this must be rebuilt server-side. |
| **Authorization** | Currently a UI guard only. Production needs server-side role checks on every endpoint, enforced per resource (a patient must never fetch another patient's report). |
| **Rate limiting** | **None.** Needed on admin login, booking creation, report download and any OTP endpoint. |
| **Input validation** | Client-side sanitising exists; server-side validation is still required, including strict allow-lists for enums (category, status, collection method, payment method). |
| **Secure headers** | Added by nginx in this setup: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. HSTS is deliberately absent here because it must be set at the TLS terminator. |
| **Dependency vulnerabilities** | `npm audit` reports **4 advisories (3 moderate, 1 high)** in the current tree; they were not force-fixed because `npm audit fix --force` proposes breaking major upgrades. This must be triaged and cleared before production, and `npm audit` (plus Dependabot/Renovate) should run in CI. |

### Deployment

| Aspect | Assessment |
|---|---|
| **Docker** | Solid foundation: multi-stage build, non-root runtime user, small alpine image, layer caching, `.dockerignore`, healthcheck, log rotation, no baked secrets. |
| **Reverse proxy** | nginx is the container's web server and is production-appropriate for static files. A TLS-terminating proxy or managed load balancer still needs to sit in front for HTTPS, HSTS and (optionally) edge caching. |
| **HTTPS** | Not provided. Must be terminated in front of the container (ingress, load balancer or cert-manager). |
| **Environment configuration** | Build-time `VITE_*` and runtime Compose vars are separated and documented. There is no config validation step that fails fast on a missing variable. |
| **Health checks** | Present at both container (`HEALTHCHECK`) and Compose level, using a dedicated `/healthz` endpoint that does not touch the app bundle. |
| **Logging** | nginx access/error logs to stdout/stderr with `json-file` rotation (10 MB × 3). No aggregation, no structured request logging. |
| **Monitoring** | **None.** No uptime checks, no error tracking, no metrics, no alerting. Production needs at least error tracking plus availability and latency monitoring. |

### Testing

| Aspect | Assessment |
|---|---|
| **Unit tests** | **None.** Pure logic is very testable (pricing/total maths, `isSlotAvailable`, validators, booking-number generation, report builder, status-flow transitions) but has no coverage. |
| **Integration tests** | **None.** |
| **End-to-end tests** | The strongest part of the project: `e2e-test.cjs` drives the full 20-step demo journey (booking → confirmation → admin status change → reflected on the customer site → package edit → catalogue update) plus breakpoint and 404 checks, and `dialog-test.cjs` asserts modal geometry and behaviour across viewports. They run on a bare `node` script rather than a CI-friendly runner, and no CI pipeline executes them yet. |

**Conclusion: this is a well-built, honest demonstration — not a production system.** It has no server, no
database, no real authentication, no payment gateway and no monitoring. The front-end engineering, responsive
behaviour and modal architecture are close to production quality; the backend, security and observability layers
do not exist yet.

---

## Current demo stack vs recommended production stack

### Current demo stack

Static React 18 SPA (Vite + TypeScript + Tailwind + Radix primitives), all state in React Context, all data in
`localStorage`, mock authentication, simulated payments, dependency-free SVG charts, Puppeteer-driven verification
scripts, and a static nginx Docker image.

**Keep this as-is for client demonstrations.** It needs no backend, runs offline and resets in one click.

### Recommended production stack

One primary recommendation for this specific application, with alternatives where they genuinely compete.

| Area | Current Project | Recommended Production Option | Reason |
|---|---|---|---|
| **Frontend** | React 18 + Vite SPA (client-rendered) | **Next.js (App Router) + TypeScript + Tailwind**, reusing this project's components, types and design tokens almost unchanged | The single biggest production gap is SEO and per-page metadata for public package pages, plus server-rendered booking pages for link previews — Next.js gives SSR/SSG/ISR, route handlers for the API and image optimisation in one framework. *Alternative:* keep the Vite SPA and move marketing pages to Astro if the team wants to stay SPA-first; or Vite + a separate API if they prefer full separation. |
| **Backend** | None (typed interfaces only) | **Next.js Route Handlers / Server Actions with Zod validation** (extract to a standalone Node (Fastify/NestJS) service only when booking volume or a separate lab-systems team demands it) | Booking traffic for one lab is modest. Co-locating the API with the frontend keeps one deployable, one type language and one CI pipeline, and the existing `services/*` interfaces map 1:1 onto endpoint handlers. *Alternatives:* NestJS if a larger team wants enforced module boundaries; Fastify for minimum overhead. |
| **Database** | None (browser `localStorage`) | **PostgreSQL**, accessed through **Prisma** (or Drizzle) | Bookings, payments, status history and reports are inherently relational and need transactions — a document store adds work for no benefit. Prisma fits this codebase because `src/types/index.ts` already looks like a schema. Managed Postgres (Neon/RDS/Supabase) removes backup and failover work. |
| **Authentication** | In-browser credential comparison | **Server-side sessions with httpOnly cookies** via a maintained library (**Auth.js**, or **Lucia-style** session handling), with roles Patient / Technician / Front Desk / Lab Manager / Admin, plus OTP for patient login | Patients authenticate by mobile OTP in this industry, and staff need RBAC. httpOnly + SameSite cookies avoid token theft in XSS. *Alternative:* Supabase Auth or Firebase Auth if the team wants managed identity and phone OTP out of the box. |
| **File storage** | Static `public/images/`; printable documents generated in-browser | **S3-compatible object storage** (AWS S3, Cloudflare R2) with signed, short-lived URLs for reports; **Cloudflare Images / imgproxy** for package artwork | Diagnostic reports are personal health data: they must not live at guessable URLs or be served by the web server. Signed URLs with expiry, plus server-side encryption at rest, are the baseline. |
| **Payments** | Simulated multi-stage progress dialog | **Razorpay** — server-created orders, client checkout, and a **signature-verified webhook** as the only authority on payment state | Razorpay is the practical default for an Indian lab: UPI, cards, net banking and wallets in one integration, plus established reconciliation. The existing `PaymentService` interface and `payment.state` field already model the seam. *Alternative:* Stripe where international cards dominate. |
| **Notifications** | None (UI-only toasts) | **WhatsApp Cloud API for booking/status messages + an email provider (Resend/SES) for receipts and reports; SMS (MSG91/Twilio) as fallback** | Indian patients expect WhatsApp confirmations, and reports are emailed. Send from the backend on status transitions so notifications are transactional, retried and auditable. |
| **Hosting** | Docker image with nginx | **Managed container platform** (AWS ECS/Fargate, Google Cloud Run, Azure Container Apps) with managed Postgres and object storage | The team keeps the Docker workflow it already has, gets health-check-driven rollouts, and avoids running servers. *Alternative:* a small VPS with Docker Compose for the lowest fixed cost, if someone owns patching. |
| **Reverse proxy** | nginx inside the container | **Cloud load balancer or ingress terminating TLS**, with nginx in the container as the static server | TLS, HSTS, WAF and certificate rotation belong at the edge, not in the app image. |
| **Containerization** | Multi-stage Dockerfile + Compose (web + optional Postgres) | Keep it — add **multi-architecture builds, a pinned digest for the base image, image scanning (Trivy/Grype) and a non-root, read-only filesystem** | The current Docker setup is a good foundation; production adds supply-chain hygiene and reproducible pinning. Add a second Compose/K8s service for the API and a migration job that runs before rollout. |
| **Monitoring** | None | **Sentry** for front-end and server errors, plus **uptime checks** and hosted Postgres/container metrics with alerting on booking failures and payment-webhook errors | Without error tracking, payment and booking failures surface as customer complaints. Error tracking plus a "booking failed" alert is the minimum viable observability layer. |
| **Testing & CI** | Puppeteer scripts run manually with `node` | **Vitest** for unit tests (pricing, slot logic, validators, status transitions), **Playwright** for E2E (reuse the existing scripts, which already cover the critical journey), plus **ESLint + Prettier** and a **GitHub Actions pipeline** running typecheck → lint → unit → build → E2E → image scan → deploy | The E2E journeys are already written and valuable; they need a CI runner, and money/medical logic needs unit coverage before real traffic. |

---

## Recommended production stack

**One primary architecture for this specific project:**

> **Next.js (App Router) + TypeScript + Tailwind CSS + Radix/shadcn components** for the application, with the
> API implemented as **Route Handlers** validated by **Zod**; **PostgreSQL** through **Prisma**; **server-side
> cookie sessions with role-based access** (Auth.js) and OTP login for patients; **S3-compatible object storage**
> with signed URLs for reports and optimised package imagery; **Razorpay** for payments with webhook-verified
> capture; **WhatsApp Cloud API + email** for notifications; **Docker** images deployed to a **managed container
> platform** behind a **managed TLS load balancer**; and **Sentry + uptime/DB monitoring** with a **GitHub Actions
> CI pipeline** running Vitest, Playwright and image scanning.

**Why this architecture fits LabCare specifically**

1. **The hard part is already built and carries over.** The domain model, validation rules, pricing maths, booking
   wizard, status workflow, admin console, responsive behaviour and the entire design system are framework-agnostic
   React/TypeScript. Migrating to Next.js is mostly a routing and data-fetching change; swapping
   `DemoStore` for `services/*` implementations is the intended seam.
2. **SEO is the one thing the demo genuinely cannot do.** A real lab needs "thyroid test in Rajapalayam" to rank
   and WhatsApp links to show a proper preview card. Server rendering for public package pages fixes both, and
   image optimisation fixes the current full-size-JPEG weight at the same time.
3. **The data is strongly relational and transactional.** A booking touches a patient, a package snapshot, a
   price, a slot and a payment; status history is append-only audit data. Postgres transactions and constraints
   protect the invariants that a browser store cannot.
4. **Payments must be server-authoritative.** The existing simulated flow already separates "paid" from "pay at
   lab"; making the webhook the only writer of payment state is a contained change that closes the largest
   correctness and fraud risk.
5. **Health data raises the bar.** Reports need signed URLs, encryption, audit trails and access control — which
   is why object storage + RBAC + server-side authorization are in the primary architecture rather than deferred.
6. **One language, one deployable, small team.** A single TypeScript codebase with one container keeps hiring,
   CI and on-call simple for a single-city laboratory, while the Docker foundation already in place means the
   deployment story barely changes.

**Reasonable alternatives, and when to pick them**

- **Keep the Vite SPA + a separate Node API** (Fastify/NestJS) if the team wants a hard frontend/backend split, or
  if the API must also serve a mobile app. Slightly more infrastructure, cleaner service boundaries.
- **Astro + islands for the public site, React SPA for the booking flow** if SEO and page weight matter more than
  a single framework — at the cost of two rendering models.
- **Supabase (Postgres + Auth + Storage + RLS)** instead of hand-rolling the backend, if speed to launch and a
  smaller ops surface outweigh fine-grained control. Auth phone OTP and signed storage URLs are built in.
- **A single small VPS running this Docker Compose stack** if budget is the deciding factor and someone accepts
  responsibility for patching and backups.
- **Cloud Run / Container Apps** over ECS if the team prefers scale-to-zero economics for low, bursty traffic.

---

## Suggested next steps for production

Ordered by risk, not effort. The first three are prerequisites for handling real patient data or money.

1. **Stand up the backend + Postgres** using the existing `src/types` and `src/services/api.ts` as the contract,
   then replace `DemoStore` actions with service implementations — no page-level rewrites expected.
2. **Implement real authentication and server-side authorization**, with roles for Patient, Technician, Front
   Desk, Lab Manager and Administrator, and per-resource access checks (a patient may only ever see their own
   bookings and reports).
3. **Integrate Razorpay server-side** — order creation, idempotency keys, and a signature-verified webhook as the
   single authority on payment state.
4. **Move report storage to object storage** with signed, expiring URLs, encryption at rest and an access audit log.
5. **Add notifications** on each status transition (WhatsApp/SMS/email) with retry and delivery tracking.
6. **Add slot capacity rules, technician routing and pincode serviceability** — the current slot availability is a
   fixed demo pattern, not a capacity model.
7. **Add GST invoicing, refunds and cancellations policy enforcement** (the current cancellation is a status flip).
8. **Add observability** (Sentry + uptime + DB metrics) and alerting on failed bookings and webhook errors.
9. **Add CI/CD** (typecheck, lint, unit, E2E, image scan, deploy) and unit tests for pricing, slot availability,
   validators and status transitions.
10. **Add SEO and performance work** (SSR/SSG, per-page metadata, structured data, `sitemap.xml`, responsive
    images) if the public catalogue is meant to acquire customers.
11. **Triage the 4 outstanding npm advisories** and enable automated dependency updates.
12. **Add an error boundary** so a render error degrades to a friendly screen instead of a blank page.
