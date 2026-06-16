// Shared CV domain types. The section `content` shapes mirror data-model.md and are
// validated at runtime in src/lib/validation.ts. Templates and the editor consume these.

export type TemplateId = 'classic' | 'modern' | 'minimal';

export const TEMPLATE_IDS: readonly TemplateId[] = ['classic', 'modern', 'minimal'] as const;

export type CVVisibility = 'PRIVATE' | 'SHARED';

export type CVSectionType =
  | 'CONTACT'
  | 'SUMMARY'
  | 'EXPERIENCE'
  | 'EDUCATION'
  | 'SKILLS'
  | 'CUSTOM';

export interface ContactContent {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
}

export interface SummaryContent {
  text: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  /** "YYYY-MM" */
  startDate: string;
  /** "YYYY-MM"; omitted when current is true */
  endDate?: string;
  current: boolean;
  description: string;
}

export interface ExperienceContent {
  entries: ExperienceEntry[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface EducationContent {
  entries: EducationEntry[];
}

export interface SkillGroup {
  label?: string;
  skills: string[];
}

export interface SkillsContent {
  groups: SkillGroup[];
}

export interface CustomContent {
  text: string;
}

/** Maps each section type to its content shape. */
export interface SectionContentMap {
  CONTACT: ContactContent;
  SUMMARY: SummaryContent;
  EXPERIENCE: ExperienceContent;
  EDUCATION: EducationContent;
  SKILLS: SkillsContent;
  CUSTOM: CustomContent;
}

/** A section whose `content` type is narrowed by its `type` (discriminated union). */
export type CVSectionData = {
  [K in CVSectionType]: {
    id: string;
    type: K;
    title: string;
    position: number;
    content: SectionContentMap[K];
  };
}[CVSectionType];

export interface CVData {
  id: string;
  title: string;
  templateId: TemplateId;
  visibility: CVVisibility;
  sections: CVSectionData[];
}

/** Props shared by every template component — the single render path for preview, public view, and PDF. */
export interface TemplateProps {
  cv: CVData;
}
