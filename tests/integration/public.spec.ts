import { test, expect, type APIRequestContext } from '@playwright/test';

// Public CV endpoint (contracts/api.md → Public CV; FR-013/FR-016).
test.describe.serial('Public CV endpoint', () => {
  const password = 'Sup3rSecret!42';
  const slug = `pub-${Date.now()}`;
  let owner: APIRequestContext;
  let cvId: string;

  test.beforeAll(async ({ playwright, baseURL }) => {
    owner = await playwright.request.newContext({ baseURL });
    await owner.post('/api/auth/signup', {
      data: { email: `pub-${Date.now()}@cvivo.test`, password },
    });
    cvId = (await (await owner.post('/api/cvs', { data: { title: 'Public CV' } })).json()).id;
    await owner.post(`/api/cvs/${cvId}/share`, { data: { slug } });
  });

  test.afterAll(async () => {
    await owner.dispose();
  });

  test('returns CV content for an active slug, with no owner identity (200)', async ({
    request,
  }) => {
    const res = await request.get(`/api/public/${slug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.cv.title).toBe('Public CV');
    expect(Array.isArray(body.cv.sections)).toBe(true);
    // No owner/account identity leaks to anonymous callers. (The CV's own contact email is
    // intentional shared content, so we only guard against account identifiers here.)
    const raw = JSON.stringify(body);
    expect(raw).not.toMatch(/userId|user_id/i);
  });

  test('returns 404 for a slug that never existed', async ({ request }) => {
    expect((await request.get(`/api/public/never-existed-${Date.now()}`)).status()).toBe(404);
  });

  test('returns 404 once the link is revoked', async ({ request }) => {
    await owner.delete(`/api/cvs/${cvId}/share`);
    expect((await request.get(`/api/public/${slug}`)).status()).toBe(404);
  });
});
