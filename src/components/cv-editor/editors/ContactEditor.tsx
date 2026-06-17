'use client';

import { InputField } from '@/components/ui';
import type { FieldError } from '@/lib/validation';
import type { ContactContent } from '@/types/cv';

export function ContactEditor({
  content,
  errors,
  onChange,
}: {
  content: ContactContent;
  errors?: FieldError[];
  onChange: (content: ContactContent) => void;
}) {
  const set = (key: keyof ContactContent) => (e: { target: { value: string } }) =>
    onChange({ ...content, [key]: e.target.value });
  const nameError = errors?.find((e) => e.path === 'fullName')?.message;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <InputField label="Full name" error={nameError} value={content.fullName ?? ''} onChange={set('fullName')} />
      <InputField label="Email" type="email" value={content.email ?? ''} onChange={set('email')} />
      <InputField label="Phone" value={content.phone ?? ''} onChange={set('phone')} />
      <InputField label="Location" value={content.location ?? ''} onChange={set('location')} />
      <InputField label="Website" value={content.website ?? ''} onChange={set('website')} />
      <InputField label="LinkedIn" value={content.linkedin ?? ''} onChange={set('linkedin')} />
    </div>
  );
}
