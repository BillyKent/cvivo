# Research: CVivo CV Builder & Sharing Platform

**Branch**: `001-cvivo-cv-platform` | **Date**: 2026-06-16

All NEEDS CLARIFICATION items from the plan's Technical Context are resolved here.

---

## Decision 1 — Full-Stack Framework

**Decision:** Next.js 14 (App Router, TypeScript)

**Rationale:**
- Vanity slug routing (`/[slug]`) is a first-class pattern in Next.js dynamic routes. Route
  groups (`(auth)`, `(dashboard)`) prevent the public `/:slug` catch-all from conflicting
  with platform routes.
- Server-side rendering at the edge satisfies SC-006 (<3 s load) for shared CV pages
  without a separate CDN setup.
- A single Next.js project houses both the React-based CV template components (live preview)
  and the Node.js API routes (auth, data, PDF export) — no separate frontend/backend repos.
  Directly satisfies Principle V (Simplicity First).
- TypeScript enforces type safety across the API → UI boundary; particularly important for
  the structured `CVSection.content` JSON shapes.

**Alternatives considered:**
- Remix: Good SSR but smaller community, less native Vercel integration, no added benefit
  here given Next.js meets every requirement.
- SvelteKit: Lighter framework, but smaller component ecosystem; CV templates need a rich
  React ecosystem (Tailwind, RTL testing, Puppeteer integration).
- Nuxt (Vue 3): Viable but smaller developer community for the specific patterns needed
  (Prisma, Supabase SSR, Puppeteer in serverless).

---

## Decision 2 — Database

**Decision:** PostgreSQL via Supabase

**Rationale:**
- Relational model with strong referential integrity is required: User → CV → CVSection
  (ordered, typed), User → SlugReservation → ShareLink. ACID transactions protect user data
  ownership (Principle III).
- Unique constraint on `slug_reservations.slug` (PK) enforces global vanity-slug uniqueness
  at the database level, not just at the application layer.
- Supabase provides PostgreSQL + Row Level Security (RLS) + Auth in one service. RLS
  enforces Principle III (data ownership) at the database layer: a user's rows cannot be
  read or written by another user even if application-layer auth is misconfigured.
- Free tier is sufficient for v1 scale (consistent with spec Assumptions: free product).

**Alternatives considered:**
- PlanetScale (MySQL-compatible): No foreign-key constraints by default; CVSection ordering
  and slug uniqueness are harder to enforce at the schema level.
- MongoDB: Flexible document model for CV sections but no foreign-key integrity; ordering
  across documents is less natural; global slug uniqueness across collections is non-trivial.
- Turso (SQLite edge): Simpler, but limited SQL dialect; limited maturity for the relational
  joins this data model requires.

---

## Decision 3 — ORM

**Decision:** Prisma 5

**Rationale:**
- Type-safe query builder generated from schema: compile-time errors when accessing
  non-existent fields. Critical for the structured JSON content shapes in CVSection.
- Migration system (`prisma migrate dev`) gives reproducible, versioned schema changes
  satisfying Principle I (test-first: migrations must be tested too).
- Native support for Supabase PostgreSQL with PgBouncer connection pooling via
  `DATABASE_URL` + `?pgbouncer=true`.

**Alternatives considered:**
- Drizzle ORM: Excellent alternative, also fully type-safe; chosen Prisma for its larger
  community and richer examples for the JSON-field and cursor-pagination patterns used here.
- Raw SQL (node-postgres): No type safety on query results; type drift would compound in
  a TypeScript project — violates Principle V for a CRUD-heavy API.

---

## Decision 4 — Authentication

**Decision:** Supabase Auth (email/password + OAuth providers)

**Rationale:**
- Co-located with the Supabase PostgreSQL instance: RLS policies reference `auth.uid()`
  directly, creating an unbreakable link between the authenticated identity and data
  ownership (Principle III). No custom join between auth tokens and DB rows.
- Handles email verification, password reset, Google/GitHub OAuth — all required by
  spec Assumptions — with zero custom infrastructure (Principle V).
- `@supabase/ssr` package provides Next.js App Router-compatible server-side session
  handling (server components, middleware, API routes).

**Alternatives considered:**
- NextAuth.js (Auth.js): Excellent Next.js integration but requires separate session
  storage (JWT or database-backed) and manual wiring of ownership to Prisma rows to
  replicate what Supabase RLS provides natively.
- Clerk: Fully managed, polished DX, but an external vendor for a core security boundary;
  adds cost dependency; harder to mock in integration tests; violates Principle V.
- Custom JWT: Significant complexity with no benefit over Supabase Auth — violates
  Principle V.

---

## Decision 5 — PDF Export

**Decision:** Puppeteer + `@sparticuz/chromium` (server-side API route)

**Rationale:**
- Renders the exact same HTML/CSS as the browser preview — the only way to guarantee
  Principle II (faithful reproduction of the on-screen layout). The same React template
  component is rendered to HTML server-side, then captured by Puppeteer.
