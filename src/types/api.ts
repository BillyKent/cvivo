// API request/response contracts — see specs/001-cvivo-cv-platform/contracts/api.md

import type { CVSectionType, CVVisibility, TemplateId } from './cv';

export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation_error'
  | 'conflict'
  | 'slug_taken'
  | 'slug_invalid_format'
  | 'slug_reserved_word'
  | 'pdf_generation_failed';

export interface ApiError {
  error: ApiErrorCode;
  message: string;
}

export interface CVSummary {
  id: string;
  title: string;
  templateId: TemplateId;
  visibility: CVVisibility;
  updatedAt: string;
}

export interface SectionDTO {
  id: string;
  type: CVSectionType;
  title: string;
  content: unknown;
  position: number;
}

export interface CVDetail extends CVSummary {
  createdAt: string;
  sections: SectionDTO[];
}

export interface CreateCVRequest {
  title?: string;
}

export interface UpdateCVRequest {
  title?: string;
  templateId?: TemplateId;
}

export interface CreateSectionRequest {
  type: CVSectionType;
  title: string;
  content: unknown;
}

export interface UpdateSectionRequest {
  title?: string;
  content?: unknown;
}

export interface ReorderSectionsRequest {
  sectionIds: string[];
}

export type ShareStatus = 'ACTIVE' | 'REVOKED' | 'NONE';

export interface ShareStateResponse {
  status: ShareStatus;
  slug: string | null;
  url: string | null;
}

export interface CreateShareRequest {
  slug: string;
}
