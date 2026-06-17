'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export function NewCVButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    const res = await fetch('/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const cv = await res.json();
      router.push(`/cv/${cv.id}/edit`);
      return;
    }
    setLoading(false);
  }

  return (
    <Button onClick={create} disabled={loading}>
      {loading ? 'Creating…' : 'New CV'}
    </Button>
  );
}
