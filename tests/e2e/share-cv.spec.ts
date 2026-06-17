import { test, expect } from '@playwright/test';

// US2 independent test (T044): publish a CV, open the public link as an anonymous visitor
// across phone/tablet/desktop (FR-010, SC-003), then revoke and confirm it 404s (SC-007).
test('share a CV, view it across viewports, then revoke', async ({ page, browser, baseURL }) => {
  const email = `share-e2e-${Date.now()}@cvivo.test`;
  const password = 'Sup3rSecret!42';
  const slug = `ada-${Date.now()}`;

  await page.goto('/signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);
  await page.getByLabel('Full name').fill('Ada Lovelace');

  // Publish via the Share panel
  await page.getByRole('button', { name: 'Share' }).click();
  const dialog = page.getByRole('dialog', { name: 'Share this CV' });
  await dialog.getByLabel('Choose your link').fill(slug);
  await dialog.getByRole('button', { name: 'Publish link' }).click();
  await expect(dialog.getByRole('button', { name: 'Copy link' })).toBeVisible({ timeout: 15_000 });

  const publicURL = `${baseURL}/${slug}`;

  // Anonymous visitors can read it on phone, tablet, and desktop.
  for (const viewport of [
    { width: 375, height: 780 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ]) {
    const ctx = await browser.newContext({ viewport });
    const visitor = await ctx.newPage();
    await visitor.goto(publicURL);
    await expect(visitor.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeVisible();
    await ctx.close();
  }

  // Revoke → the panel returns to the publish form, and the link no longer grants access.
  await dialog.getByRole('button', { name: 'Stop sharing' }).click();
  await expect(dialog.getByLabel('Choose your link')).toBeVisible({ timeout: 10_000 });

  const after = await browser.newContext();
  const visitor = await after.newPage();
  await visitor.goto(publicURL);
  await expect(visitor.getByText(/This link isn.t active/)).toBeVisible();
  await after.close();
});
