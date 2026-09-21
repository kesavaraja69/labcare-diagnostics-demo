# Docker — LabCare Diagnostics

How to build, run and troubleshoot the LabCare Diagnostics container image.

The application is a **static single-page app** (React + TypeScript built by Vite). There is no application
server: the build output is served by nginx. That keeps the runtime image small and the startup fast.

---

## 1. Prerequisites

| Requirement | Notes |
|---|---|
| Docker Engine 20.10+ | `docker --version` |
| Docker Compose v2 | `docker compose version` (the `docker-compose` v1 binary is not required) |
| ~1 GB free disk | Build stage (Node + dependencies) plus the final image |
| Internet access for the first build | `npm ci` and base-image pulls |
| Port 8585 free | Or set `APP_PORT` in `.env` to another host port |

Not required: Node on the host, a database, an API key or any paid service. Local development outside Docker
needs Node 20 (`npm install && npm run dev`).

---

## 2. Files

| File | Role |
|---|---|
| `Dockerfile` | Multi-stage build — `node:20-alpine` compiles the app, `nginx-unprivileged` serves it |
| `docker-compose.yml` | Base stack — the `web` service, no required configuration |
| `docker-compose.postgres.yml` | Optional PostgreSQL overlay (separate file, so the base stack can never fail on a missing DB credential) |
| `docker/nginx.conf` | SPA history fallback, gzip, immutable asset caching, `/healthz` |
| `docker/security-headers.conf` | The CSP and hardening headers, included by the `server` block **and** by every location that sets its own headers (see the note in §11) |
| `.dockerignore` | Keeps `node_modules`, `dist`, `.env`, screenshots and test scripts out of the build context |
| `.env.example` | Template for every supported variable (copy to `.env`) |

---

## 3. Environment variables

Copy the template first:

```bash
cp .env.example .env
```

The demo runs with the placeholders as-is — **no secret is required**.

### Build-time (inlined into the browser bundle by Vite)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_APP_NAME` | `LabCare Diagnostics` | Public display name |
| `VITE_API_BASE_URL` | `/api` | Backend base URL. A placeholder today; the real API will replace it |
| `VITE_ENABLE_DEMO_MODE` | `true` | Enables the in-browser demo dataset and demo notices |

> ⚠️ **Never put a secret in a `VITE_*` variable.** Vite inlines these values into the JavaScript that ships to
> the browser, so they are public by definition. Server secrets (payment keys, JWT signing keys, SMTP
> credentials) belong to the backend, supplied at runtime and never baked into the image.

### Runtime

| Variable | Default | Purpose |
|---|---|---|
| `APP_PORT` | `8585` | Host port the site is published on |
| `LAB_CARE_TAG` | `local` | Image tag used by `docker compose build` |
| `NODE_ENV` | `production` | Set by Compose for the `web` service |

### Optional PostgreSQL (overlay `docker-compose.postgres.yml`)

| Variable | Default | Purpose |
|---|---|---|
| `POSTGRES_USER` | — (required) | Database user |
| `POSTGRES_PASSWORD` | — (required) | Database password. Compose refuses to start without it |
| `POSTGRES_DB` | — (required) | Database name |
| `POSTGRES_PORT` | `5432` | Host port, only used if you uncomment the loopback bind |

The current demo does **not** use a database. These exist as the starting point for the production backend — see
README → *Recommended production stack*.

---

## 4. Development usage

The fastest loop is the Vite dev server on the host (hot reload, no image rebuild):

```bash
npm install
npm run dev                    # http://localhost:5173
```

Use Docker when you want to verify the **production** artefact — the compile step, the nginx config, the headers
and the SPA fallback:

```bash
docker compose up -d --build
open http://localhost:8585     # or: curl -I http://localhost:8585
```

Rebuild after a source change (Compose caches unchanged layers):

```bash
docker compose up -d --build
```

---

## 5. Production usage

```bash
# 1. Configure
cp .env.example .env
#    → set APP_PORT if 8585 is taken; add a real VITE_API_BASE_URL when a backend exists

# 2. Build the image (multi-stage; the runtime stage contains only nginx + static files)
docker compose build

# 3. Start detached, with health checks and restart policy
docker compose up -d

# 4. Confirm it is healthy
docker compose ps

# 5. Verify behaviour
curl -fsS http://localhost:8585/healthz          # → ok
curl -I  http://localhost:8585/packages          # → 200 (SPA fallback), CSP + security headers

# 6. Stop
docker compose down
```

