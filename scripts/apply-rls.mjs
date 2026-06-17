// Applies prisma/sql/rls-and-constraints.sql over the DIRECT (non-pooled) connection.
// Idempotent: statements that already exist are skipped, so this is safe to re-run.
// Usage: pnpm db:rls   (wraps: dotenv -e .env.local -- node scripts/apply-rls.mjs)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const here = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(here, '..', 'prisma', 'sql', 'rls-and-constraints.sql');

const statements = readFileSync(sqlPath, 'utf8')
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });

let applied = 0;
let skipped = 0;
try {
  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      applied += 1;
    } catch (err) {
      if (/already exists/i.test(String(err?.message))) {
        skipped += 1;
        continue;
      }
      console.error('\nFailed statement:\n', stmt, '\n\n', err?.message);
      process.exitCode = 1;
      break;
    }
  }
  console.log(`RLS apply: ${applied} executed, ${skipped} already existed.`);
} finally {
  await prisma.$disconnect();
}
