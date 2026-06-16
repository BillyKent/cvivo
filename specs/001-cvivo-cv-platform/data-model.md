# Data Model: CVivo CV Builder & Sharing Platform

**Branch**: `001-cvivo-cv-platform` | **Date**: 2026-06-16
**Source**: `spec.md` Key Entities + Clarifications (Session 2026-06-16)

---

## Entity Overview

```
User ──< CV ──< CVSection
               │
               └──< ShareLink >── SlugReservation ──< User
```

A `SlugReservation` is the canonical namespace record for a vanity slug. A `ShareLink` is a
publication event (one CV shared at one slug, at one point in time). The separation implements
FR-009a: revoking a ShareLink does not release the slug back to the global pool.

---

## Schema (Prisma SDL)

### User

Maps to Supabase Auth users. The application `User` table stores the profile; the UUID matches
`auth.uid()` from Supabase Auth so RLS policies can join them without a separate lookup.

```prisma
model User {
  id        String   @id @default(uuid())   // matches Supabase auth.uid()
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cvs              CV[]
  slugReservations SlugReservation[]
  shareLinks       ShareLink[]
}
```

**Constraints**
- `email` is unique (one account per address, enforced at DB and auth level)
- Cascade on delete: User → CVs, ShareLinks (but SlugReservation.userId → SET NULL —
  see below)

---

### CV

```prisma
model CV {
  id         String       @id @default(uuid())
  userId     String
  title      String       @default("My CV")
  templateId String       @default("classic")  // "classic" | "modern" | "minimal"
  visibility CVVisibility @default(PRIVATE)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections   CVSection[]
  shareLinks ShareLink[]
}

enum CVVisibility {
  PRIVATE
  SHARED
}
```

**Constraints**
- `userId` → User (cascade delete)
- `visibility` is kept in sync with the existence of an `ACTIVE` ShareLink for this CV
  (denormalized for read efficiency on public page queries)
- `templateId` is a string key matching a registered template component

---

### CVSection

```prisma
model CVSection {
  id        String        @id @default(uuid())
  cvId      String
  type      CVSectionType
  title     String
  content   Json
  position  Int
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  cv        CV            @relation(fields: [cvId], references: [id], onDelete: Cascade)

  @@unique([cvId, position])
}

enum CVSectionType {
  CONTACT
  SUMMARY
  EXPERIENCE
  EDUCATION
  SKILLS
  CUSTOM
}
```

**Content JSON shapes per section type**

```typescript
// CONTACT
{
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
}

// SUMMARY
{ text: string }

// EXPERIENCE
{
  entries: Array<{
    company: string;
    role: string;
    startDate: string;    // "YYYY-MM" format
    endDate?: string;     // omitted when current = true
    current: boolean;
    description: string;  // free-text; may be multi-paragraph
  }>;
}

// EDUCATION
{
  entries: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
}

// SKILLS
{
  groups: Array<{
    label?: string;       // e.g., "Languages", "Tools"
    skills: string[];
  }>;
}

// CUSTOM
{ text: string }
```

**Constraints**
- `@@unique([cvId, position])`: no two sections at the same position in one CV
- `content` is validated at the application layer (TypeScript discriminated union) before
  persistence; the DB stores raw JSON
- Empty optional sections are not stored; FR-015 is enforced by omitting sections with
  empty content at the template render layer, not at the DB layer

---

### SlugReservation

Canonical registry of slug → owner. Persists even when the associated ShareLink is revoked.
Directly implements FR-009a.

```prisma
model SlugReservation {
  slug       String    @id                       // globally unique vanity slug (PK)
  userId     String?                             // SET NULL on user delete → slug permanently retired
  reservedAt DateTime  @default(now())

  user       User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  shareLinks ShareLink[]
}
```

**Constraints**
- `slug` is the PK — globally unique, never reusable by anyone else once claimed
- `userId` → User with `onDelete: SetNull`: if the owning user deletes their account,
  `userId` becomes `null` and the slug is permanently retired (no one can claim it)

