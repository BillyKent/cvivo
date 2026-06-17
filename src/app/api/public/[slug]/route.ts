import { failCode, ok } from '@/lib/api';
import { prisma } from '@/lib/db';

type Params = { params: { slug: string } };

/**
 * GET /api/public/:slug — CV content for an active shared link. No auth; returns only the
 * CV content (never owner identity). 404 when the slug is missing or revoked (FR-016).
 */
export async function GET(_request: Request, { params }: Params) {
  const slug = params.slug.toLowerCase();

  const link = await prisma.shareLink.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: { cv: { include: { sections: true } } },
  });

  if (!link) {
    return failCode('not_found', 'This link is no longer active.');
  }

  const { cv } = link;
  return ok({
    cv: {
      title: cv.title,
      templateId: cv.templateId,
      sections: [...cv.sections]
        .sort((a, b) => a.position - b.position)
        .map((s) => ({ type: s.type, title: s.title, content: s.content })),
    },
  });
}
