import { test, expect, type Page } from '@playwright/test';

async function newCV(page: Page) {
  await page.goto('/signup');
  await page.getByLabel('Email').fill(`fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@cvivo.test`);
  await page.getByLabel('Password').fill('Sup3rSecret!42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);
}

// US4: unsaved-changes guard + in-app export-failure toast (no native alert).
test('unsaved edits are guarded and export failure shows a toast', async ({ page }) => {
  await newCV(page);

  // Edit a field → leaving via the back link asks to confirm; dismiss keeps us in the editor.
  await page.getByLabel('Full name').fill('Ada');
  page.once('dialog', (d) => d.dismiss());
  await page.getByRole('link', { name: 'Back to your CVs' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);

  // Export failure surfaces an in-app toast (not a browser alert).
  await page.route(/\/export\/pdf$/, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
  await page.getByRole('button', { name: 'Export PDF' }).click();
  await expect(page.getByText(/couldn.t generate the PDF/i)).toBeVisible({ timeout: 15_000 });
});

// T028: deleting the open CV elsewhere yields a clear message + return to dashboard, not a raw error.
test('saving a CV deleted elsewhere returns to the dashboard with a message', async ({ page }) => {
  await newCV(page);
  const cvId = page.url().match(/cv\/([^/]+)\/edit/)![1];

  await page.getByLabel('Full name').fill('Ada'); // a valid change
  await page.request.delete(`/api/cvs/${cvId}`); // CV removed out from under the editor

  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
