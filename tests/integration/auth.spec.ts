import { test, expect } from '@playwright/test';

// API-mode integration tests for the auth route handlers (contracts/api.md → Authentication).
// Ordered: signup must run before the duplicate/signin checks that depend on the account.
test.describe.serial('auth endpoints', () => {
  const email = `pw-${Date.now()}@cvivo.test`;
  const password = 'Sup3rSecret!42';

  test('POST /api/auth/signup creates an account (201)', async ({ request }) => {
    const res = await request.post('/api/auth/signup', { data: { email, password } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.email).toBe(email);
    expect(body.userId).toBeTruthy();
  });

  test('POST /api/auth/signup with an existing email returns 409', async ({ request }) => {
    const res = await request.post('/api/auth/signup', { data: { email, password } });
    expect(res.status()).toBe(409);
    expect((await res.json()).error).toBe('conflict');
  });

  test('POST /api/auth/signup with missing password returns 422', async ({ request }) => {
    const res = await request.post('/api/auth/signup', { data: { email: `x-${Date.now()}@cvivo.test` } });
    expect(res.status()).toBe(422);
    expect((await res.json()).error).toBe('validation_error');
  });

  test('POST /api/auth/signin with valid credentials returns 200', async ({ request }) => {
    const res = await request.post('/api/auth/signin', { data: { email, password } });
    expect(res.status()).toBe(200);
    expect((await res.json()).userId).toBeTruthy();
  });

  test('POST /api/auth/signin with bad credentials returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/signin', { data: { email, password: 'wrong-pw' } });
    expect(res.status()).toBe(401);
    expect((await res.json()).error).toBe('unauthorized');
  });

  test('POST /api/auth/signout returns 204', async ({ request }) => {
    const res = await request.post('/api/auth/signout');
    expect(res.status()).toBe(204);
  });
});
