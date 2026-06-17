---
description: "Task list for CV Editor & App Usability Improvements"
---

# Tasks: CV Editor & App Usability Improvements

**Input**: Design documents from `specs/002-usability-improvements/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/changes.md](./contracts/changes.md)

**Tests**: REQUIRED (Constitution Principle I, Test-First). Write tests before implementation; they must fail first.

**Organization**: Grouped by user story. This feature extends the existing app (feature 001) — no new stack, no migrations, no new API endpoints.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- All paths are relative to the repository root

---

## Phase 1: Setup

- [ ] T001 Run the existing Jest and Playwright suites to confirm a green regression baseline before any change — `pnpm test` and `pnpm exec playwright test --project=desktop`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared feedback infrastructure used by multiple stories

- [ ] T002 Implement `ToastProvider` + `useToast` hook + accessible `Toast` UI (ARIA live region) in `src/components/ui/Toast.tsx`, export from `src/components/ui/index.ts`, and mount the provider in `src/app/(dashboard)/layout.tsx`

**Checkpoint**: In-app notifications available to the editor and dashboard.

---

## Phase 3: User Story 1 - Validation up front, with each field's error marked (Priority: P1) 🎯 MVP

**Goal**: The editor validates on the client before saving; each invalid field is marked in place with a specific message; entirely empty sections are not errors.

**Independent Test**: Leave required fields of a started entry blank → save is blocked with each field marked inline (no network call); complete/remove the entry → save succeeds with a single clear confirmation.

### Tests for User Story 1 (write first, must fail) ⚠️

- [ ] T003 [P] [US1] Unit tests for `validateCVForSave` — all-blank entry ignored; started entry requires the fields in FR-002a; returns per-field error paths — `tests/unit/cv-validation.test.ts`
- [ ] T004 [P] [US1] E2E: save blocked with per-field markers and no network request, then succeeds after fixing/removing the entry — `tests/e2e/save-validation.spec.ts`

### Implementation for User Story 1

- [ ] T005 [US1] Implement `validateCVForSave(cv)` in `src/lib/validation.ts` (reuse existing Zod schemas; drop all-blank entries; required fields per FR-002a; return `{ ok, errors }` keyed by section id → field path)
- [ ] T006 [US1] In `src/components/cv-editor/CVEditor.tsx`: run `validateCVForSave` before saving; if invalid, abort with no request and set per-field error state; strip all-blank entries before persisting; keep a single save outcome (Saved **or** errors, never both)
- [ ] T007 [US1] Thread per-field errors from CVEditor through `src/components/cv-editor/SectionEditor.tsx` to each field editor; clear a field's error as the user edits it
- [ ] T008 [P] [US1] Show per-field errors for role/company/start date in `src/components/cv-editor/editors/ExperienceEditor.tsx`
- [ ] T009 [P] [US1] Show per-field errors for institution/degree/start date in `src/components/cv-editor/editors/EducationEditor.tsx`

**Checkpoint**: Saving an incomplete CV is blocked client-side with clear, located messages — the reported defect is fixed.

---

## Phase 4: User Story 2 - Add skills the way people type them (Priority: P1)

**Goal**: The skills input accepts spaces, commits skills on Enter/comma as removable chips, trims, ignores empties, and de-duplicates.

**Independent Test**: Type a multi-word skill (space preserved) and a comma-committed skill; remove a chip; confirm the rendered CV shows them clearly separated.

### Tests for User Story 2 (write first, must fail) ⚠️

- [ ] T010 [P] [US2] Unit/component tests for the skills chip input — space preserved within a skill, Enter and comma commit, surrounding whitespace trimmed, empty ignored, duplicates removed — `tests/unit/skills-input.test.tsx`
- [ ] T011 [P] [US2] E2E: add a multi-word skill and a comma-committed skill, remove one, and verify they render in the preview — `tests/e2e/skills.spec.ts`

### Implementation for User Story 2

- [ ] T012 [US2] Rewrite `src/components/cv-editor/editors/SkillsEditor.tsx` as a chip/tag input (type → Enter/comma commits a removable chip; × button and Backspace-on-empty remove; trim + dedup), keeping the `{ groups: [{ label?, skills[] }] }` content shape

**Checkpoint**: The Skills section is usable; the reported defect is fixed.

---

## Phase 5: User Story 3 - Manage CV structure and my documents (Priority: P2)

**Goal**: Reorder/remove/add sections in the editor (Contact pinned first) and rename/delete CVs from the dashboard, reusing existing endpoints.

**Independent Test**: Reorder a section, remove + re-add one, add a custom section; reload and confirm persistence. Rename and delete a CV from the dashboard (with confirmation).

### Tests for User Story 3 (write first, must fail) ⚠️

- [ ] T013 [P] [US3] E2E: reorder (Contact stays first), remove + re-add a section, add a custom section; structure/order persist on reload — `tests/e2e/section-management.spec.ts`
- [ ] T014 [P] [US3] E2E: rename a CV and delete a CV (with confirmation) from the dashboard — `tests/e2e/dashboard-actions.spec.ts`

### Implementation for User Story 3

- [ ] T015 [P] [US3] Create `src/components/cv-editor/SectionManager.tsx` — move up/down (Contact pinned first, not movable/removable), remove (Summary/Experience/Education/Skills), and add section incl. custom (free title + text)
- [ ] T016 [US3] Integrate SectionManager into `src/components/cv-editor/CVEditor.tsx`; reflect order/structure in the preview; persist structural changes immediately via existing section create/delete/order endpoints
- [ ] T017 [P] [US3] Create `src/components/dashboard/CVCard.tsx` with rename (PATCH title) and delete (confirm → DELETE) actions, using toasts for feedback
- [ ] T018 [US3] Use `CVCard` in `src/app/(dashboard)/dashboard/page.tsx`

**Checkpoint**: Users control their CV structure and document list from the UI.

---

## Phase 6: User Story 4 - Consistent, trustworthy feedback (Priority: P3)

**Goal**: In-app notifications replace native alerts; unsaved staged edits are protected on navigation.

**Independent Test**: Trigger a PDF export failure → in-app toast (no browser alert); edit a field and attempt to leave → unsaved-changes warning.

### Tests for User Story 4 (write first, must fail) ⚠️

- [ ] T019 [P] [US4] E2E: export failure surfaces an in-app toast (no native dialog); navigating away with unsaved staged edits triggers a warning — `tests/e2e/feedback.spec.ts`

### Implementation for User Story 4

- [ ] T020 [US4] Replace the `alert()` in `src/components/cv-editor/ExportButton.tsx` with a toast error + retry affordance
- [ ] T021 [US4] Add success toasts for save, publish, and copy-link in `src/components/cv-editor/CVEditor.tsx` and `src/components/cv-editor/SharePanel.tsx`
- [ ] T022 [US4] Add an unsaved-changes guard in `src/components/cv-editor/CVEditor.tsx` (beforeunload when staged content is dirty + confirm on the in-app "CVs" back link and Sign out)

**Checkpoint**: Feedback is consistent and on-brand; work isn't lost silently.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T023 [P] Fix Contact rendering (FR-013) in `src/components/cv-templates/sections.tsx` and the three templates so a Contact section never shows as a titled section with an empty body — render contact as the header block in all templates
- [ ] T024 Re-baseline the visual-regression snapshots after the Contact fix — `pnpm exec playwright test tests/e2e/visual-regression.spec.ts --project=desktop --update-snapshots`
- [ ] T025 [P] Plain-language copy pass (FR-014): ensure no internal error codes surface to users and tone is consistent across editor, auth, and share
- [ ] T026 [P] Accessibility check (jest-axe + keyboard) for the new components — skills chip input, toasts, section manager
- [ ] T027 Update the existing build-cv E2E if labels/flows changed, then run the full suite green — `pnpm test` and `pnpm exec playwright test --project=desktop`

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: none.
- **Foundational (Phase 2)**: depends on Setup; ToastProvider is used by US3/US4 (US1/US2 don't require it).
- **US1 (P1)** and **US2 (P1)**: depend only on Setup; independent of each other (different files — validation/editors vs SkillsEditor) and can run in parallel.
- **US3 (P2)**: depends on Foundational (toasts for delete/rename feedback); independent of US1/US2.
- **US4 (P3)**: depends on Foundational (toasts); the unsaved-changes guard touches CVEditor (coordinate with US1's CVEditor edits).
- **Polish (Phase 7)**: after the stories; T024 depends on T023.

### Within each story

- Tests first (must fail), then implementation.
- US1: validation lib (T005) → CVEditor wiring (T006) → SectionEditor threading (T007) → field editors (T008/T009).

### Parallel opportunities

- US1 and US2 can be built in parallel by different people.
- Test tasks marked [P] within a story run together.
- T008/T009 (different editor files) run in parallel; T015 and T017 (section manager vs CV card) run in parallel.

---

## Implementation Strategy

### MVP first (the two reported defects)

1. Phase 1 Setup + Phase 2 Foundational.
2. **US1** (validation feedback) and **US2** (skills input) — the P1 reported bugs. Stop and validate; this already resolves the user's explicit complaints.
3. Then US3, US4, and Polish incrementally.

### Notes

- No new dependencies, migrations, or endpoints — reuse feature 001's API (see contracts/changes.md).
- Structural section ops persist immediately; text content stays staged until the manual Save.
- Re-baseline visual snapshots (T024) only after the Contact rendering change.
- 27 tasks: Setup 1, Foundational 1, US1 7, US2 3, US3 6, US4 4, Polish 5.
