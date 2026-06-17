import { ok, withAuth } from '@/lib/api';
import { prisma } from '@/lib/db';
import { defaultSectionCreateInput, serializeDetail, serializeSummary } from '@/lib/cv';

/** GET /api/cvs — list the caller's CVs, most-recently-updated first. */
export async function GET() {
  return withAuth(async (userId) => {
    const cvs = await prisma.cV.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
    return ok(cvs.map(serializeSummary));
  });
}

/** POST /api/cvs — create a CV pre-populated with the standard sections (FR-003). */
export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = (await request.json().catch(() => ({}))) as { title?: unknown };
    const title =
      typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'My CV';

    const cv = await prisma.cV.create({
      data: { userId, title, sections: { create: defaultSectionCreateInput() } },
      include: { sections: true },
    });
    return ok(serializeDetail(cv), 201);
  });
}
