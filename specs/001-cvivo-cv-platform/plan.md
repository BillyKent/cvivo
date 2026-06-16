# Implementation Plan: CVivo CV Builder & Sharing Platform

**Branch**: `001-cvivo-cv-platform` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-cvivo-cv-platform/spec.md`

---

## Summary

CVivo is a web platform where users create professional CVs in a live-preview editor, share
them via a user-chosen vanity slug (`cvivo.com/jane-doe`), and export them as PDF. Built as a
Next.js 14 (App Router) full-stack application backed by Supabase (PostgreSQL + Auth), with
React component templates that render identically in the browser and inside Puppeteer for
pixel-faithful PDF export.

---

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 20 LTS

**Primary Dependencies**:
- `next@14` (App Router, React Server Components, Route Handlers)
- `@supabase/ssr` + `@supabase/supabase-js` (Auth + database client)
- `prisma@5` + `@prisma/client` (ORM + migrations)
- `puppeteer-core` + `@sparticuz/chromium` (server-side PDF generation)
- `tailwindcss@3` (styling, responsive utilities)
- `jest` + `@testing-library/react` + `jest-axe` (unit + accessibility tests)
- `@playwright/test` (E2E + visual regression + API integration tests)

**Storage**: Supabase PostgreSQL (hosted)

**Testing**: Jest (unit/integration) + Playwright (E2E, visual regression, accessibility
automation) + jest-axe (in-process WCAG 2.1 AA auditing)

**Target Platform**: Web (Vercel serverless + edge CDN); browsers: Chrome 120+, Firefox 120+,
Safari 17+, Edge 120+

**Project Type**: Full-stack web application (monolith — frontend + backend in one Next.js
project)

**Performance Goals**:
- Shared CV page load <3 s on typical broadband (SC-006) — met by Vercel edge CDN + SSR
- PDF generation <10 s per export (internal target; not in spec, but reasonable user expectation)
- Live preview update <200 ms after user input (React state, no server round-trip required)

**Constraints**:
- PDF export binary (Puppeteer + `@sparticuz/chromium`): ~50 MB compressed, fits Vercel
  serverless function limit (250 MB). Deployed to a separate Vercel function to avoid
  bundling Chromium with the main app.
- Supabase free tier: 500 MB PostgreSQL, 50 k MAU — sufficient for v1 (zero paid features
  per spec Assumptions).
- RTL layout mirroring: out of scope for v1 (Clarifications 2026-06-16). Unicode text
  renders correctly within an LTR layout.

**Scale/Scope**: v1 — free tier; no explicit user-count target in spec. Architecture supports
horizontal scaling via Vercel serverless (stateless functions + Supabase connection pooling).

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First (NON-NEGOTIABLE)

**Status: ✅ PASS**

- All tasks in `tasks.md` will pair a "write tests (RED)" step before "write implementation
  (GREEN)". No implementation task may be created without a preceding test task.
- Jest watch mode is the primary development loop.
- Playwright E2E tests cover every user story acceptance scenario before the feature ships.
- Visual regression tests (Playwright screenshots) are run against all CV templates before
  any template change merges.

### II. Professional Output Quality

**Status: ✅ PASS**

- The single React component rendering path for templates eliminates divergence between
  the live preview and the PDF export: Puppeteer renders the identical HTML.
- Playwright visual regression tests detect layout regressions before release.
- SC-004 (faithful PDF) is validated by automated comparison against reference screenshots.
- Empty sections are omitted at the template render layer (FR-015), ensuring no blank
  headings appear in any output mode.

### III. User Data Ownership & Privacy

**Status: ✅ PASS**

- Every CV is `PRIVATE` by default (FR-007); sharing requires an explicit user action (FR-008).
- Supabase RLS enforces ownership at the database layer — not just application layer —
  for all authenticated operations (CVs, sections, share links).
- The public API endpoint (`GET /api/public/:slug`) returns zero user identity information
  to anonymous callers; only CV content is returned.
- Account deletion (FR-014) cascades atomically: CVs, sections, share links deleted;
  `SlugReservation.userId` set to null (slug permanently retired, not freed for others).

### IV. Accessible & Responsive Sharing

**Status: ✅ PASS**

- `jest-axe` tests run on every rendered shared CV view; zero critical WCAG 2.1 AA
  violations are a hard gate (SC-005).
- Tailwind responsive modifiers (`sm:`, `md:`, `lg:`) implement FR-010. Playwright tests
  verify layout at three viewport widths: 375 px (mobile), 768 px (tablet), 1280 px (desktop).
- Share link behavior is predictable: stable URL per slug, immediate revocation (SC-007 —
  within one page load), clear 404 on invalid/revoked links (FR-016).

### V. Simplicity First (YAGNI)

**Status: ✅ PASS**

- Single Next.js project — no separate frontend/backend repos, no microservices.
- Supabase handles Auth, database, and RLS in one service — no separate auth server.
- Three hardcoded templates for v1 — no dynamic template loading or plugin system.
- `CV.visibility` is denormalized (one column) rather than derived from a join — simplest
  read path for the public CV page query.
- Puppeteer is the only justified complexity: it is the only solution that satisfies
  Principle II for PDF export (see Complexity Tracking below).

---

## Project Structure

### Documentation (this feature)

```text
specs/001-cvivo-cv-platform/
├── plan.md              ← this file
├── research.md          ← Phase 0: technology decisions
├── data-model.md        ← Phase 1: Prisma schema + RLS policies
├── quickstart.md        ← Phase 1: dev setup guide
├── contracts/
│   └── api.md           ← Phase 1: HTTP API contract
└── tasks.md             ← Phase 2 output (/speckit-tasks — not yet generated)
```

### Source Code (repository root — Next.js monolith)

```text
src/
  app/                              Next.js App Router
    (auth)/                         Route group: auth pages (no shared layout)
      signin/page.tsx
      signup/page.tsx
    (dashboard)/                    Route group: authenticated pages
      dashboard/page.tsx            CV list
      cv/[cvId]/
        edit/page.tsx               CV editor
    [slug]/page.tsx                 Public CV view (vanity slug — catch-all, lowest priority)
    layout.tsx                      Root layout
    api/
      auth/callback/route.ts        Supabase Auth OAuth callback
      cvs/
        route.ts                    GET /api/cvs · POST /api/cvs
        [cvId]/
          route.ts                  GET · PATCH · DELETE
          sections/
            route.ts                GET · POST
            [sectionId]/route.ts    PATCH · DELETE
            order/route.ts          PATCH (reorder)
          share/route.ts            GET · POST · DELETE
          export/pdf/route.ts       POST
      public/[slug]/route.ts        GET (unauthenticated)
      account/route.ts              GET · DELETE
  components/
    cv-editor/                      Section editor panels
    cv-preview/                     Live preview panel (wraps active template)
    cv-templates/
      classic/index.tsx             Classic template component
      modern/index.tsx              Modern template component
      minimal/index.tsx             Minimal template component
      registry.ts                   templateId → component map
    ui/                             Shared design system (buttons, inputs, etc.)
  lib/
    db.ts                           Prisma client singleton
    supabase.ts                     Supabase client helpers (server + browser variants)
    pdf.ts                          Puppeteer PDF generation helper
    slug.ts                         Slug validation (format regex + blocklist)
  types/
    cv.ts                           CVData, SectionContent discriminated union
    api.ts                          Request/response types

