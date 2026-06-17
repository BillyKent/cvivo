'use client';

import { InputField } from '@/components/ui';
import type { ContactContent } from '@/types/cv';

export function ContactEditor({
  content,
  onChange,
}: {
  content: ContactContent;
  onChange: (content: ContactContent) => void;
}) {
  const set = (key: keyof ContactContent) => (e: { target: { value: string } }) =>
    onChange({ ...content, [key]: e.target.value });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <InputField label="Full name" value={content.fullName ?? ''} onChange={set('fullName')} />
      <InputField label="Email" type="email" value={content.email ?? ''} onChange={set('email')} />
      <InputField label="Phone" value={content.phone ?? ''} onChange={set('phone')} />
      <InputField label="Location" value={content.location ?? ''} onChange={set('location')} />
      <InputField label="Website" value={content.website ?? ''} onChange={set('website')} />
      <InputField label="LinkedIn" value={content.linkedin ?? ''} onChange={set('linkedin')} />
    </div>
  );
}
