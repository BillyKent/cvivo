'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

/** Export-to-PDF action. Runs onBeforeExport (a save) first so the file matches what you see. */
export function ExportButton({
  cvId,
  onBeforeExport,
}: {
  cvId: string;
  onBeforeExport?: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function exportPdf() {
    setBusy(true);
    try {
      await onBeforeExport?.();
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
      // Surfaced minimally; a full toast system is a polish-phase concern.
      alert('We couldn’t generate the PDF. Please try again.');
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
