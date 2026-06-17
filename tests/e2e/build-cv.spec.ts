import { test, expect } from '@playwright/test';

// US1 independent test (T027): sign up → build a CV → live preview → switch template
// without content loss → save → reload and confirm persistence.
test('build a CV end to end', async ({ page }) => {
  const email = `e2e-${Date.now()}@cvivo.test`;
  const password = 'Sup3rSecret!42';

  // Sign up
  await page.goto('/signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Create a CV → land in the editor
  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);

  // Fill contact + one experience entry
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Add experience' }).click();
  await page.getByLabel('Role').fill('Engineer');
  await page.getByLabel('Company').fill('Analytical Engine');
  await page.getByLabel('Start (YYYY-MM)').fill('2020-01');

  // Live preview reflects the content (FR-004)
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await expect(page.getByText(/Analytical Engine/)).toBeVisible();

  // Switch template — content is preserved (FR-005)
  await page.getByRole('button', { name: 'Modern' }).click();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await expect(page.getByText(/Analytical Engine/)).toBeVisible();

  // Save
  await page.getByRole('button', { name: 'Save' }).click();
  // Generous timeout: on a cold dev server the PATCH routes compile on first hit.
  await expect(page.getByText('All changes saved')).toBeVisible({ timeout: 20_000 });

  // Reload — content persists exactly (FR-006)
  await page.reload();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await expect(page.getByText(/Analytical Engine/)).toBeVisible();
});