Without Compose:

```bash
docker build -t labcare-diagnostics:local .
docker run --rm -p 8585:8080 --name labcare labcare-diagnostics:local
```

### What the image does and does not do

**Included**

- Multi-stage build; the final image has no Node, no source, no `node_modules`
- Dependency-layer caching — `package.json` / `package-lock.json` are copied before the source, so dependency
  installation is skipped while only app code changes
- Runs as **non-root (uid 101)** via `nginx-unprivileged`
- Listens on **8080** (unprivileged port)
- `HEALTHCHECK` hitting `/healthz`
- gzip, immutable caching for content-hashed `/assets/`, `no-cache` on `index.html` so deploys are picked up
- Security headers: CSP (`script-src 'self'`, no `unsafe-eval`), `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`
- SPA history fallback so deep links such as `/my-bookings/bkg-114` and `/admin/reports` resolve

**Not included — expected elsewhere in production**

- TLS/HTTPS termination and HSTS (put a load balancer, ingress or reverse proxy in front)
- Any backend, database or payment integration
- Horizontal scaling and CDN caching (both are straightforward for a static image)
- Error tracking or metrics

---

## 6. Services

| Service | Defined in | Image | Purpose |
|---|---|---|---|
| `web` | `docker-compose.yml` | built from `./Dockerfile` | Serves the SPA on port 8080 |
| `postgres` | `docker-compose.postgres.yml` | `postgres:16-alpine` | Optional database for a future backend. Not used by the demo |

Start only the site (default — works with no `.env` at all):

```bash
docker compose up -d
```

Start the site **and** PostgreSQL:

```bash
cp .env.example .env     # set POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up -d
```

The database lives in a separate overlay file for a specific reason: Compose interpolates and
parses the file it is given *before* applying profiles, so a `:?required` variable inside a
profile-gated service would still abort a plain `docker compose up`. Keeping it in its own file
means the site always starts, and the database always refuses to start with a default password.

---

## 7. Ports

| Service | Container port | Host default | Override |
|---|---|---|---|
| `web` | `8080` | `8585` | `APP_PORT` in `.env` |
| `postgres` | `5432` | **not published** | uncomment the loopback bind in `docker-compose.yml` |

The database port is intentionally unpublished: services reach it over the Compose network by name
(`postgres:5432`). Exposing a database publicly is a common and avoidable production mistake. If a local tool
needs access, uncomment the loopback-only mapping, which binds to `127.0.0.1` rather than all interfaces.

---

## 8. Volumes

| Volume | Mounted at | Purpose |
|---|---|---|
| `labcare_pgdata` | `/var/lib/postgresql/data` | PostgreSQL data directory |

It is a **named volume**, so data survives `docker compose down`, rebuilds and image upgrades.

```bash
docker volume ls | grep labcare           # confirm it exists
docker compose down                       # containers removed, data kept
docker compose down -v                    # DANGER: deletes the database volume
```

The `web` service keeps no state — the SPA stores demo data in the visitor's browser, not in the container, so
the web container is safe to destroy and recreate at any time.

---

## 9. Health checks

Two layers, both hitting the same endpoint:

| Layer | Definition | Result |
|---|---|---|
| Image | `HEALTHCHECK … wget -q -O /dev/null http://127.0.0.1:8080/healthz` | `docker ps` shows `healthy` |
| Compose | `test: ["CMD", "wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/healthz"]`, interval 30s, timeout 3s, start period 5s, 3 retries | `docker compose ps` shows the health column |

`/healthz` is served by nginx directly (`return 200 "ok"`) with `access_log off`, so it does not touch the app
bundle and stays accurate even if a JavaScript asset were broken. Orchestrators can use it for rollout gating;
the database has its own `pg_isready` check in the overlay file.

---

## 10. Logs

```bash
docker compose logs -f              # all services
docker compose logs -f web          # application/web server only
docker compose logs --tail=100 web  # last 100 lines
docker compose logs -f postgres     # database only
```

nginx writes access and error logs to stdout/stderr, which is what Docker and log collectors expect. Both
services use the `json-file` driver with rotation at **10 MB × 3 files** so logs cannot fill the disk.

---

## 11. Common tasks

