import { test, expect, type APIRequestContext } from '@playwright/test';

// Account profile, data export, and deletion (FR-014, SC-008, FR-009a).
test.describe.serial('Account endpoints', () => {
  const password = 'Sup3rSecret!42';
  const slug = `acct-${Date.now()}`;
  let api: APIRequestContext;
  let cvId: string;

  test.beforeAll(async ({ playwright, baseURL }) => {
    api = await playwright.request.newContext({ baseURL });
    await api.post('/api/auth/signup', { data: { email: `acct-${Date.now()}@cvivo.test`, password } });
    cvId = (await (await api.post('/api/cvs', { data: {} })).json()).id;
    await api.post(`/api/cvs/${cvId}/share`, { data: { slug } });
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('returns the profile (200)', async () => {
    const res = await api.get('/api/account');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toContain('@');
    expect(body.id).toBeTruthy();
  });

  test('exports all personal data as JSON (200)', async () => {
    const res = await api.get('/api/account/export');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    const body = await res.json();
    expect(body.account.email).toContain('@');
    expect(body.cvs.length).toBeGreaterThan(0);
  });

  test('deletes the account (204) and ends the session', async () => {
    expect((await api.delete('/api/account')).status()).toBe(204);
    expect((await api.get('/api/account')).status()).toBe(401);
  });

  test('a retired slug stays blocked for other users (SC-008 / FR-009a)', async ({
    playwright,
    baseURL,
  }) => {
    const other = await playwright.request.newContext({ baseURL });
    await other.post('/api/auth/signup', {
      data: { email: `other-acct-${Date.now()}@cvivo.test`, password },
    });
    const otherCv = (await (await other.post('/api/cvs', { data: {} })).json()).id;
    const res = await other.post(`/api/cvs/${otherCv}/share`, { data: { slug } });
    expect(res.status()).toBe(409);
    await other.dispose();
  });
});
