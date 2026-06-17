---
description: "Task list for CVivo CV Builder & Sharing Platform implementation"
---

# Tasks: CVivo CV Builder & Sharing Platform

**Input**: Design documents from `specs/001-cvivo-cv-platform/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md)

**Tests**: REQUIRED per Constitution Principle I (Test-First, NON-NEGOTIABLE). Every test task MUST be written and MUST fail before its corresponding implementation task begins.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths are relative to the repository root

## Path Conventions (from plan.md)

Next.js 14 App Router monolith: `src/app/` (pages + API route handlers), `src/components/`, `src/lib/`, `src/types/`, `tests/`, `prisma/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [X] T001 Initialize Next.js 14 project (App Router, TypeScript, Node 20) in repository root — `package.json`, `next.config.mjs`, `tsconfig.json`
- [X] T002 Install dependencies (`next`, `react`, `@supabase/ssr`, `@supabase/supabase-js`, `prisma`, `@prisma/client`, `puppeteer-core`, `@sparticuz/chromium`, `tailwindcss`, `jest`, `@testing-library/react`, `jest-axe`, `@playwright/test`) — `package.json`
- [X] T003 [P] Configure ESLint + Prettier — `.eslintrc.json`, `.prettierrc`
- [X] T004 [P] Configure Tailwind CSS v3 — `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`
- [X] T005 [P] Configure Jest + React Testing Library + jest-axe — `jest.config.ts`, `jest.setup.ts`
- [X] T006 [P] Configure Playwright (mobile/tablet/desktop projects at 375/768/1280 px) — `playwright.config.ts`
- [X] T007 [P] Create environment template and ensure secrets are git-ignored — `.env.example`, `.gitignore`
- [X] T008 Create base directory structure — `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `tests/{unit,integration,e2e,accessibility}/`, `prisma/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Define Prisma schema for all entities (User, CV, CVSection, SlugReservation, ShareLink + `CVVisibility`, `CVSectionType`, `ShareLinkStatus` enums) per data-model.md — `prisma/schema.prisma`
- [X] T010 Generate and apply initial Prisma migration — `prisma/migrations/`
- [X] T011 [P] Create Supabase Row Level Security policy migration (authenticated own-row access; anon read via active share link) per data-model.md RLS table — `prisma/migrations/` (raw SQL)
- [X] T012 [P] Create Prisma seed for template reference keys (`classic`, `modern`, `minimal`) — `prisma/seed.ts`
- [X] T013 [P] Implement Prisma client singleton — `src/lib/db.ts`
- [X] T014 [P] Implement Supabase client helpers (server + browser variants via `@supabase/ssr`) — `src/lib/supabase.ts`
- [X] T015 [P] Define shared TypeScript types (`CVData`, `SectionContent` discriminated union, API request/response types) per data-model.md content shapes — `src/types/cv.ts`, `src/types/api.ts`
- [X] T016 [P] Implement API response/error helper (snake_case error format per contracts/api.md) — `src/lib/api.ts`
- [X] T017 Implement auth middleware (Supabase session refresh + protected-route gating) — `src/middleware.ts`
- [X] T018 [P] Create root layout and global providers — `src/app/layout.tsx`
- [X] T019 [P] Create shared UI primitives (Button, Input, TextArea, Toast) — `src/components/ui/`
- [X] T020 [P] Integration tests for auth flow (signup `201`/`409`/`422`, signin `200`/`401`, signout `204`) — `tests/integration/auth.spec.ts`
- [X] T021 Implement auth route handlers wrapping Supabase Auth (signup, signin, signout) + OAuth callback — `src/app/api/auth/signup/route.ts`, `src/app/api/auth/signin/route.ts`, `src/app/api/auth/signout/route.ts`, `src/app/api/auth/callback/route.ts`
- [X] T022 [P] Build signup and signin pages — `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/signin/page.tsx`

**Checkpoint**: Foundation ready — authenticated session, database, RLS, and types in place. User story implementation can now begin.

---

## Phase 3: User Story 1 - Build a professional CV (Priority: P1) 🎯 MVP

**Goal**: An authenticated user can create a CV, fill standard sections in an editor, see a live professionally formatted preview, switch templates without content loss, save, and reload exactly.

**Independent Test**: Create an account, enter content across all standard sections, select a template, save, reload — confirm the rendered CV is complete, accurate, professionally formatted, and content survives a template switch. No sharing or export required.

### Tests for User Story 1 (Test-First — write FIRST, ensure they FAIL) ⚠️

- [X] T023 [P] [US1] Integration tests for CV CRUD endpoints (GET/POST `/api/cvs`, GET/PATCH/DELETE `/api/cvs/:cvId`, incl. `403`/`404` ownership) — `tests/integration/cvs.spec.ts`
- [X] T024 [P] [US1] Integration tests for section endpoints (GET/POST, PATCH/DELETE, reorder; ownership enforcement) — `tests/integration/sections.spec.ts`
- [X] T025 [P] [US1] Unit tests for section content validation (each `CVSectionType` shape) — `tests/unit/section-validation.test.ts`
- [X] T026 [P] [US1] Unit tests for the 3 template components (render content, omit empty sections per FR-015, Unicode/LTR per FR-017) — `tests/unit/templates.test.tsx`
- [X] T027 [P] [US1] E2E test: sign up → build CV across all sections → save → reload → switch template with no content loss — `tests/e2e/build-cv.spec.ts`

