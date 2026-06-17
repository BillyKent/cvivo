import { test, expect, type APIRequestContext } from '@playwright/test';

// PDF export endpoint (contracts/api.md → Export; FR-012).
test.describe.serial('PDF export endpoint', () => {
  const password = 'Sup3rSecret!42';
  let api: APIRequestContext;
  let cvId: string;

  test.beforeAll(async ({ playwright, baseURL }) => {
    api = await playwright.request.newContext({ baseURL });
    await api.post('/api/auth/signup', { data: { email: `pdf-${Date.now()}@cvivo.test`, password } });
    cvId = (await (await api.post('/api/cvs', { data: { title: 'Ada CV' } })).json()).id;
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('requires authentication (401)', async ({ playwright, baseURL }) => {
    const anon = await playwright.request.newContext({ baseURL });
    expect((await anon.post(`/api/cvs/${cvId}/export/pdf`)).status()).toBe(401);
    await anon.dispose();
  });

  test('returns a PDF document (200, application/pdf, attachment)', async () => {
    test.setTimeout(120_000); // launching Chromium + rendering takes a few seconds
    const res = await api.post(`/api/cvs/${cvId}/export/pdf`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
    expect(res.headers()['content-disposition']).toContain('attachment');

    const body = await res.body();
    expect(body.length).toBeGreaterThan(1000);
    expect(body.subarray(0, 5).toString()).toBe('%PDF-');
  });
});
