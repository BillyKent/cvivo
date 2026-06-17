import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { ApiException, ok, withAuth } from '@/lib/api';
import { prisma } from '@/lib/db';
import { applyPositions, serializeSection } from '@/lib/cv';
import { validateSectionContent } from '@/lib/validation';

type Params = { params: { cvId: string; sectionId: string } };

/** Load a section and assert the caller owns its CV. */
async function loadOwnedSection(cvId: string, sectionId: string, userId: string) {
  const section = await prisma.cVSection.findUnique({
    where: { id: sectionId },
    include: { cv: { select: { userId: true } } },
  });
  if (!section || section.cvId !== cvId) throw new ApiException('not_found', 'Section not found');
  if (section.cv.userId !== userId) {
    throw new ApiException('forbidden', 'You do not have access to this section');
  }
  return section;
}

/** PATCH /api/cvs/:cvId/sections/:sectionId — update title and/or content. */
export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    const section = await loadOwnedSection(params.cvId, params.sectionId, userId);
    const body = (await request.json().catch(() => ({}))) as { title?: unknown; content?: unknown };

    const data: { title?: string; content?: Prisma.InputJsonValue } = {};
    if (typeof body.title === 'string' && body.title.trim()) {
      data.title = body.title.trim();
    }
    if (body.content !== undefined) {
      const result = validateSectionContent(section.type, body.content);
      if (!result.success) throw new ApiException('validation_error', 'Invalid section content');
      data.content = result.data as Prisma.InputJsonValue;
    }

    const updated = await prisma.cVSection.update({ where: { id: params.sectionId }, data });
    return ok(serializeSection(updated));
  });
}

/** DELETE /api/cvs/:cvId/sections/:sectionId — remove a section and compact positions. */
export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await loadOwnedSection(params.cvId, params.sectionId, userId);
    await prisma.$transaction(async (tx) => {
      await tx.cVSection.delete({ where: { id: params.sectionId } });
      const remaining = await tx.cVSection.findMany({
        where: { cvId: params.cvId },
        orderBy: { position: 'asc' },
        select: { id: true },
      });
      await applyPositions(tx, remaining.map((s) => s.id));
    });
    return new NextResponse(null, { status: 204 });
  });
}