### Implementation for User Story 1

- [X] T028 [P] [US1] Implement section content validation (discriminated union per content shapes) — `src/lib/validation.ts`
- [X] T029 [US1] Implement CV CRUD route handlers (last-write-wins save per clarification) — `src/app/api/cvs/route.ts`, `src/app/api/cvs/[cvId]/route.ts`
- [X] T030 [US1] Implement section CRUD route handlers — `src/app/api/cvs/[cvId]/sections/route.ts`, `src/app/api/cvs/[cvId]/sections/[sectionId]/route.ts`
- [X] T031 [US1] Implement section reorder route handler (position compaction) — `src/app/api/cvs/[cvId]/sections/order/route.ts`
- [X] T032 [P] [US1] Implement template registry (templateId → component map) — `src/components/cv-templates/registry.ts`
- [X] T033 [P] [US1] Implement Classic template (omits empty sections, LTR Unicode, natural scroll per FR-004a) — `src/components/cv-templates/classic/index.tsx`
- [X] T034 [P] [US1] Implement Modern template — `src/components/cv-templates/modern/index.tsx`
- [X] T035 [P] [US1] Implement Minimal template — `src/components/cv-templates/minimal/index.tsx`
- [X] T036 [US1] Implement live preview component (renders active template from edit state, <200 ms update) — `src/components/cv-preview/CVPreview.tsx`
- [X] T037 [P] [US1] Implement section editor components (contact, summary, experience, education, skills) — `src/components/cv-editor/`
- [X] T038 [US1] Implement dashboard page (list + create CVs) — `src/app/(dashboard)/dashboard/page.tsx`
- [X] T039 [US1] Implement CV editor page (editor + live preview + template switcher + save) — `src/app/(dashboard)/cv/[cvId]/edit/page.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the deployable MVP.

---

## Phase 4: User Story 2 - Share a CV via a link (Priority: P2)

**Goal**: A user publishes a CV at a chosen vanity slug to a read-only public page, viewable by unauthenticated visitors across screen sizes and meeting WCAG 2.1 AA, and can revoke the link (slug stays reserved to them per FR-009a).

**Independent Test**: Take an existing CV, register a vanity slug, open the public link in an unauthenticated session on mobile/tablet/desktop, then revoke and confirm subsequent visits show a friendly 404.

### Tests for User Story 2 (Test-First — write FIRST, ensure they FAIL) ⚠️

- [X] T040 [P] [US2] Unit tests for slug validation (format regex, 3–50 length, no leading/trailing hyphen, reserved-word blocklist) per FR-008a — `tests/unit/slug.test.ts`
- [X] T041 [P] [US2] Integration tests for share endpoints (POST `201`/`409 slug_taken`/`422 slug_invalid_format`/`slug_reserved_word`; DELETE revoke; FR-009a slug stays reserved to original owner) — `tests/integration/share.spec.ts`
- [X] T042 [P] [US2] Integration tests for public endpoint (active `200`; revoked → `404`; nonexistent → `404`; no user identity leaked) — `tests/integration/public.spec.ts`
- [X] T043 [P] [US2] Accessibility test: jest-axe WCAG 2.1 AA audit of public CV view, zero critical violations per SC-005 — `tests/accessibility/public-cv.test.tsx`
- [X] T044 [P] [US2] E2E responsive test: share → open as anon at 375/768/1280 px → revoke → confirm immediate 404 (SC-007) — `tests/e2e/share-cv.spec.ts`

### Implementation for User Story 2

- [X] T045 [P] [US2] Implement slug validation (format regex + reserved-word blocklist) — `src/lib/slug.ts`
- [X] T046 [US2] Implement share route handlers (GET/POST/DELETE) with SlugReservation creation, ShareLink lifecycle, CV.visibility sync, FR-009a reservation logic — `src/app/api/cvs/[cvId]/share/route.ts`
- [X] T047 [US2] Implement public CV data endpoint (GET `/api/public/:slug`, returns only CV content, `404` on missing/revoked per FR-016) — `src/app/api/public/[slug]/route.ts`
- [X] T048 [US2] Implement public CV page (SSR for SC-006, responsive FR-010, reuses template components) — `src/app/[slug]/page.tsx`
- [X] T049 [US2] Implement share panel in editor (enable sharing, slug input with inline validation feedback, copy URL, revoke) — `src/components/cv-editor/SharePanel.tsx`
- [X] T050 [US2] Implement friendly not-found page for invalid/revoked links (FR-016) — `src/app/[slug]/not-found.tsx`

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Export a CV as a document (Priority: P3)

**Goal**: A user exports a CV as a PDF that faithfully reproduces the on-screen layout and paginates cleanly.

**Independent Test**: Export an existing CV; confirm the PDF visually matches the on-screen CV, contains all content, and paginates a multi-page CV with no clipped or overlapping text.

### Tests for User Story 3 (Test-First — write FIRST, ensure they FAIL) ⚠️

- [X] T051 [P] [US3] Integration test for PDF export endpoint (returns `application/pdf`, attachment headers, all content present) — `tests/integration/export.spec.ts`
- [X] T052 [P] [US3] E2E test: export single-page and multi-page CVs → assert clean pagination, no clipped text (SC-004) — `tests/e2e/export-pdf.spec.ts`

### Implementation for User Story 3

- [X] T053 [US3] Implement Puppeteer PDF helper (`@sparticuz/chromium`, renders the same template HTML, A4 + `printBackground`, clean pagination per FR-012) — `src/lib/pdf.ts`
- [X] T054 [US3] Implement export route handler (POST `/api/cvs/:cvId/export/pdf`, `503 pdf_generation_failed` on error) — `src/app/api/cvs/[cvId]/export/pdf/route.ts`
- [X] T055 [US3] Implement export button in editor — `src/components/cv-editor/ExportButton.tsx`

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Privacy/account management (FR-014, SC-008) and quality hardening spanning all stories

- [ ] T056 [P] Integration tests for account endpoints (GET profile; DELETE cascades CVs + sections + share links, retires slugs, SC-008 = 100%) — `tests/integration/account.spec.ts`
- [ ] T057 Implement account endpoints (GET `/api/account`; data export; DELETE with atomic cascade + `SlugReservation.userId` SET NULL per data-model.md) — `src/app/api/account/route.ts`
- [ ] T058 Implement account settings page (view profile, export personal data, delete account per FR-014) — `src/app/(dashboard)/account/page.tsx`
- [ ] T059 [P] Performance validation: shared CV page viewable within 3 s on broadband (SC-006) — `tests/e2e/performance.spec.ts`
- [ ] T060 [P] Add empty-state and loading states across dashboard and editor
- [ ] T061 Security hardening review (verify RLS coverage on every table, HTTPS enforced, public endpoint leaks no user identity)
- [ ] T062 [P] Update README with setup steps from quickstart.md — `README.md`
- [ ] T063 Run quickstart.md validation end-to-end (fresh clone → install → migrate → dev → tests pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational completion
  - Can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on US1 + US2 existing (account deletion cascades over CVs and share links)

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational. No dependencies on other stories.
- **US2 (P2)**: Depends on Foundational. Reuses US1's template components for the public page, but is independently testable (can share any existing CV).
- **US3 (P3)**: Depends on Foundational. Reuses US1's template components for PDF rendering, but is independently testable.

### Within Each User Story

- Tests MUST be written and MUST fail before implementation (Principle I)
- Validation/lib helpers → API route handlers → UI components → page integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] (T003–T007) can run in parallel
- Most Foundational tasks marked [P] (T011–T016, T018–T020) can run in parallel after the schema/migration (T009–T010)
- Once Foundational completes, US1/US2/US3 can be staffed in parallel
- All test tasks within a story (marked [P]) can run in parallel
- The 3 template components (T033–T035) can be built in parallel

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests together first (they must fail):
Task: "Integration tests for CV CRUD endpoints in tests/integration/cvs.spec.ts"
Task: "Integration tests for section endpoints in tests/integration/sections.spec.ts"
Task: "Unit tests for section content validation in tests/unit/section-validation.test.ts"
Task: "Unit tests for the 3 template components in tests/unit/templates.test.tsx"
Task: "E2E test build-cv in tests/e2e/build-cv.spec.ts"

# Then build the 3 templates in parallel:
Task: "Implement Classic template in src/components/cv-templates/classic/index.tsx"
Task: "Implement Modern template in src/components/cv-templates/modern/index.tsx"
Task: "Implement Minimal template in src/components/cv-templates/minimal/index.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: test US1 independently (build, save, reload, switch template)
5. Deploy/demo — this is a usable CV builder

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → test → deploy (MVP: create CVs)
3. US2 → test → deploy (add: share via vanity link)
4. US3 → test → deploy (add: PDF export)
5. Polish → account management + hardening
6. Each story adds value without breaking previous ones

### Parallel Team Strategy

After Foundational completes: Developer A on US1, Developer B on US2, Developer C on US3. Stories integrate independently; account/polish work happens once US1+US2 land.

---

## Notes

- [P] = different files, no dependencies on incomplete tasks
- [Story] label maps each task to a user story for traceability
- Verify every test fails before implementing (Red-Green-Refactor)
- Commit after each task or logical group; reviewed PRs only (Constitution governance)
- Stop at any checkpoint to validate a story independently
- 63 tasks total: Setup 8, Foundational 14, US1 17, US2 11, US3 5, Polish 8
