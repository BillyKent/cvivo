'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, InputField } from '@/components/ui';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    setLoading(true);

    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setFormError('That email and password don’t match. Check them and try again.');
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to keep building.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {formError && <Alert>{formError}</Alert>}
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-sm text-ink-muted">
        New to CVivo?{' '}
        <Link href="/signup" className="font-medium text-pine hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
