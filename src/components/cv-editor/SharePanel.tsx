'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, InputField, useToast } from '@/components/ui';
import { validateSlug } from '@/lib/slug';

type ShareStatus = 'NONE' | 'ACTIVE' | 'REVOKED';

/** Publish/revoke dialog (T049). Loads current share state, validates the slug inline, and
 *  shows the live link with a copy action once published. */
export function SharePanel({ cvId, onClose }: { cvId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ShareStatus>('NONE');
  const [slug, setSlug] = useState('');
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/cvs/${cvId}/share`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setUrl(data.url);
        if (data.slug) setSlug(data.slug);
      }
      setLoading(false);
    })();
  }, [cvId]);

  const check = slug ? validateSlug(slug) : null;
  const slugError = check && !check.ok ? check.message : undefined;
  const canPublish = Boolean(slug) && !slugError && !busy;

  async function publish() {
    setError(undefined);
    setBusy(true);
    const res = await fetch(`/api/cvs/${cvId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus('ACTIVE');
      setUrl(data.url);
      toast.success('Your CV is now shared.');
    } else if (res.status === 409) {
      setError('That link is already taken. Try another.');
    } else {
      setError(data.message ?? 'Couldn’t publish the link. Try again.');
    }
    setBusy(false);
  }

  async function revoke() {
    setBusy(true);
    const res = await fetch(`/api/cvs/${cvId}/share`, { method: 'DELETE' });
    if (res.ok || res.status === 404) setStatus('REVOKED');
    setBusy(false);
  }

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied.');
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share this CV"
        className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Share this CV</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Publish a read-only link anyone can open — no account needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="m4 4 8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <p className="py-4 text-sm text-ink-muted">Loading…</p>
        ) : status === 'ACTIVE' ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{url}</span>
              <Button variant="secondary" onClick={copy} className="shrink-0">
                {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>
            <p className="text-xs text-ink-muted">Anyone with this link can view your CV.</p>
            <Button variant="danger" onClick={revoke} disabled={busy} className="self-start">
              {busy ? 'Stopping…' : 'Stop sharing'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {status === 'REVOKED' && (
              <p className="text-sm text-ink-muted">
                Sharing is off. Republish below — your old link is yours to reuse.
              </p>
            )}
            {error && <Alert>{error}</Alert>}
            <InputField
              label="Choose your link"
              hint="cvivo.com/your-name — lowercase letters, numbers, and hyphens."
              value={slug}
              error={slugError}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="jane-doe"
            />
            <Button onClick={publish} disabled={!canPublish} className="self-start">
              {busy ? 'Publishing…' : 'Publish link'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
