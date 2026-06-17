'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export function AccountActions() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    setBusy(true);
    const res = await fetch('/api/account', { method: 'DELETE' });
    if (res.ok) {
      router.push('/');
      router.refresh();
      return;
    }
    setBusy(false);
  }

  return (
    <div className="mt-10 flex flex-col gap-8">
      <section>
        <h2 className="font-display text-lg font-medium">Your data</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Download everything CVivo stores about you as a JSON file.
        </p>
        <a
          href="/api/account/export"
          download
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-raised"
        >
          Export my data
        </a>
      </section>

      <section className="rounded-xl border border-clay/30 bg-clay-tint/40 p-4">
        <h2 className="font-display text-lg font-medium text-clay">Delete account</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Permanently removes your account, every CV, and all share links. This can’t be undone.
        </p>
        {!confirming ? (
          <Button variant="danger" className="mt-3" onClick={() => setConfirming(true)}>
            Delete account
          </Button>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Are you sure?</span>
            <Button variant="danger" onClick={deleteAccount} disabled={busy}>
              {busy ? 'Deleting…' : 'Yes, delete everything'}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