tests/
  unit/                             Jest + RTL: components, lib utilities, slug validation
  integration/                      API route tests (Playwright API mode, no browser)
  e2e/                              Playwright: full user journeys across all 3 user stories
  accessibility/                    jest-axe: WCAG 2.1 AA on shared CV template renders

prisma/
  schema.prisma                     Authoritative schema (see data-model.md)
  migrations/                       Migration history (committed, versioned)
  seed.ts                           Reference data (template keys)
```

**Structure Decision**: Next.js App Router monolith (Option 2 variant: frontend + API
co-located in one project). No separate `backend/` or `frontend/` directories — Next.js
Route Handlers serve as the backend. This eliminates a deployment unit, a dev-server
coordination concern, and a CORS configuration — satisfying Principle V.

---

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Puppeteer + `@sparticuz/chromium` | PDF export must faithfully reproduce the on-screen CV layout (Principle II, FR-012, SC-004) | `@react-pdf/renderer` maintains a separate rendering path — divergence between screen and PDF is unavoidable and untestable; `html2canvas` produces non-selectable, bitmapped text output |
| `SlugReservation` table (separate from `ShareLink`) | Implements FR-009a: revoked slugs stay permanently reserved to the original owner, even after account deletion (SET NULL on user delete retires the slug) | Keeping slug reservation logic in `ShareLink` alone would either cascade-delete the reservation on account deletion or require nullable FK gymnastics in the same table |