```bash
# Shell inside the running web container
docker compose exec web sh

# Inspect the built image size and layers
docker images labcare-diagnostics
docker history labcare-diagnostics:local

# Confirm the runtime user is not root (expect uid=101)
docker compose exec web id

# Verify security headers and the SPA fallback
curl -sI http://localhost:8585/packages | grep -iE "content-security|x-frame|referrer"
curl -sI http://localhost:8585/my-bookings/bkg-114 | head -1

# Rebuild everything from scratch, no cache
docker compose build --no-cache && docker compose up -d

# Remove dangling images left by rebuilds
docker image prune -f
```

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `port is already allocated` / bind error on 8585 | Another process (often a Vite dev server or a previous container) holds the port | `docker compose down`, or set `APP_PORT=8090` in `.env`, then `docker compose up -d` |
| Compose exits with `set POSTGRES_PASSWORD in .env` | The PostgreSQL overlay was started without credentials (this cannot happen for a plain `docker compose up`) | Populate `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` in `.env` — the failure is deliberate, so no default password ever reaches a deployment |
| `docker compose ps` shows `unhealthy` | nginx has not finished starting, or port 8080 inside the container is blocked | Wait for the 5s start period, then `docker compose logs web`. Confirm `/healthz` with `docker compose exec web wget -qO- http://127.0.0.1:8080/healthz` |
| Deep link like `/admin/reports` returns 404 | Request not reaching nginx (SPA fallback lives in `docker/nginx.conf`) | Confirm `docker/nginx.conf` was copied into the image: `docker compose exec web cat /etc/nginx/conf.d/default.conf \| head`. Rebuild with `--no-cache` if the file was edited after the image was built |
| Changes to source are not reflected | Docker layer cache reused an earlier build | `docker compose up -d --build`; if the code change was in `tailwind.config.js` or `vite.config.ts`, add `--no-cache` |
| Blank page in the browser, but curl returns 200 | A strict CSP blocked something, or the browser cached an old `index.html` | Hard-reload (Ctrl/Cmd+Shift+R). Compare with `curl -sI http://localhost:8585/ \| grep -i content-security`. `index.html` is `no-cache`, and hashed assets are `immutable`, so a normal reload after a deploy is enough |
| Security headers missing from a response (`curl -sI …` shows no CSP) | nginx `add_header` in a nested block **replaces** the parent level's headers instead of merging, so a `location` that sets its own `Cache-Control` also drops the `server`-level policy | Add `include /etc/nginx/snippets/security-headers.conf;` to that `location` — and to any new location that sets its own headers. `add_header_inherit merge` would remove the need, but it requires nginx 1.29.3+ and the image is 1.27.x |
| `npm ci` fails during the build | `package-lock.json` and `package.json` disagree | Run `npm install` on the host to refresh the lockfile, then rebuild |
| Build fails during `tsc --noEmit` | A TypeScript error — by design, the build runs the type-check first | Run `npm run typecheck` locally and fix the error; the image will not build until it is clean |
| Demo data looks wrong / duplicated after a rebuild | Not a container problem — demo data lives in the **browser's** `localStorage` | Use **Reset demo data** in the admin sidebar, or clear site data for `localhost:8585` |
| Image builds slowly every time | Dependency layer cache invalidated by touching `package.json`/lockfile | Only lockfile changes should invalidate it; avoid editing those files mid-build. Do not add `--no-cache` habitually |
| `ImagePullBackOff` / timeout pulling base images | No network access or a registry block | Retry on a networked host; consider mirroring `node:20-alpine` and `nginxinc/nginx-unprivileged:1.27-alpine` internally |

---

## 13. Notes for production deployment

1. **Terminate TLS in front of the container** and enable HSTS there. HSTS is deliberately not set by nginx in
   the image, so a misconfigured TLS terminator cannot lock users out of a plain-HTTP deployment.
2. **Pin base image digests** (`node:20-alpine@sha256:…`) for reproducible builds, and scan images
   (Trivy/Grype) in CI.
3. **Run read-only where practical** (`--read-only` with a small `tmpfs`) — the web container never writes to disk.
4. **Scale statelessly.** The web container holds no state, so replica count is a free scaling knob once a CDN or
   load balancer is in front.
5. **Add the backend as its own service** when it exists — an `api` service on the same Compose network, connecting
   to `postgres:5432`, with a migration job that runs before rollout.
6. **Keep secrets out of images.** Use the platform's secret store (or Compose `secrets`), not build args and not
   `VITE_*`.
7. **Alert on health, not just uptime.** The health check proves nginx is serving; production monitoring should
   also alert on failed bookings and payment-webhook errors, which a static health check cannot see.
