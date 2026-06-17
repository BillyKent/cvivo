'use client';

import { Button, InputField } from '@/components/ui';
import type { SkillGroup, SkillsContent } from '@/types/cv';

export function SkillsEditor({
  content,
  onChange,
}: {
  content: SkillsContent;
  onChange: (content: SkillsContent) => void;
}) {
  const groups = content.groups ?? [];
  const update = (i: number, patch: Partial<SkillGroup>) =>
    onChange({ groups: groups.map((g, idx) => (idx === i ? { ...g, ...patch } : g)) });

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
          <InputField
            label="Group label (optional)"
            value={group.label ?? ''}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <InputField
            label="Skills (comma-separated)"
            value={group.skills.join(', ')}
            onChange={(e) =>
              update(i, { skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
            }
          />
          <Button variant="ghost" onClick={() => onChange({ groups: groups.filter((_, idx) => idx !== i) })}>
            Remove group
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={() => onChange({ groups: [...groups, { label: '', skills: [] }] })}>
        Add skill group
      </Button>
    </div>
  );
}
