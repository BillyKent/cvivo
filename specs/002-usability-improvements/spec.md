# Feature Specification: CV Editor & App Usability Improvements

**Feature Branch**: `002-usability-improvements`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Improve the user experience. When editing a CV, if a section is
filled in incompletely the page lets me save but then shows a non-descriptive error saying I
can't save. Also the Skills section's comma separation doesn't work — neither the comma nor the
space is accepted in the skill input. Do a usability analysis of all screens and identify
improvements to implement."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Saving never lies, and tells me what needs attention (Priority: P1)

A job seeker is partway through filling in their CV — they've added a work-experience entry with
a company name but haven't yet typed the role or start date. They click **Save changes**. Today
the page reports a vague "Couldn't save — try again" with no hint of what is wrong or where, even
though it looked like the save was accepted. The user needs their in-progress work to be kept,
and, in the rare case something truly can't be saved, a clear message pointing at the exact spot.

**Why this priority**: Directly reported. It breaks the core "save and return later" promise
(FR-006 of the platform) and erodes trust — the person can't tell whether their work was saved.

**Independent Test**: Add a half-filled experience entry, save, and confirm the work is preserved
on reload with no contradictory error; then enter genuinely invalid data and confirm a specific,
located message appears.

**Acceptance Scenarios**:

1. **Given** an in-progress entry with some fields still blank, **When** the user saves, **Then**
   their work is saved without a blocking error, and the incomplete entry is simply omitted from
   the rendered CV until it is complete.
2. **Given** a save that genuinely cannot complete, **When** it fails, **Then** the user sees a
   specific, plain-language message that names the affected section (and field where applicable),
   shown next to the relevant control — never a bare generic error.
3. **Given** a save attempt, **When** it resolves, **Then** the user sees exactly one outcome — a
   clear "Saved" confirmation **or** a specific error — never both for the same action.
4. **Given** the user returns later, **When** they reopen the CV, **Then** everything they entered
   (including partial entries) is restored exactly.

---

### User Story 2 - Add skills the way people type them (Priority: P1)

A user fills in the Skills section. Today the input strips commas and spaces as they type, so they
cannot enter a multi-word skill like "Technical writing" or separate skills with a comma. The user
needs to add several skills quickly and naturally, and remove ones they change their mind about.

**Why this priority**: Directly reported. The Skills section is effectively unusable for normal
input today.

**Independent Test**: Type a multi-word skill and confirm spaces are kept; add several skills and
confirm each becomes a distinct, removable item; remove one and confirm the rest remain; view the
CV and confirm skills render clearly separated.

**Acceptance Scenarios**:

1. **Given** the skills input, **When** the user types a multi-word skill, **Then** spaces are
   preserved and the whole skill is captured intact.
2. **Given** a typed skill, **When** the user confirms it (e.g., pressing Enter or comma), **Then**
   it is added as a discrete, removable item and the input clears for the next one.
3. **Given** existing skills, **When** the user removes one, **Then** it is deleted and the others
   are preserved in order.
4. **Given** entered skills, **When** the CV renders (preview, shared view, export), **Then** each
   skill appears correctly and clearly separated.

---

### User Story 3 - Manage CV structure and my documents (Priority: P2)

Users want control over their CV's structure and their list of CVs: reorder sections, remove a
section they don't need, add an extra section, and rename or delete a CV from the dashboard.

**Why this priority**: Improves real workflows surfaced by the audit; the underlying capabilities
(section reordering, CV deletion) already exist but are not reachable from the screens.

**Independent Test**: Reorder two sections and confirm the new order persists and shows in the
preview; remove an added section; rename a CV from the dashboard; delete a CV after confirming.

**Acceptance Scenarios**:

1. **Given** the editor, **When** the user reorders sections, **Then** the new order is reflected
   in the preview and persists on reload.
2. **Given** an added (non-essential) section, **When** the user removes it, **Then** it is gone
   from the editor and the CV.
3. **Given** the dashboard, **When** the user renames a CV, **Then** the new title shows
   immediately and persists.
4. **Given** the dashboard, **When** the user deletes a CV, **Then** they are asked to confirm,
   and on confirmation the CV is removed from the list.

---

### User Story 4 - Consistent, trustworthy feedback everywhere (Priority: P3)

Feedback across the app should be consistent and on-brand: no abrupt native browser pop-ups, no
silent loss of work, and clear confirmation of background actions (saving, exporting, copying a
link).

**Why this priority**: Polish that raises perceived quality across every screen; lower urgency
than the two reported defects.

**Acceptance Scenarios**:

1. **Given** any action that succeeds or fails in the background (save, export, publish, copy
   link), **When** it resolves, **Then** the user sees a consistent in-app notification — not a
   native browser alert.
2. **Given** unsaved edits in the editor, **When** the user navigates away, **Then** they are
   warned before losing changes.
3. **Given** a PDF export that fails, **When** it errors, **Then** the message appears in the app's
   own style with a way to retry.

---

### Usability findings by screen *(audit basis for the requirements above)*

