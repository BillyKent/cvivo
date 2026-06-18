'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import type { CVSectionType } from '@/types/cv';

const ADDABLE: { type: CVSectionType; title: string }[] = [
  { type: 'SUMMARY', title: 'Summary' },
  { type: 'EXPERIENCE', title: 'Experience' },
  { type: 'EDUCATION', title: 'Education' },
  { type: 'SKILLS', title: 'Skills' },
];

/** Controls for adding sections — re-add a removed standard section, or add a custom one. */
export function SectionManager({
  existingTypes,
  onAdd,
}: {
  existingTypes: CVSectionType[];
  onAdd: (type: CVSectionType, title: string) => void;
}) {
  const [customTitle, setCustomTitle] = useState('');
  const available = ADDABLE.filter((s) => !existingTypes.includes(s.type));

  return (
    <div className="space-y-3 rounded-md border border-dashed border-line p-3">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        Add a section
      </span>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {available.map((s) => (
            <Button key={s.type} variant="secondary" onClick={() => onAdd(s.type, s.title)}>
              {s.title}
            </Button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          aria-label="Custom section title"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="Custom section title"
          className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-pine focus:outline-none focus:ring-1 focus:ring-pine/25"
        />
        <Button
          variant="secondary"
          disabled={!customTitle.trim()}
          onClick={() => {
            onAdd('CUSTOM', customTitle.trim());
            setCustomTitle('');
          }}
        >
          Add custom
        </Button>
      </div>
    </div>
  );
}
