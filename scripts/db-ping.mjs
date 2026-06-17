// Bounded connectivity check against the DIRECT (non-pooled) connection.
// Usage: dotenv -e .env.local -- node scripts/db-ping.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('timeout after 12s')), 12_000),
);

try {
  await Promise.race([prisma.$queryRawUnsafe('SELECT 1 as ok'), timeout]);
  console.log('DB_OK');
} catch (error) {
  console.log('DB_FAIL:', error?.message);
  process.exitCode = 2;
} finally {
  await prisma.$disconnect().catch(() => {});
}
