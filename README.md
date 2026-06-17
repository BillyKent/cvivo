# CVivo

Create, host, and share a great, professional CV. Write on one side, watch it typeset itself on
the other; publish to a vanity link or export a faithful PDF.

Built with **Next.js 14** (App Router) · **Supabase** (Postgres + Auth + RLS) · **Prisma** ·
**Tailwind CSS** · **Puppeteer** (PDF) · **Jest + Playwright** tests.

## Prerequisites

- Node.js 20 LTS, pnpm 9+
- A Supabase project (free tier) for Postgres + Auth

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create `.env.local` (copy `.env.example`) and fill in your Supabase values — find them in the
   dashboard under **Project Settings → API** and the **Connect → ORMs → Prisma** preset:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   DATABASE_URL=...        # pooled, port 6543, ?pgbouncer=true
   DIRECT_URL=...          # direct, port 5432
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Create the schema and policies:
   ```bash
   pnpm prisma:deploy   # apply migrations (migrate deploy — no shadow DB; works with Supabase)
   pnpm db:rls          # apply Row Level Security policies + the partial unique index
   ```
   > Use `prisma:deploy`, not `prisma migrate dev` — the latter hangs against Supabase (its
   > pooled role can't create the shadow database `migrate dev` requires).
4. Run it:
   ```bash
   pnpm dev             # http://localhost:3000
   ```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev / production build / serve build |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm test` | Jest unit + accessibility tests (no DB needed) |
| `pnpm test:e2e` | Playwright integration + E2E (starts the dev server; needs DB) |
| `pnpm prisma:deploy` / `pnpm db:rls` | Apply migrations / RLS policies (load `.env.local`) |
| `pnpm prisma:studio` | Inspect data |

## Testing

- **Unit + a11y** (Jest, jsdom): section validation, slug rules, template rendering, and a
  jest-axe **WCAG 2.1 AA** audit of the public CV view.
- **Integration + E2E** (Playwright): auth, CV/section CRUD, sharing, public access, PDF export,
  and full user journeys. Tests run against a live Supabase database.
  ```bash
  pnpm exec playwright install chromium   # once
  pnpm exec playwright test --project=desktop
  ```

## Project structure

```
src/app/            Pages + API route handlers (App Router)
  (auth)/           signin, signup
  (dashboard)/      dashboard, cv/[cvId]/edit, account
  [slug]/           public shared CV
  print/[cvId]/     chrome-free render used for PDF export
  api/              auth, cvs, public, account
src/components/     cv-editor, cv-preview, cv-templates, cv-public, ui, account
src/lib/            db, supabase, api helpers, validation, slug, cv, pdf
prisma/             schema, migrations, RLS SQL
tests/              unit, integration, e2e, accessibility
specs/              Spec Kit artifacts (spec, plan, tasks, contracts)
```

## Deployment

Deploy to Vercel (Next.js) with the same environment variables. PDF export uses
`@sparticuz/chromium` in production (Linux serverless) and Playwright's Chromium in local dev.

See [SECURITY.md](./SECURITY.md) for the security posture.
