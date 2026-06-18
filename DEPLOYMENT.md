# Deployment

## CI (GitHub Actions)

- **`.github/workflows/ci.yml`** runs on every push/PR: `prisma generate` → `typecheck` →
  `pnpm test` (Jest unit + a11y) → `pnpm build`. No secrets or database needed; always-green signal.
- **`.github/workflows/e2e.yml`** is **manual** (Actions → E2E → "Run workflow"). It runs the full
  Playwright suite against a real Supabase project and creates throwaway test accounts in it, so it
  is opt-in. Add these repository secrets first (Settings → Secrets and variables → Actions):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `DATABASE_URL`, `DIRECT_URL`.

## Deploy to Vercel

1. Push is already on GitHub. In Vercel: **Add New → Project → import `BillyKent/cvivo`**.
   Framework auto-detects as Next.js; no build config needed.
2. Add the environment variables (Project → Settings → Environment Variables) for Production
   (and Preview): the same five as `.env.example` —
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `DATABASE_URL` (pooled, port 6543), `DIRECT_URL` (direct, 5432) — and set
   `NEXT_PUBLIC_APP_URL` to your deployed URL (e.g. `https://cvivo.vercel.app`).
3. The database schema must already exist in that Supabase project. From a machine with the
   production `.env.local`: `pnpm prisma:deploy` then `pnpm db:rls`.
4. Deploy.

### PDF export in production

- Production uses `puppeteer-core` + `@sparticuz/chromium` (a Linux serverless Chromium); local dev
  uses Playwright's Chromium. The export route sets `maxDuration = 60`.
- `@sparticuz/chromium` is memory-hungry. If PDF export times out or fails on Vercel, raise the
  function memory for that route in **Project → Settings → Functions** (≈1024 MB+).
- The export route renders the owner-only `/print/[cvId]` page by self-requesting `NEXT_PUBLIC_APP_URL`,
  so that variable must point at the deployed origin.

> Note: production PDF export has only been validated locally via the Playwright engine; confirm the
> `@sparticuz/chromium` path on the first real deploy.
