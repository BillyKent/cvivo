import { redirect } from 'next/navigation';
import { getAuthUserId } from '@/lib/api';
import { prisma } from '@/lib/db';
import { AccountActions } from '@/components/account/AccountActions';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect('/signin');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/signin');

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Account</h1>

      <dl className="mt-6 rounded-xl border border-line bg-paper p-4 text-sm">
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-ink-muted">Email</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-ink-muted">Member since</dt>
          <dd className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>

      <AccountActions />
    </main>
  );
}
