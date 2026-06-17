import type { Prisma } from '@prisma/client';
import { ApiException, ok, withAuth } from '@/lib/api';
import { prisma } from '@/lib/db';
import { assertOwnedCV, serializeSection } from '@/lib/cv';
import { isSectionType, validateSectionContent } from '@/lib/validation';

type Params = { params: { cvId: string } };

/** GET /api/cvs/:cvId/sections — sections in display order. */
export async function GET(_request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);
    const sections = await prisma.cVSection.findMany({
      where: { cvId: params.cvId },
      orderBy: { position: 'asc' },
    });
    return ok(sections.map(serializeSection));
  });
}

/** POST /api/cvs/:cvId/sections — append a section. */
export async function POST(request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);
    const body = (await request.json().catch(() => ({}))) as {
      type?: unknown;
      title?: unknown;
      content?: unknown;
    };

    if (!isSectionType(body.type)) {
      throw new ApiException('validation_error', 'Invalid section type');
    }
    const result = validateSectionContent(body.type, body.content);
    if (!result.success) {
      throw new ApiException('validation_error', 'Invalid section content');
    }
    const title =
      typeof body.title === 'string' && body.title.trim() ? body.title.trim() : body.type;

    const max = await prisma.cVSection.aggregate({
      where: { cvId: params.cvId },
      _max: { position: true },
    });
    const position = (max._max.position ?? -1) + 1;

    const section = await prisma.cVSection.create({
      data: {
        cvId: params.cvId,
        type: body.type,
        title,
        content: result.data as Prisma.InputJsonValue,
        position,
      },
    });
    return ok(serializeSection(section), 201);
  });
}
