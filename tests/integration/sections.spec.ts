import { test, expect, type APIRequestContext } from '@playwright/test';

// Integration tests for section CRUD + reorder (contracts/api.md → CV Sections).
test.describe.serial('Section endpoints', () => {
  const email = `sec-${Date.now()}@cvivo.test`;
  const password = 'Sup3rSecret!42';
  let api: APIRequestContext;
  let cvId: string;
  let sectionId: string;

  test.beforeAll(async ({ playwright, baseURL }) => {
    api = await playwright.request.newContext({ baseURL });
    expect((await api.post('/api/auth/signup', { data: { email, password } })).status()).toBe(201);
    const res = await api.post('/api/cvs', { data: {} });
    cvId = (await res.json()).id;
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('lists the 5 default sections (200)', async () => {
    const res = await api.get(`/api/cvs/${cvId}/sections`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toHaveLength(5);
  });

  test('appends a CUSTOM section at the next position (201)', async () => {
    const res = await api.post(`/api/cvs/${cvId}/sections`, {
      data: { type: 'CUSTOM', title: 'Awards', content: { text: 'Prize' } },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    sectionId = body.id;
    expect(body.position).toBe(5);
  });

  test('rejects invalid section content (422)', async () => {
    const res = await api.post(`/api/cvs/${cvId}/sections`, {
      data: { type: 'EXPERIENCE', title: 'X', content: { entries: 'nope' } },
    });
    expect(res.status()).toBe(422);
  });

  test('updates section content (200)', async () => {
    const res = await api.patch(`/api/cvs/${cvId}/sections/${sectionId}`, {
      data: { content: { text: 'Updated prize' } },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).content.text).toBe('Updated prize');
  });

  test('reorders sections (200)', async () => {
    const list = await (await api.get(`/api/cvs/${cvId}/sections`)).json();
    const ids = list.map((s: { id: string }) => s.id).reverse();
    const res = await api.patch(`/api/cvs/${cvId}/sections/order`, { data: { sectionIds: ids } });
    expect(res.status()).toBe(200);
    expect((await res.json()).sections.map((s: { id: string }) => s.id)).toEqual(ids);
  });

  test('rejects a mismatched reorder set (422)', async () => {
    const res = await api.patch(`/api/cvs/${cvId}/sections/order`, {
      data: { sectionIds: ['not-a-real-id'] },
    });
    expect(res.status()).toBe(422);
  });

  test('deletes a section (204) and compacts positions', async () => {
    expect((await api.delete(`/api/cvs/${cvId}/sections/${sectionId}`)).status()).toBe(204);
    const list = await (await api.get(`/api/cvs/${cvId}/sections`)).json();
    expect(list).toHaveLength(5);
    expect(list.map((s: { position: number }) => s.position)).toEqual([0, 1, 2, 3, 4]);
  });
});
