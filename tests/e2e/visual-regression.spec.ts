import { test, expect } from '@playwright/test';

// Visual regression for CV output (addresses analyze finding F1): screenshots each template on
// the chrome-free /print page with fixed content. Baselines are committed; regenerate with
// `--update-snapshots` when a template change is intentional. Tolerance absorbs font anti-aliasing.
const CONTENT: Record<string, unknown> = {
  CONTACT: { fullName: 'Ada Lovelace', email: 'ada@example.com', location: 'London' },
  SUMMARY: { text: 'Mathematician and writer; wrote the first algorithm intended for a machine.' },
  EXPERIENCE: {
    entries: [
      {
        company: 'Analytical Engine',
        role: 'Collaborator',
        startDate: '1842-01',
        current: true,
        description: 'Translated and extended Menabrea’s notes on the Engine.',
      },
    ],
  },
  EDUCATION: {
    entries: [
      { institution: 'Privately tutored', degree: 'Mathematics', startDate: '1830-01', current: false },
    ],
  },
  SKILLS: { groups: [{ label: 'Strengths', skills: ['Mathematics', 'Technical writing'] }] },
};

test('CV templates render consistently (F1 visual regression)', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto('/signup');
  await page.getByLabel('Email').fill(`vis-${Date.now()}@cvivo.test`);
  await page.getByLabel('Password').fill('Sup3rSecret!42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  const cv = await (await page.request.post('/api/cvs', { data: {} })).json();
  const detail = await (await page.request.get(`/api/cvs/${cv.id}`)).json();
  for (const section of detail.sections) {
    const content = CONTENT[section.type];
    if (content) {
      await page.request.patch(`/api/cvs/${cv.id}/sections/${section.id}`, { data: { content } });
    }
  }

  for (const templateId of ['classic', 'modern', 'minimal'] as const) {
    await page.request.patch(`/api/cvs/${cv.id}`, { data: { templateId } });
    await page.goto(`/print/${cv.id}`, { waitUntil: 'load' });
    await page.waitForTimeout(500); // let web fonts settle
    await expect(page).toHaveScreenshot(`cv-${templateId}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  }
});
