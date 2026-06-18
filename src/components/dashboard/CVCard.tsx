'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui';
import type { CVSummary } from '@/types/api';

const sheet = (
  <>
    <div className="h-1.5 w-1/2 rounded bg-line" />
    <div className="mt-2 h-1 w-3/4 rounded bg-line/70" />
    <div className="mt-1.5 h-1 w-2/3 rounded bg-line/70" />
    <div className="mt-1.5 h-1 w-1/2 rounded bg-line/70" />
  </>
);

export function CVCard({ cv }: { cv: CVSummary }) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState(cv.title);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function rename() {
    setEditing(false);
    const trimmed = title.trim();
    if (!trimmed || trimmed === cv.title) {
      setTitle(cv.title);
      return;
    }
    const res = await fetch(`/api/cvs/${cv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    });
    if (res.ok) {
      toast.success('CV renamed.');
      router.refresh();
    } else {
      setTitle(cv.title);
      toast.error('Couldn’t rename the CV.');
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${cv.title}”? This can’t be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/cvs/${cv.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('CV deleted.');
      router.refresh();
    } else {
      setBusy(false);
      toast.error('Couldn’t delete the CV.');
    }
  }

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-line bg-paper p-4 shadow-sm transition-shadow hover:shadow-raised">
      <Link
        href={`/cv/${cv.id}/edit`}
        aria-label={`Open ${cv.title}`}
        className="rounded-lg border border-line bg-surface-raised p-3"
      >
        {sheet}
      </Link>

      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <input
            autoFocus
            aria-label="CV title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={rename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') rename();
              if (e.key === 'Escape') {
                setTitle(cv.title);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 rounded-md border border-line px-2 py-1 text-sm font-medium focus:border-pine focus:outline-none focus:ring-1 focus:ring-pine/25"
          />
        ) : (
          <Link href={`/cv/${cv.id}/edit`} className="font-medium text-ink group-hover:text-pine">
            {cv.title}
          </Link>
        )}
        {cv.visibility === 'SHARED' ? (
          <span className="shrink-0 rounded-full bg-pine-tint px-2 py-0.5 text-[11px] font-medium text-pine">
            Shared
          </span>
        ) : (
          <span className="shrink-0 text-[11px] text-ink-muted">Private</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">
          Edited {new Date(cv.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-md px-2 py-1 text-xs font-medium text-clay transition-colors hover:bg-clay-tint disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
