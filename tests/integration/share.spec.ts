import { test, expect, type APIRequestContext } from '@playwright/test';

// Share lifecycle (contracts/api.md → Sharing; FR-008/008a/009/009a).
test.describe.serial('Share endpoints', () => {
  const password = 'Sup3rSecret!42';
  const slug = `share-${Date.now()}`;
  let a: APIRequestContext;
  let b: APIRequestContext;
  let cvId: string;
  let bCvId: string;

  test.beforeAll(async ({ playwright, baseURL }) => {
    a = await playwright.request.newContext({ baseURL });
    await a.post('/api/auth/signup', { data: { email: `a-${Date.now()}@cvivo.test`, password } });
    cvId = (await (await a.post('/api/cvs', { data: {} })).json()).id;

    b = await playwright.request.newContext({ baseURL });
    await b.post('/api/auth/signup', { data: { email: `b-${Date.now()}@cvivo.test`, password } });
    bCvId = (await (await b.post('/api/cvs', { data: {} })).json()).id;
  });

  test.afterAll(async () => {
    await a.dispose();
    await b.dispose();
  });

  test('rejects unauthenticated access (401)', async ({ playwright, baseURL }) => {
    const anon = await playwright.request.newContext({ baseURL });
    expect((await anon.get(`/api/cvs/${cvId}/share`)).status()).toBe(401);
    await anon.dispose();
  });

  test('starts as NONE', async () => {
    const state = await (await a.get(`/api/cvs/${cvId}/share`)).json();
    expect(state.status).toBe('NONE');
  });

  test('rejects an invalid slug format (422)', async () => {
    const res = await a.post(`/api/cvs/${cvId}/share`, { data: { slug: 'Bad Slug!' } });
    expect(res.status()).toBe(422);
    expect((await res.json()).error).toBe('slug_invalid_format');
  });

  test('rejects a reserved slug (422)', async () => {
    const res = await a.post(`/api/cvs/${cvId}/share`, { data: { slug: 'admin' } });
    expect(res.status()).toBe(422);
    expect((await res.json()).error).toBe('slug_reserved_word');
  });

  test('publishes at a vanity slug (201) and reports ACTIVE', async () => {
    const res = await a.post(`/api/cvs/${cvId}/share`, { data: { slug } });
    expect(res.status()).toBe(201);
    expect((await res.json()).slug).toBe(slug);

    const state = await (await a.get(`/api/cvs/${cvId}/share`)).json();
    expect(state.status).toBe('ACTIVE');
    expect(state.slug).toBe(slug);
  });

  test('another user cannot claim the same slug (409)', async () => {
    const res = await b.post(`/api/cvs/${bCvId}/share`, { data: { slug } });
    expect(res.status()).toBe(409);
    expect((await res.json()).error).toBe('slug_taken');
  });

  test('revokes the link (204) and reports REVOKED', async () => {
    expect((await a.delete(`/api/cvs/${cvId}/share`)).status()).toBe(204);
    const state = await (await a.get(`/api/cvs/${cvId}/share`)).json();
    expect(state.status).toBe('REVOKED');
  });

  test('original owner may reuse the slug; others still cannot (FR-009a)', async () => {
    expect((await a.post(`/api/cvs/${cvId}/share`, { data: { slug } })).status()).toBe(201);
    expect((await b.post(`/api/cvs/${bCvId}/share`, { data: { slug } })).status()).toBe(409);
  });
});
