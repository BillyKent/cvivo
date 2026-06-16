import { z } from 'zod';
import type { CVSectionType } from '@/types/cv';

// Runtime validation for section content. Shapes mirror src/types/cv.ts and
// specs/001-cvivo-cv-platform/data-model.md. Schemas are lenient on optional fields so
// in-progress edits validate, but enforce structure (arrays, required keys, types).

export const contactSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
});

export const summarySchema = z.object({ text: z.string() });

export const experienceEntrySchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string(),
});

export const experienceSchema = z.object({ entries: z.array(experienceEntrySchema) });

export const educationEntrySchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean(),
});

export const educationSchema = z.object({ entries: z.array(educationEntrySchema) });

export const skillGroupSchema = z.object({
  label: z.string().optional(),
  skills: z.array(z.string()),
});

export const skillsSchema = z.object({ groups: z.array(skillGroupSchema) });

export const customSchema = z.object({ text: z.string() });

const sectionSchemas: Record<CVSectionType, z.ZodTypeAny> = {
  CONTACT: contactSchema,
  SUMMARY: summarySchema,
  EXPERIENCE: experienceSchema,
  EDUCATION: educationSchema,
  SKILLS: skillsSchema,
  CUSTOM: customSchema,
};

/** Validate a section's content against its type's schema. */
export function validateSectionContent(type: CVSectionType, content: unknown) {
  return sectionSchemas[type].safeParse(content);
}

/** The empty-but-valid content shape for a newly added section. */
export function defaultContentFor(type: CVSectionType): unknown {
  switch (type) {
    case 'CONTACT':
      return { fullName: '', email: '' };
    case 'SUMMARY':
    case 'CUSTOM':
      return { text: '' };
    case 'EXPERIENCE':
    case 'EDUCATION':
      return { entries: [] };
    case 'SKILLS':
      return { groups: [] };
  }
}

const isBlank = (value: unknown): boolean =>
  typeof value !== 'string' || value.trim() === '';

/**
 * Whether a section has no meaningful content and should be omitted from rendered and
 * exported output (FR-015). Operates defensively on possibly-partial editor state.
 */
export function isSectionEmpty(type: CVSectionType, content: unknown): boolean {
  const c = (content ?? {}) as Record<string, unknown>;

  switch (type) {
    case 'CONTACT':
      return Object.values(c).every(isBlank);
    case 'SUMMARY':
    case 'CUSTOM':
      return isBlank(c.text);
    case 'EXPERIENCE':
    case 'EDUCATION': {
      const entries = Array.isArray(c.entries) ? c.entries : [];
      return entries.every((entry) =>
        Object.values(entry as Record<string, unknown>).every(
          (v) => typeof v === 'boolean' || isBlank(v),
        ),
      );
    }
    case 'SKILLS': {
      const groups = Array.isArray(c.groups) ? c.groups : [];
      return groups.every((group) => {
        const skills = (group as { skills?: unknown }).skills;
        return !Array.isArray(skills) || skills.every(isBlank);
      });
    }
  }
}
