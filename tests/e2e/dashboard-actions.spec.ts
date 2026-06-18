import { test, expect } from '@playwright/test';

// US3: rename and delete a CV from the dashboard.
test('rename and delete a CV from the dashboard', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Email').fill(`dash-${Date.now()}@cvivo.test`);
  await page.getByLabel('Password').fill('Sup3rSecret!42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Create a CV, then return to the dashboard (nothing edited → no unsaved-changes prompt).
  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);
  await page.goto('/dashboard');

  // Rename.
  await page.getByRole('button', { name: 'Rename' }).first().click();
  const title = page.getByLabel('CV title');
  await title.fill('My Renamed CV');
  await title.press('Enter');
  await expect(page.getByText('My Renamed CV')).toBeVisible();

  // Delete (with confirmation).
  page.on('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('My Renamed CV')).toHaveCount(0);
});
