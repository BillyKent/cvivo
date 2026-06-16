# API Contract: CVivo

**Branch**: `001-cvivo-cv-platform` | **Date**: 2026-06-16
**Base path**: `/api`
**Transport**: HTTPS only (enforced by Vercel; HTTP redirects to HTTPS)
**Auth**: Supabase session cookie (httpOnly, SameSite=Lax). All authenticated endpoints
return `401` when the session is absent or expired.
**CORS**: Same-origin only. The API is consumed exclusively by the Next.js frontend.

---

## Error format (all endpoints)

```json
{ "error": "snake_case_code", "message": "Human-readable detail" }
```

Common codes: `unauthorized` · `forbidden` · `not_found` · `validation_error` · `conflict` ·
`slug_taken` · `slug_invalid_format` · `slug_reserved_word` · `pdf_generation_failed`

---

## Authentication

### POST /api/auth/signup
Create a new user account (email + password).

**Request** `application/json`
```json
{ "email": "user@example.com", "password": "••••••••" }
```

**Responses**
| Status | Body |
|--------|------|
| `201` | `{ "userId": "uuid", "email": "..." }` + sets session cookie |
| `409` | `{ "error": "conflict", "message": "Email already in use" }` |
| `422` | `{ "error": "validation_error", "message": "..." }` |

---

### POST /api/auth/signin
Authenticate with credentials.

**Request** `application/json`
```json
{ "email": "user@example.com", "password": "••••••••" }
```

**Responses**
| Status | Body |
|--------|------|
| `200` | `{ "userId": "uuid" }` + sets session cookie |
| `401` | `{ "error": "unauthorized", "message": "Invalid credentials" }` |

---

### POST /api/auth/signout
Invalidate the current session.

**Response**: `204 No Content`

---

## CVs

### GET /api/cvs
List the authenticated user's CVs, ordered by `updatedAt` descending.

**Response** `200`
```json
[
  {
    "id": "uuid",
    "title": "string",
    "templateId": "classic|modern|minimal",
    "visibility": "PRIVATE|SHARED",
    "updatedAt": "2026-06-16T12:00:00Z"
  }
]
```

---

### POST /api/cvs
Create a new empty CV with default sections.

**Request** `application/json`
```json
{ "title": "My CV" }
```

**Response** `201` — full CV object (same shape as GET /api/cvs/:cvId)

---

### GET /api/cvs/:cvId
Get a CV owned by the authenticated user, including its sections.

**Responses**
| Status | Body |
|--------|------|
| `200` | Full CV object with nested `sections[]` |
| `403` | `forbidden` |
| `404` | `not_found` |

**Response body (200)**
```json
{
  "id": "uuid",
  "title": "string",
  "templateId": "string",
  "visibility": "PRIVATE|SHARED",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "sections": [
    {
      "id": "uuid",
      "type": "CONTACT|SUMMARY|EXPERIENCE|EDUCATION|SKILLS|CUSTOM",
      "title": "string",
      "content": {},
      "position": 0
    }
  ]
}
```

---

### PATCH /api/cvs/:cvId
Update CV metadata.

**Request** `application/json` (all fields optional)
```json
{ "title": "string", "templateId": "string" }
```

**Responses**: `200` (updated CV object) · `403` · `404`

---

### DELETE /api/cvs/:cvId
Delete a CV and all its sections and share links.

**Response**: `204` · `403` · `404`

---

## CV Sections

### GET /api/cvs/:cvId/sections
List sections ordered by `position` ascending.

**Response** `200` — array of section objects (same shape as nested `sections[]` above)

---

### POST /api/cvs/:cvId/sections
Add a section, appended at the highest `position + 1`.

**Request** `application/json`
```json
{
  "type": "EXPERIENCE",
  "title": "Work Experience",
  "content": {}
}
```

**Response** `201` — full section object · `403` · `404`

---

### PATCH /api/cvs/:cvId/sections/:sectionId
Update a section's content or title.

**Request** `application/json` (all fields optional)
```json
{ "title": "string", "content": {} }
```

**Response**: `200` (updated section) · `403` · `404`

---

### DELETE /api/cvs/:cvId/sections/:sectionId
Remove a section. Remaining sections are reindexed (positions compacted).

**Response**: `204` · `403` · `404`

---

### PATCH /api/cvs/:cvId/sections/order
Reorder sections. Provide the complete ordered list of section IDs.

**Request** `application/json`
```json
{ "sectionIds": ["uuid-a", "uuid-b", "uuid-c"] }
```

**Responses**
| Status | Body |
|--------|------|
| `200` | `{ "sections": [...] }` with updated positions |
| `403` | |
| `422` | IDs do not match the CV's sections |

---

## Sharing

### GET /api/cvs/:cvId/share
Get the current share state for a CV.

**Response** `200`
```json
{
  "status": "ACTIVE|REVOKED|NONE",
  "slug": "jane-doe",
  "url": "https://cvivo.com/jane-doe"
}
```
`status = "NONE"` when the CV has never been shared. `slug` and `url` are `null` when
`status = "NONE"`.

---

### POST /api/cvs/:cvId/share
Enable sharing by registering a vanity slug and creating an active share link.

**Request** `application/json`
```json
{ "slug": "jane-doe" }
```

**Responses**
| Status | Body |
|--------|------|
| `201` | `{ "slug": "jane-doe", "url": "https://cvivo.com/jane-doe" }` |
| `403` | CV not owned by caller |
| `409` | `{ "error": "slug_taken", "message": "..." }` — slug in use by another user |
| `422` | `{ "error": "slug_invalid_format" \| "slug_reserved_word", "message": "..." }` |

---

### DELETE /api/cvs/:cvId/share
Revoke the active share link for a CV. The vanity slug remains reserved to the owner (FR-009a).

**Response**: `204` · `403` · `404` (no active share link to revoke)

---

## Export

### POST /api/cvs/:cvId/export/pdf
Generate a PDF of the CV using Puppeteer.

**Responses**
| Status | Headers / Body |
|--------|----------------|
| `200` | `Content-Type: application/pdf` · `Content-Disposition: attachment; filename="cv.pdf"` · binary PDF stream |
| `403` | JSON error |
| `404` | JSON error |
| `503` | `{ "error": "pdf_generation_failed", "message": "..." }` |

---

## Public CV (unauthenticated)

### GET /api/public/:slug
Return CV data for a shared slug. Used by the public page (`/[slug]`). No session required.

**Responses**
| Status | Body |
|--------|------|
| `200` | CV data (see below) |
| `404` | `{ "error": "not_found" }` — slug not found, never existed, or link revoked (no distinction: FR-016) |

**Response body (200)** — minimal, no internal IDs or user data exposed to anonymous callers:
```json
{
  "cv": {
    "title": "string",
    "templateId": "string",
    "sections": [
      {
        "type": "CONTACT|SUMMARY|...",
        "title": "string",
        "content": {}
      }
    ]
  }
}
```

---

## Account

### GET /api/account
Get the authenticated user's profile.

**Response** `200`
```json
{ "id": "uuid", "email": "string", "name": "string|null", "createdAt": "ISO8601" }
```

---

### DELETE /api/account
Permanently delete the account and all associated data (CVs, sections, share links). Triggers
Supabase Auth user deletion. Implements FR-014 and SC-008.

**Response**: `204`

All cascades (CVs → sections, CVs → share links, SlugReservation.userId → null) are executed
atomically in a database transaction before the Supabase Auth deletion call.
