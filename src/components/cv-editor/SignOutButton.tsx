'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={signOut}>
      Sign out
    </Button>
  );
}
