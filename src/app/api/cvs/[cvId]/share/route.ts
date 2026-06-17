import { NextResponse } from 'next/server';
import { ApiException, ok, withAuth } from '@/lib/api';
import { prisma } from '@/lib/db';
import { assertOwnedCV } from '@/lib/cv';
import { validateSlug } from '@/lib/slug';

type Params = { params: { cvId: string } };

function shareUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return `${base}/${slug}`;
}

/** GET /api/cvs/:cvId/share — current share state for a CV. */
export async function GET(_request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);

    const active = await prisma.shareLink.findFirst({
      where: { cvId: params.cvId, status: 'ACTIVE' },
    });
    if (active) {
      return ok({ status: 'ACTIVE', slug: active.slug, url: shareUrl(active.slug) });
    }

    const revoked = await prisma.shareLink.findFirst({
      where: { cvId: params.cvId, status: 'REVOKED' },
      orderBy: { revokedAt: 'desc' },
    });
    if (revoked) {
      return ok({ status: 'REVOKED', slug: revoked.slug, url: shareUrl(revoked.slug) });
    }

    return ok({ status: 'NONE', slug: null, url: null });
  });
}

/** POST /api/cvs/:cvId/share — publish the CV at a vanity slug. */
export async function POST(request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);

    const body = (await request.json().catch(() => ({}))) as { slug?: unknown };
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';

    const check = validateSlug(slug);
    if (!check.ok) throw new ApiException(check.code, check.message);

    // A slug is globally unique and permanently reserved to its first owner (FR-009a).
    const reservation = await prisma.slugReservation.findUnique({ where: { slug } });
    if (reservation && reservation.userId !== userId) {
      throw new ApiException('slug_taken', 'That link is already taken. Try another.');
    }

    await prisma.$transaction(async (tx) => {
      if (!reservation) {
        await tx.slugReservation.create({ data: { slug, userId } });
      }
      // One ACTIVE link per CV and per slug — retire any that would conflict, then publish.
      await tx.shareLink.updateMany({
        where: { OR: [{ cvId: params.cvId }, { slug }], status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
      await tx.shareLink.create({
        data: { slug, cvId: params.cvId, userId, status: 'ACTIVE' },
      });
      await tx.cV.update({ where: { id: params.cvId }, data: { visibility: 'SHARED' } });
    });

    return ok({ slug, url: shareUrl(slug) }, 201);
  });
}

/** DELETE /api/cvs/:cvId/share — revoke the active link (slug stays reserved, FR-009a). */
export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async (userId) => {
    await assertOwnedCV(params.cvId, userId);

    const active = await prisma.shareLink.findFirst({
      where: { cvId: params.cvId, status: 'ACTIVE' },
    });
    if (!active) throw new ApiException('not_found', 'This CV isn’t shared.');

    await prisma.$transaction(async (tx) => {
      await tx.shareLink.update({
        where: { id: active.id },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
      await tx.cV.update({ where: { id: params.cvId }, data: { visibility: 'PRIVATE' } });
    });

    return new NextResponse(null, { status: 204 });
  });
}
