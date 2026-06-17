# Security posture

A review of how CVivo protects user data, mapped to the project constitution (Principle III —
User Data Ownership & Privacy) and the feature requirements.

## Authentication & sessions
- Authentication is handled by **Supabase Auth** (email/password). Sessions live in httpOnly,
  SameSite=Lax cookies, refreshed in middleware on every request.
- `getUser()` (which revalidates against Supabase) is used server-side — never the unverified
  `getSession()` — to resolve the caller's identity.

## Authorization (FR-013)
- **Every** authenticated route handler resolves the user id and checks ownership before reading
  or mutating a CV/section/share link (`loadOwnedCV` / `assertOwnedCV` → 403/404).
- **Row Level Security** is enabled on all tables as defense-in-depth (`prisma/sql/rls-and-constraints.sql`):
  authenticated users can only touch their own rows; the `anon` role can read a CV and its
  sections only through an `ACTIVE` share link. Application access goes through Prisma (a
  privileged connection that bypasses RLS), so ownership is enforced in code first; RLS guards
  any access made via the Supabase anon/authenticated API.

## Privacy & sharing (FR-007/008/009/009a)
- CVs are **private by default** (`visibility = PRIVATE`).
- Sharing is an **explicit, revocable** action: it creates an `ACTIVE` share link at a validated
  vanity slug. Revoking flips it to `REVOKED` (the public page then 404s) and sets the CV back to
  `PRIVATE`.
- A slug is **permanently reserved to its first owner**; no other account can ever claim it, even
  after the owner deletes their account (the reservation's `user_id` is set NULL — retired).

## Data exposure
- The public endpoint/page (`/api/public/:slug`, `/[slug]`) returns **only CV content** — never the
  owner's id or account email. Verified by an integration test.
- Invalid/revoked/nonexistent links return a friendly 404 without revealing whether the CV exists
  (FR-016).

## Data ownership (FR-014, SC-008)
- Users can **view** (dashboard/editor), **export** (`GET /api/account/export` — full JSON), and
  **permanently delete** (`DELETE /api/account`) their data. Deletion cascades CVs → sections →
  share links and retires reserved slugs, then removes the Supabase Auth user.

## Transport & secrets
- HTTPS is enforced by the hosting platform (Vercel) in production.
- Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) live only in environment variables;
  `.env*` is git-ignored (`.env.example` is the tracked template). The service-role client is
  used only in trusted server code (signup, account deletion) and never imported into client
  bundles.

## Known follow-ups
- PDF export in production renders via a self-request to `/print/[cvId]` forwarding the caller's
  cookie; confirm this path on a real Vercel deploy (not testable on local Windows).
- Rate limiting on auth and share endpoints is not yet implemented (future hardening).
