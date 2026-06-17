'use client';

import type { CVData } from '@/types/cv';
import { getTemplate } from '@/components/cv-templates/registry';

/**
 * Live preview (T036, FR-004): the CV rendered as a real sheet of paper resting on the
 * desk, updating as the user types. Content scrolls naturally — no truncation (FR-004a).
 */
export function CVPreview({ cv }: { cv: CVData }) {
  const Template = getTemplate(cv.templateId);
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-pine animate-live" />
        Live preview
      </div>
      <div className="flex-1 overflow-auto rounded-xl bg-surface p-4 sm:p-6">
        <div className="mx-auto max-w-[820px] animate-rise overflow-hidden rounded-sm bg-paper shadow-sheet ring-1 ring-line/60">
          <Template cv={cv} />
        </div>
      </div>
    </div>
  );
}
