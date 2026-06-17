'use client';

import { Button, InputField, TextareaField } from '@/components/ui';
import type { ExperienceContent, ExperienceEntry } from '@/types/cv';

const EMPTY: ExperienceEntry = {
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
};

export function ExperienceEditor({
  content,
  onChange,
}: {
  content: ExperienceContent;
  onChange: (content: ExperienceContent) => void;
}) {
  const entries = content.entries ?? [];
  const update = (i: number, patch: Partial<ExperienceEntry>) =>
    onChange({ entries: entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) });

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <fieldset key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-sm font-medium">Experience {i + 1}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <InputField label="Role" value={entry.role} onChange={(e) => update(i, { role: e.target.value })} />
            <InputField label="Company" value={entry.company} onChange={(e) => update(i, { company: e.target.value })} />
            <InputField label="Start (YYYY-MM)" value={entry.startDate} onChange={(e) => update(i, { startDate: e.target.value })} />
            <InputField label="End (YYYY-MM)" value={entry.endDate ?? ''} disabled={entry.current} onChange={(e) => update(i, { endDate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(e) => update(i, { current: e.target.checked })}
            />
            I currently work here
          </label>
          <TextareaField label="Description" value={entry.description} onChange={(e) => update(i, { description: e.target.value })} />
          <Button variant="ghost" onClick={() => onChange({ entries: entries.filter((_, idx) => idx !== i) })}>
            Remove
          </Button>
        </fieldset>
      ))}
      <Button variant="secondary" onClick={() => onChange({ entries: [...entries, { ...EMPTY }] })}>
        Add experience
      </Button>
    </div>
  );
}
