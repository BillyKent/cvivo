# Implementation Plan: CV Editor & App Usability Improvements

**Branch**: `002-usability-improvements` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-usability-improvements/spec.md`

---

## Summary

A usability pass over the existing CVivo app (feature 001). It fixes two reported defects and a
screen-by-screen audit's findings, entirely at the interaction/presentation layer: client-side
validation before save with per-field error markers (US1), a real skills chip input (US2), section
and CV management surfaced in the UI (US3), and consistent in-app feedback with an unsaved-changes
guard (US4). No new stack, no schema changes, and no new API endpoints — it reuses the CV/section
CRUD + reorder and account endpoints already shipped.

---

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 20 (unchanged)

**Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS 3, Zod, Prisma +
Supabase. **No new runtime dependencies** — section reordering uses move buttons (not a
drag-and-drop library), and toasts use a small in-house context (no library).

**Storage**: Existing Supabase Postgres schema — **unchanged** (no migrations).

**Testing**: Jest + React Testing Library + jest-axe (unit/a11y), Playwright (integration + E2E).

**Target Platform**: Web (same browsers/viewports as 001).

**Project Type**: Full-stack Next.js app (existing).

**Performance Goals**: Validation and skills entry are instant (client-side, no network). Save
behavior and SC-006 (shared page < 3s) unchanged.

**Constraints**: Preserve WCAG 2.1 AA and responsive behavior already established. Reuse the
isomorphic Zod schemas in `src/lib/validation.ts` for client validation (no duplicate rules).

**Scale/Scope**: ~6 components touched (CVEditor, the section editors, SkillsEditor rewrite, a new
Toast provider, dashboard CV card actions) + the 3 CV templates (Contact rendering fix). No
backend changes beyond reuse.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First (NON-NEGOTIABLE) — ✅ PASS
- New unit tests: the "empty vs started vs complete" validation rule (FR-002a) and the skills chip
  parsing/dedup (FR-005/006), written before the implementation.
- New E2E: save blocked with per-field markers then succeeds after fix (US1); add a skill with a
  space and a comma (US2); reorder/remove/add sections (US3); rename/delete a CV from the dashboard
  (US3); export error shows in-app, unsaved-changes warning fires (US4).
- The existing build-cv E2E and template visual-regression baselines are updated if the Contact
  rendering fix changes output.

### II. Professional Output Quality — ✅ PASS
- Fixing the empty "Contact" heading (FR-013) improves rendered output across all 3 templates.
- The visual-regression suite (F1, from 001 Polish) re-baselines and guards the change.

### III. User Data Ownership & Privacy — ✅ PASS
- No new data exposure. Structural actions (add/remove/reorder section, rename/delete CV) reuse the
  existing owner-scoped endpoints with their ownership checks and RLS.

### IV. Accessible & Responsive Sharing — ✅ PASS
- Per-field errors use the existing accessible `InputField` (`aria-invalid`, `aria-describedby`,
  `role="alert"`). The skills chip input must be fully keyboard-operable (add via Enter/comma,
  remove via button/Backspace). Reorder via labeled move buttons is keyboard-friendly (preferred
  over drag-only). Toasts use an ARIA live region. Responsive layouts preserved.

### V. Simplicity First (YAGNI) — ✅ PASS
- No new dependencies. Reuse isomorphic Zod schemas for client validation (one source of truth).
- Move buttons instead of a DnD library; a tiny toast context instead of a toast library.

No violations — Complexity Tracking not required.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-usability-improvements/
├── plan.md              ← this file
├── research.md          ← Phase 0: interaction/design decisions
├── data-model.md        ← Phase 1: validation model (no schema changes)
├── contracts/
│   └── changes.md       ← Phase 1: confirms reuse of existing endpoints (no new ones)
├── quickstart.md        ← Phase 1: how to exercise the changes
└── tasks.md             ← Phase 2 (/speckit-tasks — not created here)
```

### Source Code (existing files touched)

```text
src/lib/
  validation.ts                 # add validateCVForSave() — empty/started/complete rule + per-field paths
src/components/cv-editor/
  CVEditor.tsx                  # run client validation before save; thread per-field errors; section
                                #   add/remove/reorder controls; unsaved-changes guard
  SectionEditor.tsx             # pass field errors to each editor
  editors/ExperienceEditor.tsx  # show per-field errors (role/company/start date)
  editors/EducationEditor.tsx   # show per-field errors (institution/degree/start date)
  editors/SkillsEditor.tsx      # REWRITE as a chip input (type → Enter/comma adds; removable)
  SectionManager.tsx (new)      # add/remove/reorder UI (move up/down buttons), Contact fixed first
src/components/cv-templates/
  classic|modern|minimal        # render Contact as a header block, never an empty titled section (FR-013)
  sections.tsx                  # shared Contact-rendering helper
src/components/ui/
  Toast.tsx + ToastProvider (new)  # in-app notifications (replaces alert())
src/components/cv-editor/ExportButton.tsx  # use toast instead of alert()
src/components/dashboard/CVCard.tsx (new)  # per-CV rename + delete (confirm) actions
src/app/(dashboard)/layout.tsx  # mount ToastProvider

tests/
  unit/                         # validateCVForSave, skills chip parsing
  e2e/                          # save-validation, skills, section-management, dashboard-actions, toasts
```

**Structure Decision**: Extend the existing app in place. The biggest single change is making
validation client-side and per-field; everything else is additive UI over endpoints that already
exist. Section structural changes (add/remove/reorder) persist immediately via their endpoints;
text-field content stays staged until the manual **Save changes**, and "unsaved changes" refers to
that staged content.

## Complexity Tracking

No constitution violations; no entries required.
