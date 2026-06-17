import { NextResponse } from 'next/server';
import { ApiException, failCode, ok, withAuth } from '@/lib/api';
import { prisma } from '@/lib/db';
import { assertOwnedCV, loadOwnedCV, serializeDetail } from '@/lib/cv';
import { TEMPLATE_IDS, type TemplateId } from '@/types/cv';

type Params = { params: { cvId: string } };

/** GET /api/cvs/:cvId — full CV with sections (owner only). */
export async function GET(_request: Request, { params }: Params) {
  return withAuth(async (userId) => ok(serializeDetail(await loadOwnedCV(params.cvId, userId))));
}

/** PATCH /api/cvs/:cvId — update title and/or template. */
export async function PATCH(request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);
    const body = (await request.json().catch(() => ({}))) as {
      title?: unknown;
      templateId?: unknown;
    };

    const data: { title?: string; templateId?: TemplateId } = {};
    if (typeof body.title === 'string' && body.title.trim()) {
      data.title = body.title.trim();
    }
    if (body.templateId !== undefined) {
      if (typeof body.templateId !== 'string' || !TEMPLATE_IDS.includes(body.templateId as TemplateId)) {
        throw new ApiException('validation_error', 'Unknown template');
      }
      data.templateId = body.templateId as TemplateId;
    }

    const cv = await prisma.cV.update({
      where: { id: params.cvId },
      data,
      include: { sections: true },
    });
    return ok(serializeDetail(cv));
  });
}

/** DELETE /api/cvs/:cvId — delete the CV and its sections/share links (cascade). */
export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);
    await prisma.cV.delete({ where: { id: params.cvId } });
    return new NextResponse(null, { status: 204 });
  });
}
