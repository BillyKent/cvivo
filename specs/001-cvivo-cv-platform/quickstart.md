# Quickstart: CVivo Development Setup

**Branch**: `001-cvivo-cv-platform` | **Date**: 2026-06-16

## Prerequisites

- **Node.js 20 LTS** (`node --version` → `v20.x.x`)
- **pnpm 9+** (`npm i -g pnpm`)
- **Supabase project** (free tier at supabase.com — PostgreSQL + Auth)
- **Vercel account** (optional for local dev; required for deployment)

---

## 1. Install dependencies

```bash
pnpm install
```

---

## 2. Environment variables

Copy `.env.example` to `.env.local` and populate:

```bash
# Supabase project URL and public anon key (safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Service role key (server-side only — never expose to browser)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Supabase Postgres with PgBouncer connection pooling
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true

# App base URL (used for share link generation)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Values are found in the Supabase dashboard under **Project Settings → API**.

---

## 3. Database setup

```bash
# Apply Prisma migrations to Supabase
pnpm prisma migrate dev --name init

# Seed template reference data (optional)
pnpm prisma db seed

# Open Prisma Studio to inspect data
pnpm prisma studio
```

---

## 4. Run locally

```bash
pnpm dev          # Next.js dev server → http://localhost:3000
pnpm build        # Production build (verify no type errors or build failures)
pnpm start        # Serve the production build locally
```

---

## 5. Run tests

```bash
pnpm test                 # Jest unit + integration tests (one-shot)
pnpm test --watch         # Jest in watch mode (TDD workflow — keep this running)
pnpm test:a11y            # jest-axe WCAG 2.1 AA accessibility tests
pnpm test:e2e             # Playwright E2E (requires dev server running on :3000)
pnpm test:e2e --ui        # Playwright with interactive UI (debugging)
```

### TDD workflow (Constitution Principle I — non-negotiable)

```bash
# 1. Start Jest in watch mode
pnpm test --watch

# 2. Write a failing test (RED)
# 3. Write the minimum implementation to make it pass (GREEN)
# 4. Refactor — tests stay green
# Every commit must include passing tests for every changed behaviour
```

---

## 6. PDF export locally

Puppeteer downloads a local Chromium on first run (macOS/Linux). On CI and Vercel,
`@sparticuz/chromium` provides the binary.

```bash
# Test PDF export (requires a valid session cookie from a running dev server)
curl -X POST http://localhost:3000/api/cvs/<cvId>/export/pdf \
  -H "Cookie: <session-cookie>" \
  --output test-export.pdf
open test-export.pdf
```

---

## Project structure (quick reference)

```
src/
  app/                        Next.js App Router
    (auth)/signin|signup/     Auth pages (no shared layout)
    (dashboard)/dashboard/    Protected pages
    (dashboard)/cv/[cvId]/    CV editor page
    [slug]/                   Public CV page (vanity slug)
    api/                      Route Handlers
      auth/[...supabase]/     Supabase Auth callback
      cvs/                    CV CRUD
      public/[slug]/          Unauthenticated CV data
      account/                Account management
  components/
    cv-editor/                Section editor UI
    cv-preview/               Live preview panel
    cv-templates/             classic/, modern/, minimal/
    ui/                       Shared design system components
  lib/
    db.ts                     Prisma client singleton
    supabase.ts               Supabase client helpers (server + browser)
    pdf.ts                    Puppeteer PDF generation
    slug.ts                   Slug validation (format + blocklist)
  types/                      Shared TypeScript types (CVData, SectionContent, etc.)

tests/
  unit/                       Jest + RTL component and utility tests
  integration/                API route integration tests (Playwright API mode)
  e2e/                        Playwright full user journey tests
  accessibility/              jest-axe WCAG 2.1 AA tests

specs/001-cvivo-cv-platform/  Spec Kit artifacts (read-only during implementation)
prisma/
  schema.prisma               Database schema
  migrations/                 Migration history
  seed.ts                     Seed data
```

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Link project and deploy
vercel

# Set environment variables in Vercel dashboard (same keys as .env.local)
# Vercel auto-detects Next.js; no build configuration needed
```
