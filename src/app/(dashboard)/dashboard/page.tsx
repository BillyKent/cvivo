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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your CVs</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {cvs.length === 0
              ? 'A blank sheet, ready when you are.'
              : `${cvs.length} ${cvs.length === 1 ? 'document' : 'documents'}.`}
          </p>
        </div>
        <NewCVButton />
      </div>

      {cvs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-paper/60 px-6 py-16 text-center">
          <div className="w-24 rounded-md border border-line bg-paper p-3 shadow-sm">
            <div className="h-1.5 w-1/2 rounded bg-line" />
            <div className="mt-2 h-1 w-3/4 rounded bg-line/70" />
            <div className="mt-1.5 h-1 w-2/3 rounded bg-line/70" />
          </div>
          <div>
            <p className="font-medium text-ink">No CVs yet</p>
            <p className="mt-1 text-sm text-ink-muted">Your first CV starts as a blank sheet.</p>
          </div>
          <NewCVButton label="Create your first CV" />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <li key={cv.id}>
              <Link
                href={`/cv/${cv.id}/edit`}
                className="group flex flex-col gap-3 rounded-xl border border-line bg-paper p-4 shadow-sm transition-shadow hover:shadow-raised"
              >
                <div className="rounded-lg border border-line bg-surface-raised p-3">
                  <div className="h-1.5 w-1/2 rounded bg-line" />
                  <div className="mt-2 h-1 w-3/4 rounded bg-line/70" />
                  <div className="mt-1.5 h-1 w-2/3 rounded bg-line/70" />
                  <div className="mt-1.5 h-1 w-1/2 rounded bg-line/70" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-ink group-hover:text-pine">{cv.title}</span>
                  {cv.visibility === 'SHARED' ? (
                    <span className="shrink-0 rounded-full bg-pine-tint px-2 py-0.5 text-[11px] font-medium text-pine">
                      Shared
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] text-ink-muted">Private</span>
                  )}
                </div>
                <span className="text-xs text-ink-muted">
                  Edited {new Date(cv.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