- **CV editor**: (a) incomplete entries cause a misleading save error (US1); (b) the Skills input
  rejects commas/spaces (US2); (c) sections cannot be reordered, removed, or added from the UI
  (US3); (d) leaving with unsaved changes loses them silently (US4); (e) date fields are free-text
  with only a placeholder, easy to get wrong; (f) the live preview shows an empty "Contact"
  heading when only the name is filled.
- **Dashboard**: no per-CV actions (rename, delete, duplicate) even though deletion exists in the
  system (US3).
- **Public shared view**: solid; minor — no clear affordance back to creating one's own CV beyond
  the footer link.
- **Share panel**: works; minor — the final link is not previewed as the user types the slug.
- **PDF export**: failures surface as a native browser alert rather than in-app feedback (US4).
- **Sign in / sign up**: clear; minor — no show/hide password control and no password-reset path.
- **Global**: there is no consistent notification pattern for success/error (US4).

### Edge Cases

- A work-experience or education entry with only some fields filled — must save and be omitted
  from output until complete, not block the save.
- A skill typed with surrounding spaces or trailing comma — must be trimmed and added once, with
  no empty skills created.
- Duplicate skills entered — should not create confusing repeats.
- Reordering while a save is in flight — the latest order must win and persist.
- Deleting the CV currently open in the editor (from another tab) — the editor should fail
  gracefully, not with a generic error.
- Navigating away mid-edit on mobile (where the toggle hides the preview) — unsaved-change
  protection must still apply.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Saving a CV MUST preserve all entered content, including partially completed entries;
  an incomplete optional entry MUST NOT block the save.
- **FR-002**: Incomplete or empty entries MUST be omitted from the rendered CV (preview, shared
  view, export) until they contain enough content to display, consistent with the platform's
  empty-section rule.
- **FR-003**: When a save genuinely cannot complete, the system MUST present a specific,
  plain-language message identifying the affected section (and field where applicable) and MUST
  surface it near the relevant control rather than as a single generic banner.
- **FR-004**: A save action MUST resolve to exactly one outcome (success or a specific error) and
  MUST NOT display a success state and an error for the same action.
- **FR-005**: The skills input MUST accept spaces within a skill and MUST allow the user to add
  multiple skills, each as a distinct, removable item; typing a comma or pressing Enter commits the
  current skill.
- **FR-006**: The skills input MUST trim surrounding whitespace, ignore empty entries, and avoid
  creating duplicate skills.
- **FR-007**: Users MUST be able to reorder the sections of a CV from the editor, with the new
  order reflected in the preview and persisted.
- **FR-008**: Users MUST be able to remove a non-essential section and add an additional section
  from the editor.
- **FR-009**: Users MUST be able to rename a CV and delete a CV (with a confirmation step) from the
  dashboard.
- **FR-010**: Background actions (save, publish, copy link, export) MUST report their outcome
  through a consistent in-app notification pattern, not native browser dialogs.
- **FR-011**: The editor MUST warn the user before they navigate away with unsaved changes.
- **FR-012**: PDF export failures MUST be communicated in-app, in the application's visual style,
  with a way to retry.
- **FR-013**: The live preview MUST NOT show a section heading (e.g., "Contact") with no visible
  content beneath it.
- **FR-014**: Validation and error messages throughout the app MUST be written in plain,
  user-facing language (describe what to do), never expose internal codes, and remain consistent in
  tone across screens.

### Key Entities *(include if feature involves data)*

No new data entities. This feature changes interaction and feedback behavior over the existing CV,
CV Section (notably the skills content), and Template entities; section ordering already exists.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of save attempts on a CV with partially filled entries succeed without an error
  message, and the content is restored exactly on reload.
- **SC-002**: When a save error is shown, 100% of those messages identify a specific section (and
  field where applicable); none show only a generic message.
- **SC-003**: A user can add 5 skills — including at least one multi-word skill — in under 30
  seconds, with every skill captured correctly and individually removable.
- **SC-004**: In moderated usability testing, at least 90% of users correctly understand what (if
  anything) went wrong on a failed save without assistance.
- **SC-005**: Zero native browser alert/confirm pop-ups remain for routine success/error feedback
  in the core flows (edit, save, share, export).
- **SC-006**: 100% of attempts to navigate away from the editor with unsaved changes trigger a
  warning before any change is lost.
- **SC-007**: Users can reorder, remove, and add sections, and rename and delete CVs, with each
  change persisting correctly in 100% of attempts.

## Assumptions

- Saving is **permissive by design**: the platform should never lose a user's in-progress work, so
  partially completed entries save successfully and are simply not rendered until complete. True
  validation errors are reserved for genuinely malformed data and are shown inline.
- The improved skills input uses an "add as you go" model (type a skill, press Enter or comma to
  commit it as a removable item). This is treated as the reasonable default; the comma/space defect
  is fixed regardless of the exact interaction chosen.
- This feature is presentation/interaction-level and introduces no new persisted data entities or
  sharing/permission changes; the existing privacy and accessibility guarantees continue to apply.
- The usability scope is the existing screens (landing, sign in/up, dashboard, editor, live
  preview, public shared view, share panel, account, PDF export). New top-level features (e.g.,
  password reset, CV duplication) are noted by the audit but only included where listed in the
  requirements above.
- Accessibility (WCAG 2.1 AA) and responsive behavior already established for these screens MUST be
  preserved by every change.
