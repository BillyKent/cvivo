'use client';

import { TextareaField } from '@/components/ui';

/** Shared editor for SUMMARY and CUSTOM sections (both are a single text block). */
export function TextEditor({
  content,
  onChange,
  label,
}: {
  content: { text: string };
  onChange: (content: { text: string }) => void;
  label: string;
}) {
  return (
    <TextareaField
      label={label}
      rows={5}
      value={content.text ?? ''}
      onChange={(e) => onChange({ text: e.target.value })}
    />
  );
}
