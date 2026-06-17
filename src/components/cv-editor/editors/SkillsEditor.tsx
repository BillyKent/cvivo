'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { Button, InputField } from '@/components/ui';
import type { SkillGroup, SkillsContent } from '@/types/cv';

/** A tag/chip input: type a skill, press Enter or comma to add it; spaces are preserved. */
function ChipInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const value = raw.trim();
    setDraft('');
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) return; // de-dup
    onChange([...skills, value]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        Skills
      </label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-paper p-2 focus-within:border-pine focus-within:ring-1 focus-within:ring-pine/25">
        {skills.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-pine-tint px-2 py-0.5 text-sm text-pine"
          >
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={() => onChange(skills.filter((_, idx) => idx !== i))}
              className="leading-none text-pine/70 hover:text-pine"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          aria-label="Add a skill"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={skills.length ? '' : 'Type a skill, then Enter'}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}

export function SkillsEditor({
  content,
  onChange,
}: {
  content: SkillsContent;
  onChange: (content: SkillsContent) => void;
}) {
  // Always show at least one group so the user can type skills without first "adding a group".
  const groups: SkillGroup[] = content.groups.length ? content.groups : [{ label: '', skills: [] }];
  const multi = groups.length > 1;

  const update = (i: number, patch: Partial<SkillGroup>) =>
    onChange({ groups: groups.map((g, idx) => (idx === i ? { ...g, ...patch } : g)) });

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <div key={i} className="space-y-2 rounded-md border border-line p-3">
          {multi && (
            <InputField
              label="Group label (optional)"
              value={group.label ?? ''}
              onChange={(e) => update(i, { label: e.target.value })}
            />
          )}
          <ChipInput skills={group.skills ?? []} onChange={(skills) => update(i, { skills })} />
          {multi && (
            <Button
              variant="ghost"
              onClick={() => onChange({ groups: groups.filter((_, idx) => idx !== i) })}
            >
              Remove group
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() => onChange({ groups: [...groups, { label: '', skills: [] }] })}
      >
        Add skill group
      </Button>
    </div>
  );
}
