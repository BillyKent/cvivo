'use client';

import type { CVData } from '@/types/cv';
import { getTemplate } from '@/components/cv-templates/registry';

/**
 * Live preview panel (T036, FR-004). Renders the active template against the current editor
 * state and updates as the user types. Content scrolls naturally — no truncation (FR-004a).
 */
export function CVPreview({ cv }: { cv: CVData }) {
  const Template = getTemplate(cv.templateId);
  return (
    <div className="h-full overflow-auto rounded-lg border border-gray-200 bg-gray-100 p-4">
      <div className="shadow-sm">
        <Template cv={cv} />
      </div>
    </div>
  );
}
