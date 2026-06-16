import { TEMPLATE_IDS } from '../src/types/cv';

/**
 * Database seed.
 *
 * v1 templates are code-based React components (research.md Decision 6), not persisted
 * rows, so there is no reference data to insert. This script is an idempotent no-op that
 * documents the known template registry and is wired up via `prisma db seed` for future
 * seed data (e.g. demo accounts).
 */
async function main() {
  console.log(`CVivo seed: ${TEMPLATE_IDS.length} code-based templates (${TEMPLATE_IDS.join(', ')}).`);
  console.log('No database seed data is required for v1.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
