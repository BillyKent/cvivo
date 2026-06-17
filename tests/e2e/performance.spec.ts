import { test, expect } from '@playwright/test';

// SC-006: a shared CV page becomes viewable quickly. Measured on a warm server (the first
// hit compiles routes in dev); the SSR public page should then render well under 3 s.
test('shared CV page renders quickly once warm (SC-006)', async ({ page, browser, baseURL }) => {
  const email = `perf-${Date.now()}@cvivo.test`;
  const password = 'Sup3rSecret!42';
  const slug = `perf-${Date.now()}`;

  await page.goto('/signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Share' }).click();
  const dialog = page.getByRole('dialog', { name: 'Share this CV' });
  await dialog.getByLabel('Choose your link').fill(slug);
  await dialog.getByRole('button', { name: 'Publish link' }).click();
  await expect(dialog.getByRole('button', { name: 'Copy link' })).toBeVisible({ timeout: 15_000 });

  const url = `${baseURL}/${slug}`;
  const visitor = await browser.newContext();
  const v = await visitor.newPage();
  await v.goto(url); // warm the route

  const start = Date.now();
  await v.goto(url, { waitUntil: 'load' });
  await expect(v.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeVisible();
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(3000);

  await visitor.close();
});
