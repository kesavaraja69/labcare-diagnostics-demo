# syntax=docker/dockerfile:1

###############################################################################
# LabCare Diagnostics — production image
#
# The app is a client-side single-page application (React + TypeScript + Vite).
# There is no application server: the build produces static assets, so the
# runtime stage is a small nginx image serving them.
#
#   Stage 1 (build)   — install dependencies, type-check, bundle with Vite
#   Stage 2 (runtime) — nginx-unprivileged, static files only, runs as uid 101
###############################################################################

# ------------------------------- Stage 1: build ------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Build-time configuration. Vite inlines VITE_* variables into the client bundle,
# so they must be present at build time. Only ever pass non-sensitive values here —
# anything inlined into a browser bundle is public.
ARG VITE_API_BASE_URL=/api
ARG VITE_ENABLE_DEMO_MODE=true
ARG VITE_APP_NAME="LabCare Diagnostics"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ENABLE_DEMO_MODE=$VITE_ENABLE_DEMO_MODE \
    VITE_APP_NAME=$VITE_APP_NAME

# Dependency layer first so it stays cached while only source files change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Application source.
COPY . .

# `npm run build` = `tsc --noEmit && vite build`, so a type error fails the image.
RUN npm run build

# ------------------------------ Stage 2: runtime -----------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="LabCare Diagnostics" \
      org.opencontainers.image.description="Diagnostic test & health package booking demo (static SPA)" \
      org.opencontainers.image.licenses="UNLICENSED"

# nginx-unprivileged already runs as uid 101 (non-root) and listens on 8080;
# the temporary USER root is only needed to overwrite the shipped config.
USER root
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Shared security headers, included by nginx.conf at server level and inside every
# location that sets its own headers (a nested add_header replaces inheritance).
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf

# Built assets are read-only to the runtime user.
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
USER 101

EXPOSE 8080

# Container-level health check for Compose / orchestrators.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