**Slug format rules** (FR-008a, Clarifications 2026-06-16)
- Pattern: `^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$`
- Length: 3–50 characters
- Characters: lowercase letters, digits, hyphens; no leading or trailing hyphen
- Blocklist (reserved platform words, checked case-insensitively):
  `admin`, `api`, `login`, `signup`, `signin`, `signout`, `dashboard`, `cv`, `cvs`,
  `account`, `export`, `public`, `static`, `assets`, `_next`, `favicon`

---

### ShareLink

One row per publication event. A user who revokes and then re-registers the same slug
creates a new ShareLink row; old rows are retained for audit history.

```prisma
model ShareLink {
  id        String          @id @default(uuid())
  slug      String
  cvId      String
  userId    String
  status    ShareLinkStatus @default(ACTIVE)
  createdAt DateTime        @default(now())
  revokedAt DateTime?

  slugReservation SlugReservation @relation(fields: [slug], references: [slug])
  cv              CV              @relation(fields: [cvId], references: [id], onDelete: Cascade)
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([slug, status])
}

enum ShareLinkStatus {
  ACTIVE
  REVOKED
}
```

**Constraints**
- At most one `ACTIVE` ShareLink per slug at any time (enforced at application layer before
  insert; a unique partial index on `(slug) WHERE status = 'ACTIVE'` enforces it at the DB)
- `slug` must exist in `SlugReservation` (FK) before a ShareLink can be created
- `cvId` → CV (cascade delete: deleting a CV hard-deletes its share links)
- `userId` → User (cascade delete: user deletion removes share links; `SlugReservation.userId`
  becomes null separately, retiring the slug)

---

## State Transitions

### CV Visibility

```
PRIVATE ──(POST /share with slug)──> SHARED
SHARED  ──(DELETE /share)──────────> PRIVATE
```

`CV.visibility` is updated atomically with the ShareLink status change in a single transaction.

### ShareLink / Slug Lifecycle

```
(first claim)
─────────────> SlugReservation.slug created (userId = owner)
               ShareLink created (status = ACTIVE)
               CV.visibility = SHARED

(revoke)
               ShareLink.status = REVOKED, revokedAt = now()
               CV.visibility = PRIVATE
               SlugReservation unchanged (slug stays reserved)

(re-register same slug by same owner)
               new ShareLink created (status = ACTIVE), pointing to same or different CV
               CV.visibility = SHARED

(account deletion)
               ShareLinks hard-deleted
               CVs cascade-deleted
               SlugReservation.userId = NULL (slug permanently retired — no new owner possible)
```

---

## Indexes

```sql
-- Hot path: public CV page lookup by slug
CREATE UNIQUE INDEX idx_share_links_slug_active
  ON share_links(slug)
  WHERE status = 'ACTIVE';

-- Dashboard: list CVs by user
CREATE INDEX idx_cvs_user_id ON cvs(user_id);

-- Editor & preview: sections in order
CREATE INDEX idx_cv_sections_cv_id_position ON cv_sections(cv_id, position);
```

---

## Row Level Security (Supabase) — Policy Summary

| Table | Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| users | authenticated | own row | own row | own row | own row |
| cvs | authenticated | own rows | own rows | own rows | own rows |
| cv_sections | authenticated | via own CV | via own CV | via own CV | via own CV |
| slug_reservations | authenticated | own rows | own rows | — | — |
| share_links | authenticated | own rows | own rows | own rows | own rows |
| share_links | anon | `status = ACTIVE` only | — | — | — |
| cvs | anon | via active share_link | — | — | — |
| cv_sections | anon | via active share_link | — | — | — |

The `anon` role policies enable the public CV page (`/[slug]`) to read exactly the data it
needs without exposing any other user data. No user ID is returned to anonymous callers.
