# Data Model: Usability Improvements

**Branch**: `002-usability-improvements` | **Date**: 2026-06-17

## Schema changes

**None.** This feature introduces no new entities, fields, or migrations. It operates on the
existing `User`, `CV`, `CVSection` (notably `SKILLS` content), and `ShareLink` entities and the
existing section `position` ordering from feature 001.

## Client-side validation model (new, not persisted)

`validateCVForSave(cv)` produces an in-memory error map consumed by the editor:

```typescript
type FieldError = { path: string; message: string }; // path e.g. "entries.1.role"
type SectionErrors = Record<string /* sectionId */, FieldError[]>;
type CVValidation = { ok: boolean; errors: SectionErrors };
```

Rules (FR-001a, FR-002, FR-002a):

| Section type | Empty (ignored) | Started → required fields | Optional |
|---|---|---|---|
| CONTACT | all fields blank | fullName | email, phone, location, website, linkedin |
| SUMMARY / CUSTOM | text blank | — (any text is valid) | — |
| EXPERIENCE (per entry) | all entry fields blank | role, company, startDate | endDate (or `current`), description |
| EDUCATION (per entry) | all entry fields blank | institution, degree, startDate | field, endDate (or `current`) |
| SKILLS | no non-empty skills | — (skills are free text) | label |

- Entirely blank entries/sections are stripped before save and never produce errors.
- A started entry missing a required field yields a `FieldError` at that field's path; the editor
  marks the corresponding control and blocks the save.

## SKILLS content (clarified semantics, shape unchanged)

`SKILLS.content` stays `{ groups: [{ label?: string; skills: string[] }] }`. The chip input edits
`skills[]`: each chip is one entry; whitespace is trimmed, empties dropped, duplicates removed.

## Section management (uses existing capabilities)

- Reorder → `position` updates via existing reorder endpoint; Contact pinned at position 0.
- Remove/add Summary/Experience/Education/Skills and add CUSTOM sections → existing section
  create/delete endpoints. Contact is not removable (enforced in the UI and safe server-side since
  it is just another section row).
