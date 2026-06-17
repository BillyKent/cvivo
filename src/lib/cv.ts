import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db';
import { ApiException } from '@/lib/api';
import { defaultContentFor } from '@/lib/validation';
import type { CVDetail, CVSummary, SectionDTO } from '@/types/api';
import type { CVData, CVSectionData, CVSectionType, TemplateId } from '@/types/cv';

/** Standard sections every new CV starts with (FR-003), in display order. */
export const STANDARD_SECTIONS: { type: CVSectionType; title: string }[] = [
  { type: 'CONTACT', title: 'Contact' },
  { type: 'SUMMARY', title: 'Summary' },
  { type: 'EXPERIENCE', title: 'Experience' },
  { type: 'EDUCATION', title: 'Education' },
  { type: 'SKILLS', title: 'Skills' },
];

type CVWithSections = Prisma.CVGetPayload<{ include: { sections: true } }>;
type SectionRow = Prisma.CVSectionGetPayload<object>;
type CVRow = Prisma.CVGetPayload<object>;

export function serializeSummary(cv: CVRow): CVSummary {
  return {
    id: cv.id,
    title: cv.title,
    templateId: cv.templateId as TemplateId,
    visibility: cv.visibility,
    updatedAt: cv.updatedAt.toISOString(),
  };
}

export function serializeSection(section: SectionRow): SectionDTO {
  return {
    id: section.id,
    type: section.type,
    title: section.title,
    content: section.content,
    position: section.position,
  };
}

/** Map a loaded CV (Prisma rows) to the typed CVData consumed by templates and the editor. */
export function toCVData(cv: CVWithSections): CVData {
  return {
    id: cv.id,
    title: cv.title,
    templateId: cv.templateId as TemplateId,
    visibility: cv.visibility,
    sections: [...cv.sections]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        position: s.position,
        content: s.content,
      })) as unknown as CVSectionData[],
  };
}

export function serializeDetail(cv: CVWithSections): CVDetail {
  return {
    ...serializeSummary(cv),
    createdAt: cv.createdAt.toISOString(),
    sections: [...cv.sections]
      .sort((a, b) => a.position - b.position)
      .map(serializeSection),
  };
}

/** Default section rows for a brand-new CV. */
export function defaultSectionCreateInput(): Prisma.CVSectionCreateWithoutCvInput[] {
  return STANDARD_SECTIONS.map((section, index) => ({
    type: section.type,
    title: section.title,
    position: index,
    content: defaultContentFor(section.type) as Prisma.InputJsonValue,
  }));
}

/**
 * Load a CV the caller owns, or throw the right ApiException:
 * 404 if it does not exist, 403 if it exists but belongs to someone else (FR-013).
 */
export async function loadOwnedCV(cvId: string, userId: string): Promise<CVWithSections> {
  const cv = await prisma.cV.findUnique({ where: { id: cvId }, include: { sections: true } });
  if (!cv) throw new ApiException('not_found', 'CV not found');
  if (cv.userId !== userId) throw new ApiException('forbidden', 'You do not have access to this CV');
  return cv;
}

/** Assert ownership without loading sections. */
export async function assertOwnedCV(cvId: string, userId: string): Promise<void> {
  const cv = await prisma.cV.findUnique({ where: { id: cvId }, select: { userId: true } });
  if (!cv) throw new ApiException('not_found', 'CV not found');
  if (cv.userId !== userId) throw new ApiException('forbidden', 'You do not have access to this CV');
}

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Set section positions to the given order safely. Two passes (negative temporaries, then
 * final indices) avoid transiently violating the (cvId, position) unique constraint.
 */
export async function applyPositions(tx: Tx, orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i += 1) {
    await tx.cVSection.update({ where: { id: orderedIds[i] }, data: { position: -(i + 1) } });
  }
  for (let i = 0; i < orderedIds.length; i += 1) {
    await tx.cVSection.update({ where: { id: orderedIds[i] }, data: { position: i } });
  }
}
