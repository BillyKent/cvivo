import { test, expect, type Page } from '@playwright/test';

async function newCV(page: Page) {
  await page.goto('/signup');
  await page.getByLabel('Email').fill(`sec-${Date.now()}@cvivo.test`);
  await page.getByLabel('Password').fill('Sup3rSecret!42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);
}

// US3: add custom section, remove + re-add a section, reorder; persists on reload.
// Structural ops persist immediately, so we wait for each request before the next.
test('manage sections: add custom, remove + re-add, reorder, persist', async ({ page }) => {
  await newCV(page);

  // Add a custom section.
  await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && /\/sections$/.test(r.url())),
    (async () => {
      await page.getByLabel('Custom section title').fill('Projects');
      await page.getByRole('button', { name: 'Add custom' }).click();
    })(),
  ]);
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

  // Remove the Education section.
  await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'DELETE' && /\/sections\//.test(r.url())),
    page.getByRole('button', { name: 'Remove Education section' }).click(),
  ]);
  await expect(page.getByRole('heading', { name: 'Education' })).toHaveCount(0);

  // Re-add Education from the section manager.
  await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && /\/sections$/.test(r.url())),
    page.getByRole('button', { name: 'Education', exact: true }).click(),
  ]);
  await expect(page.getByRole('heading', { name: 'Education' })).toHaveCount(1);

  // Reorder a section. Contact is pinned first — it has no move controls.
  await Promise.all([
    page.waitForResponse((r) => /\/sections\/order$/.test(r.url())),
    page.getByRole('button', { name: 'Move Summary down' }).click(),
  ]);
  await expect(page.getByRole('button', { name: 'Move Contact up' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Move Contact down' })).toHaveCount(0);

  // Persist on reload.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Education' })).toHaveCount(1);
});
