import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUserId } from '@/lib/api';
import { prisma } from '@/lib/db';
import { serializeSummary } from '@/lib/cv';
import { NewCVButton } from '@/components/cv-editor/NewCVButton';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect('/signin');

  const cvs = (
    await prisma.cV.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } })
  ).map(serializeSummary);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your CVs</h1>
        <NewCVButton />
      </div>

      {cvs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No CVs yet. Create your first one to get started.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {cvs.map((cv) => (
            <li key={cv.id}>
              <Link
                href={`/cv/${cv.id}/edit`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-brand-600"
              >
                <span className="font-medium">{cv.title}</span>
                <span className="mt-1 block text-xs text-gray-500">
                  {cv.visibility === 'SHARED' ? 'Shared' : 'Private'} ·{' '}
                  {new Date(cv.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
