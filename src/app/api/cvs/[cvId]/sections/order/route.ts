import { ApiException, ok, withAuth } from '@/lib/api';
import { prisma } from '@/lib/db';
import { applyPositions, assertOwnedCV, serializeSection } from '@/lib/cv';

type Params = { params: { cvId: string } };

/** PATCH /api/cvs/:cvId/sections/order — reorder sections by the full ordered id list. */
export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);
    const body = (await request.json().catch(() => ({}))) as { sectionIds?: unknown };
    const ids = body.sectionIds;

    if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
      throw new ApiException('validation_error', 'sectionIds must be an array of section ids');
    }

    const existing = await prisma.cVSection.findMany({
      where: { cvId: params.cvId },
      select: { id: true },
    });
    const existingIds = existing.map((s) => s.id);
    const sameSet =
      ids.length === existingIds.length && ids.every((id) => existingIds.includes(id as string));
    if (!sameSet) {
      throw new ApiException('validation_error', 'sectionIds must match the CV sections exactly');
    }

    await prisma.$transaction((tx) => applyPositions(tx, ids as string[]));

    const sections = await prisma.cVSection.findMany({
      where: { cvId: params.cvId },
      orderBy: { position: 'asc' },
    });
    return ok({ sections: sections.map(serializeSection) });
  });
}
