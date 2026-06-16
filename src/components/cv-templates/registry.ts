import type { ComponentType } from 'react';
import type { TemplateId, TemplateProps } from '@/types/cv';
import { ClassicTemplate } from './classic';
import { ModernTemplate } from './modern';
import { MinimalTemplate } from './minimal';

export const templates: Record<TemplateId, ComponentType<TemplateProps>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
}

export const templateMeta: TemplateMeta[] = [
  { id: 'classic', name: 'Classic', description: 'Traditional two-column, serif accents.' },
  { id: 'modern', name: 'Modern', description: 'Single column with a bold accent header.' },
  { id: 'minimal', name: 'Minimal', description: 'Compact, text-forward, high density.' },
];

/** Resolve a template component by id, falling back to Classic for unknown ids. */
export function getTemplate(id: TemplateId | string): ComponentType<TemplateProps> {
  return templates[id as TemplateId] ?? templates.classic;
}
