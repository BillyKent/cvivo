# API Contract Changes: Usability Improvements

**Branch**: `002-usability-improvements` | **Date**: 2026-06-17

**No new endpoints and no changes to existing request/response shapes.** This feature is delivered
on the client over the API already defined in
[`specs/001-cvivo-cv-platform/contracts/api.md`](../../001-cvivo-cv-platform/contracts/api.md).

## Endpoints reused

| Capability (this feature) | Existing endpoint |
|---|---|
| Save CV metadata (title on rename) | `PATCH /api/cvs/:cvId` |
| Save section content (after client validation) | `PATCH /api/cvs/:cvId/sections/:sectionId` |
| Add a section (incl. custom) | `POST /api/cvs/:cvId/sections` |
| Remove a section | `DELETE /api/cvs/:cvId/sections/:sectionId` |
| Reorder sections | `PATCH /api/cvs/:cvId/sections/order` |
| Delete a CV (dashboard) | `DELETE /api/cvs/:cvId` |
| Export personal data (already shipped) | `GET /api/account/export` |

## Behavioral notes (not contract changes)

- **Validation moves to the client first.** The editor runs `validateCVForSave` and only issues the
  above requests when valid; the server's existing 422 validation remains as defense-in-depth and
  should no longer be reached through normal use (no more generic post-submit error).
- **Custom sections** use the existing `CUSTOM` section type (`{ text }` content) — no schema or
  contract change.
- **Contact is not removable**: enforced in the UI. The server treats it as an ordinary section, so
  no endpoint change is needed.