- `@sparticuz/chromium` provides a Vercel-compatible Chromium binary that fits within
  Vercel's serverless function size limits (~50 MB compressed).
- Puppeteer's `page.pdf({ format: 'A4', printBackground: true })` handles multi-page
  pagination correctly, satisfying FR-012 and SC-004.
- Full Unicode font support (via Chromium's built-in font stack), satisfying FR-017.

**Alternatives considered:**
- `@react-pdf/renderer`: Maintains a separate React rendering path for PDF (different CSS
  subset, custom layout engine, no web fonts). Pixel-fidelity cannot be guaranteed without
  keeping two rendering paths in sync — directly violates Principle II.
- `html2canvas` + `jsPDF` (client-side): Text becomes non-selectable, non-searchable
  rasterized pixels in the PDF. Poor output quality (Principle II violation).
- WeasyPrint: Python-based sidecar service; adds operational complexity for a JS-first
  project — violates Principle V.

---

## Decision 6 — CV Template System

**Decision:** React components as isomorphic templates

**Rationale:**
- A single React component per template (e.g., `<ClassicTemplate cv={data} />`) renders
  identically in the browser (Next.js React render) and inside Puppeteer (which runs a
  real Chromium engine). This is the mechanism by which Principle II is enforced: there
  is only one rendering path.
- Template switching (FR-005) is component substitution — CV data passes through a shared
  typed `CVData` props interface; no data transformation needed.
- Templates are testable with React Testing Library for structure/content correctness and
  with Playwright for visual fidelity (Principle I).

**Three templates for v1** (minimum viable choice; can extend without schema changes):

| Key | Name | Style |
|---|---|---|
| `classic` | Classic | Traditional two-column, formal, serif-accented |
| `modern` | Modern | Single-column, strong typography, accent color |
| `minimal` | Minimal | Compact text-only, maximum content density |

---

## Decision 7 — Testing Stack

**Decision:** Jest + React Testing Library + Playwright + jest-axe

**Rationale:**
- Constitution Principle I mandates TDD. Jest is the de-facto standard for TypeScript/
  React unit and integration tests. RTL ensures tests mirror user interactions, not
  implementation details.
- `jest-axe` provides in-process WCAG 2.1 AA auditing of rendered components, directly
  satisfying SC-005 and Principle IV (Accessible & Responsive Sharing).
- Playwright covers: E2E user journeys (sign up → create CV → share → revoke),
  cross-browser, cross-viewport (mobile/tablet/desktop, SC-003), and screenshot-based
  visual regression tests for CV output quality (Principle II).
- Playwright API mode tests API route handlers in isolation (integration tests without
  a real browser), supplementing Jest for route-level test coverage.

---

## Decision 8 — Hosting & Infrastructure

**Decision:** Vercel (Next.js) + Supabase (PostgreSQL + Auth)

**Rationale:**
- Vercel: Native Next.js deployment, edge CDN, serverless API routes (including PDF export
  via Puppeteer), automatic HTTPS. Free tier covers v1 scope (spec Assumption: free product).
  Edge CDN satisfies SC-006 (<3 s load for shared CV pages).
- Supabase free tier: 500 MB database, 50 k MAU auth — sufficient for v1.
- Both services require zero infrastructure management, consistent with Principle V.

---

## Decision 9 — Styling

**Decision:** Tailwind CSS v3

**Rationale:**
- Responsive modifiers (`sm:`, `md:`, `lg:`) implement FR-010 (responsive shared CV views)
  without media-query boilerplate.
- Works correctly inside Puppeteer (computed styles resolve in Chromium), ensuring visual
  parity between browser preview and PDF export (Principle II).
- PurgeCSS (built into Tailwind production builds) keeps the CSS bundle minimal for
  fast page loads (SC-006).

---

## Summary Table

| Area | Choice | Key Constraint Satisfied |
|---|---|---|
| Framework | Next.js 14, App Router, TypeScript | Vanity slug routing, SSR, full-stack monolith (Principle V) |
| Database | Supabase PostgreSQL | ACID, referential integrity, RLS for Principle III |
| ORM | Prisma 5 | Type-safe migrations; Principle I testability |
| Auth | Supabase Auth | Email/password + OAuth, RLS-integrated identity |
| PDF Export | Puppeteer + @sparticuz/chromium | Faithful HTML→PDF reproduction (Principle II) |
| Templates | React components (isomorphic) | Single rendering path for preview + PDF (Principle II) |
| Testing | Jest + RTL + Playwright + jest-axe | TDD (Principle I), WCAG 2.1 AA (Principle IV), visual regression (Principle II) |
| Hosting | Vercel + Supabase | Edge CDN for SC-006, zero infra ops, free tier for v1 |
| Styling | Tailwind CSS v3 | Responsive FR-010, Puppeteer-compatible, minimal CSS bundle |
