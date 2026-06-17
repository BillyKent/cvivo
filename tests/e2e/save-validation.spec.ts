import { test, expect } from '@playwright/test';

// US1: client-side validation blocks the save and marks each offending field, then succeeds.
test('save is blocked with per-field errors, then succeeds after fixing', async ({ page }) => {
  const email = `valid-${Date.now()}@cvivo.test`;
  await page.goto('/signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Sup3rSecret!42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);

  // Start an experience entry but leave required fields blank.
  await page.getByRole('button', { name: 'Add experience' }).click();
  await page.getByLabel('Company').fill('Acme');
  await page.getByRole('button', { name: 'Save changes' }).click();

  // Save is blocked; each missing field is marked, and the status reflects it.
  await expect(page.getByText('Add the role.')).toBeVisible();
  await expect(page.getByText('Add the start date.')).toBeVisible();
  await expect(page.getByText('Fix the highlighted fields')).toBeVisible();

  // Fix the fields → save succeeds with a single clear confirmation.
  await page.getByLabel('Role').fill('Engineer');
  await page.getByLabel('Start date').fill('2020-01');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Add the role.')).toHaveCount(0);
});
