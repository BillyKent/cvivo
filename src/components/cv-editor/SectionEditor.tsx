'use client';

import type { CVSectionData } from '@/types/cv';
import type { FieldError } from '@/lib/validation';
import { ContactEditor } from './editors/ContactEditor';
import { TextEditor } from './editors/TextEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { EducationEditor } from './editors/EducationEditor';
import { SkillsEditor } from './editors/SkillsEditor';

/** Dispatches to the per-type editor for a section, narrowed by section.type. */
export function SectionEditor({
  section,
  errors,
  onChange,
}: {
  section: CVSectionData;
  errors?: FieldError[];
  onChange: (content: unknown) => void;
}) {
  switch (section.type) {
    case 'CONTACT':
      return <ContactEditor content={section.content} errors={errors} onChange={onChange} />;
    case 'SUMMARY':
    case 'CUSTOM':
      return <TextEditor content={section.content} onChange={onChange} label={section.title} />;
    case 'EXPERIENCE':
      return <ExperienceEditor content={section.content} errors={errors} onChange={onChange} />;
    case 'EDUCATION':
      return <EducationEditor content={section.content} errors={errors} onChange={onChange} />;
    case 'SKILLS':
      return <SkillsEditor content={section.content} onChange={onChange} />;
  }
}
