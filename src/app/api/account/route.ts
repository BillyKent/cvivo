import { NextResponse } from 'next/server';
import { failCode, getAuthUserId, ok } from '@/lib/api';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** GET /api/account — the authenticated user's profile. */
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return failCode('unauthorized', 'Sign in required');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return failCode('not_found', 'Account not found');

  return ok({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  });
}

/**
 * DELETE /api/account — permanently delete the account and all personal data (FR-014, SC-008).
 * Deleting the User row cascades CVs → sections → share links, and sets slug_reservations.user_id
 * to NULL (the slug is retired, never reusable by anyone else — FR-009a). The Supabase Auth user
 * is then removed and the session cleared.
 */
export async function DELETE() {
  const userId = await getAuthUserId();
  if (!userId) return failCode('unauthorized', 'Sign in required');

  await prisma.user.delete({ where: { id: userId } });

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);

  const supabase = createClient();
  await supabase.auth.signOut();

  return new NextResponse(null, { status: 204 });
}
