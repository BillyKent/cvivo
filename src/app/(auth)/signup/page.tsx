'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, InputField } from '@/components/ui';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    if (!validate()) return;

    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    if (res.status === 409) {
      setFormError('That email already has an account. Try signing in instead.');
    } else {
      const body = await res.json().catch(() => ({}));
      setFormError(body.message ?? 'We couldn’t create your account. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">Build your first CV in minutes.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {formError && <Alert>{formError}</Alert>}
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? 'Creating your account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-pine hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
