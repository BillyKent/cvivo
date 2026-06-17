import Link from 'next/link';
import type { CVData } from '@/types/cv';
import { getTemplate } from '@/components/cv-templates/registry';

/** The read-only public view of a shared CV (FR-010/FR-011): the sheet on the desk, plus a
 *  quiet CVivo footer. Reused by the public page and the accessibility test. */
export function PublicCVView({ cv }: { cv: CVData }) {
  const Template = getTemplate(cv.templateId);
  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-[820px] px-4 py-8 sm:py-12">
        <div className="overflow-hidden rounded-sm bg-paper shadow-sheet ring-1 ring-line/60">
          <Template cv={cv} />
        </div>
        <footer className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/" className="transition-colors hover:text-ink">
            Made with <span className="font-display font-semibold text-ink">CVivo</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}
