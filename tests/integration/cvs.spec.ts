import { test, expect, type APIRequestContext } from '@playwright/test';

// Integration tests for CV CRUD (contracts/api.md → CVs). A shared request context created
// in beforeAll keeps the session cookie set by signup across all tests in the suite.
test.describe.serial('CV endpoints', () => {
  const email = `cv-${Date.now()}@cvivo.test`;
  const password = 'Sup3rSecret!42';
  let api: APIRequestContext;
  let cvId: string;

  test.beforeAll(async ({ playwright, baseURL }) => {
    api = await playwright.request.newContext({ baseURL });
    expect((await api.post('/api/auth/signup', { data: { email, password } })).status()).toBe(201);
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('rejects unauthenticated access (401)', async ({ playwright, baseURL }) => {
    const anon = await playwright.request.newContext({ baseURL });
    expect((await anon.get('/api/cvs')).status()).toBe(401);
    await anon.dispose();
  });

  test('creates a CV pre-populated with the 5 standard sections (201)', async () => {
    const res = await api.post('/api/cvs', { data: { title: 'My CV' } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    cvId = body.id;
    expect(body.sections.map((s: { type: string }) => s.type)).toEqual([
      'CONTACT',
      'SUMMARY',
      'EXPERIENCE',
      'EDUCATION',
      'SKILLS',
    ]);
  });

  test('lists the CV (200)', async () => {
    const res = await api.get('/api/cvs');
    expect(res.status()).toBe(200);
    expect((await res.json()).some((c: { id: string }) => c.id === cvId)).toBe(true);
  });

  test('gets the CV by id (200)', async () => {
    const res = await api.get(`/api/cvs/${cvId}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).id).toBe(cvId);
  });

  test('updates title and template (200)', async () => {
    const res = await api.patch(`/api/cvs/${cvId}`, {
      data: { title: 'Updated', templateId: 'modern' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Updated');
    expect(body.templateId).toBe('modern');
  });

  test('rejects an unknown template (422)', async () => {
    expect((await api.patch(`/api/cvs/${cvId}`, { data: { templateId: 'nope' } })).status()).toBe(
      422,
    );
  });

  test("forbids access to another user's CV (403)", async ({ playwright, baseURL }) => {
    const other = await playwright.request.newContext({ baseURL });
    await other.post('/api/auth/signup', {
      data: { email: `other-${Date.now()}@cvivo.test`, password },
    });
    expect((await other.get(`/api/cvs/${cvId}`)).status()).toBe(403);
    await other.dispose();
  });

  test('deletes the CV (204), then it is gone (404)', async () => {
    expect((await api.delete(`/api/cvs/${cvId}`)).status()).toBe(204);
    expect((await api.get(`/api/cvs/${cvId}`)).status()).toBe(404);
  });
});
