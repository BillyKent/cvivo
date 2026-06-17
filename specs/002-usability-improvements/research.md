# Research: Usability Improvements

**Branch**: `002-usability-improvements` | **Date**: 2026-06-17

Interaction/design decisions. No new technology evaluation — the stack is fixed by feature 001.

## Decision 1 — Client-side validation reuses the isomorphic Zod schemas
**Decision**: Add `validateCVForSave(cv)` to `src/lib/validation.ts` that runs in the browser
before save, built on the existing Zod schemas. It returns a structured map of errors keyed by
section id → field path (e.g., `entries[1].role`).
**Rationale**: The Zod schemas are pure TS and already shared by the server routes — running them
client-side keeps **one source of truth** (Principle V) and lets the editor block + mark fields
before any request (US1, FR-001/001a). The server keeps its validation as defense-in-depth.
**Alternatives**: A separate client validation lib (duplicates rules — rejected); HTML5 form
validation (can't express the "empty vs started" entry rule — rejected).

## Decision 2 — "Empty vs started vs complete" entry rule
**Decision**: Before validating/saving, drop entries where **every** field is blank (they are
ignored, not errors). For a started entry, require Experience: role, company, start date;
Education: institution, degree, start date (FR-002a). End date optional (or `current`);
description/field optional.
**Rationale**: Matches how people fill a CV and the clarified spec; avoids punishing a user for an
empty row while still catching half-filled ones.
**Alternatives**: Always-required fields (current 001 behavior — causes the reported error);
no required fields (lets broken entries render — rejected).

## Decision 3 — Skills as a chip/tag input (no library)
**Decision**: Rewrite `SkillsEditor` as a tag input — a text field where typing preserves spaces,
and **Enter or comma** commits the current text as a removable chip; Backspace on an empty field
removes the last chip. Trim whitespace, ignore empties, de-duplicate (FR-005/006).
**Rationale**: Fixes the root cause (the old code split on comma every keystroke, stripping commas
and spaces). A chip model is the familiar pattern and is fully keyboard-accessible. Hand-built to
avoid a dependency (Principle V).
**Alternatives**: A tag-input library (unneeded dependency); "comma-separated that works" plain
field (less clear, harder to edit individual skills).

## Decision 4 — Per-field error display threads through existing components
**Decision**: `CVEditor` holds validation errors in state and passes the relevant message to each
field via the existing `InputField`/`TextareaField` `error` prop (already accessible). Errors clear
as the user edits the field.
**Rationale**: Reuses the accessible field component (Principle IV); no new error UI primitives.

## Decision 5 — Section reordering via move buttons (not drag-and-drop)
**Decision**: Reorder with "Move up / Move down" buttons per section; Contact is pinned first and
not movable/removable. Persist order via the existing `PATCH /api/cvs/:id/sections/order`.
**Rationale**: Keyboard-accessible by default, no DnD dependency (Principle IV + V). DnD can be a
future enhancement.
**Alternatives**: `@dnd-kit`/native HTML5 drag (adds dependency/complexity and needs extra a11y
work — deferred).

## Decision 6 — Structural ops persist immediately; text content stays staged
**Decision**: Add/remove/reorder section persist immediately via their endpoints (`POST`/`DELETE`
sections, `PATCH .../order`). Text-field edits remain staged until the manual **Save changes**.
"Unsaved changes" = staged text edits.
**Rationale**: Structural ops map cleanly to discrete endpoints and are low-risk to apply at once;
keeping them immediate avoids a complex client-side section diff on save while honoring the manual
save model for content.
**Alternatives**: Stage everything and reconcile a full section diff on save (more complex, more
failure modes — rejected for v1).

## Decision 7 — In-app toast notifications (no library)
**Decision**: A small `ToastProvider` (React context) mounted in the dashboard layout, exposing
`toast.success/error(...)`, rendering an ARIA live region. Replace the PDF export `alert()` and add
confirmations for save/publish/copy-link.
**Rationale**: Consistent, on-brand feedback (FR-010/012); accessible; trivial to build, no
dependency (Principle V).

## Decision 8 — Unsaved-changes guard
**Decision**: When staged content is dirty, attach a `beforeunload` warning (tab close/refresh) and
intercept the editor's in-app navigation (the "CVs" back link and Sign out) to confirm first.
**Rationale**: Covers both browser-level and in-app navigation without a router dependency; matches
the manual-save model (FR-011).

## Decision 9 — Contact rendering fix (FR-013)
**Decision**: Render the Contact section as the CV's header block (name + contact line) in all
three templates and never emit a titled "Contact" section with an empty body. Update the shared
`sections.tsx` helper accordingly; re-baseline the visual-regression snapshots.
**Rationale**: Removes the empty-heading artifact (Principle II). Modern already does this; Classic
and Minimal are aligned to match.
