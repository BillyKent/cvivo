'use client';

import { useState } from 'react';
import { Button, useToast } from '@/components/ui';

/** Export-to-PDF action. Runs onBeforeExport (a save) first so the file matches what you see. */
export function ExportButton({
  cvId,
  onBeforeExport,
}: {
  cvId: string;
  onBeforeExport?: () => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function exportPdf() {
    setBusy(true);
    try {
      if (onBeforeExport) {
        const ok = await onBeforeExport();
        if (!ok) return; // save was blocked (e.g. validation) — don't export
      }
      const res = await fetch(`/api/cvs/${cvId}/export/pdf`, { method: 'POST' });
      if (!res.ok) throw new Error('export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cv.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('We couldn’t generate the PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="ghost" onClick={exportPdf} disabled={busy} className="shrink-0">
      {busy ? 'Preparing…' : 'Export PDF'}
    </Button>
  );
}
