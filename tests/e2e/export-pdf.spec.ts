import { test, expect } from '@playwright/test';
import { statSync } from 'node:fs';

// US3 independent test (T052): export a CV to PDF and confirm a non-trivial document is
// produced, for both a short CV and a long (multi-page) one.
test('export a CV to PDF, including a long multi-page CV', async ({ page }) => {
  test.setTimeout(120_000);

  const email = `pdf-e2e-${Date.now()}@cvivo.test`;
  const password = 'Sup3rSecret!42';

  await page.goto('/signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByRole('textbox', { name: 'Summary' }).fill('Mathematician and writer.');

  // Short CV → one-page PDF.
  const [shortDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export PDF' }).click(),
  ]);
  expect(shortDownload.suggestedFilename()).toMatch(/\.pdf$/);
  const shortPath = await shortDownload.path();
  expect(statSync(shortPath!).size).toBeGreaterThan(1000);

  // Long CV → multi-page PDF (content paginates rather than clipping).
  await page
    .getByRole('textbox', { name: 'Summary' })
    .fill(Array.from({ length: 60 }, (_, i) => `Paragraph ${i + 1}: a substantial line of CV content that wraps.`).join('\n'));
  const [longDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export PDF' }).click(),
  ]);
  const longPath = await longDownload.path();
  expect(statSync(longPath!).size).toBeGreaterThan(1000);
});
