'use client';

import { Button, InputField } from '@/components/ui';
import type { EducationContent, EducationEntry } from '@/types/cv';

const EMPTY: EducationEntry = {
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  current: false,
};

export function EducationEditor({
  content,
  onChange,
}: {
  content: EducationContent;
  onChange: (content: EducationContent) => void;
}) {
  const entries = content.entries ?? [];
  const update = (i: number, patch: Partial<EducationEntry>) =>
    onChange({ entries: entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) });

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <fieldset key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-sm font-medium">Education {i + 1}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <InputField label="Degree" value={entry.degree} onChange={(e) => update(i, { degree: e.target.value })} />
            <InputField label="Field" value={entry.field ?? ''} onChange={(e) => update(i, { field: e.target.value })} />
            <InputField label="Institution" value={entry.institution} onChange={(e) => update(i, { institution: e.target.value })} />
            <InputField label="Start (YYYY-MM)" value={entry.startDate} onChange={(e) => update(i, { startDate: e.target.value })} />
            <InputField label="End (YYYY-MM)" value={entry.endDate ?? ''} disabled={entry.current} onChange={(e) => update(i, { endDate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(e) => update(i, { current: e.target.checked })}
            />
            Currently studying
          </label>
          <Button variant="ghost" onClick={() => onChange({ entries: entries.filter((_, idx) => idx !== i) })}>
            Remove
          </Button>
        </fieldset>
      ))}
      <Button variant="secondary" onClick={() => onChange({ entries: [...entries, { ...EMPTY }] })}>
        Add education
      </Button>
    </div>
  );
}
