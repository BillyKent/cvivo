import { test, expect } from '@playwright/test';

// US2: skills chip input accepts spaces, commits on Enter/comma, and is removable.
test('add skills as chips (space + comma) and see them in the preview', async ({ page }) => {
  const email = `skills-${Date.now()}@cvivo.test`;
  await page.goto('/signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Sup3rSecret!42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'New CV' }).click();
  await expect(page).toHaveURL(/\/cv\/.+\/edit/);

  const skill = page.getByLabel('Add a skill');

  // Multi-word skill committed with Enter (space preserved).
  await skill.fill('Technical writing');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove Technical writing' })).toBeVisible();

  // Skill committed with a comma.
  await skill.fill('Go');
  await page.keyboard.press('Comma');
  await expect(page.getByRole('button', { name: 'Remove Go' })).toBeVisible();

  // Preview renders the skills, clearly separated (only the preview joins them with ", ").
  await expect(page.getByText('Technical writing, Go')).toBeVisible();

  // Remove a skill.
  await page.getByRole('button', { name: 'Remove Go' }).click();
  await expect(page.getByRole('button', { name: 'Remove Go' })).toHaveCount(0);
});
