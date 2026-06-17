import { NextResponse } from 'next/server';
import { failCode, getAuthUserId } from '@/lib/api';
import { prisma } from '@/lib/db';

/**
 * GET /api/account/export — download all of the user's personal data as JSON (FR-014).
 * Returns the caller's own account, CVs, sections, share links, and slug reservations.
 */
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return failCode('unauthorized', 'Sign in required');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      cvs: { include: { sections: { orderBy: { position: 'asc' } } } },
      shareLinks: true,
      slugReservations: true,
    },
  });
  if (!user) return failCode('not_found', 'Account not found');

  const data = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    cvs: user.cvs,
    shareLinks: user.shareLinks,
    slugReservations: user.slugReservations,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="cvivo-data.json"',
    },
  });
}
