# Quickstart: Exercising the Usability Improvements

**Branch**: `002-usability-improvements` | **Date**: 2026-06-17

Setup is unchanged from feature 001 (see
[`specs/001-cvivo-cv-platform/quickstart.md`](../../001-cvivo-cv-platform/quickstart.md)):
`pnpm install`, `.env.local`, `pnpm prisma:deploy`, `pnpm db:rls`, `pnpm dev`. No migrations.

## Manual walkthrough

1. **Validation before save (US1)**: In the editor, click **Add experience**, type only a company,
   then **Save changes**. Expect: the save is blocked and the empty **Role** and **Start date**
   fields are marked with specific messages — with no network request and no generic error. Fill
   them (or remove the entry) and save again → "Saved".
2. **Skills (US2)**: In Skills, type `Technical writing` and press Enter → it becomes one chip
   (space preserved). Type `Go,` → committed on the comma. Remove a chip with its × (or Backspace
   on an empty field). View the preview → skills are clearly separated.
3. **Section management (US3)**: Use Move up/down to reorder a section (Contact stays first); remove
   the Education section and re-add it; add a custom section with a title and text. Reload → order
   and structure persist.
4. **Dashboard actions (US3)**: From a CV card, rename the CV and delete a CV (with confirmation).
5. **Feedback (US4)**: Trigger a PDF export failure (e.g., offline) → an in-app toast appears (no
   browser alert). Edit a field and try to leave the editor → an unsaved-changes warning appears.
6. **Contact rendering (FR-013)**: With only a name filled, the preview shows the name as the header
   with no empty "Contact" heading.

## Tests

```bash
pnpm test                                   # unit + a11y (incl. validateCVForSave, skills chip)
pnpm exec playwright test --project=desktop # integration + e2e (incl. new usability flows)
```

If the Contact rendering fix changes template output, refresh the visual-regression baselines:

```bash
pnpm exec playwright test tests/e2e/visual-regression.spec.ts --project=desktop --update-snapshots
```
