import { notFound, redirect } from 'next/navigation';
import { ApiException, getAuthUserId } from '@/lib/api';
import { loadOwnedCV, toCVData } from '@/lib/cv';
import { getTemplate } from '@/components/cv-templates/registry';

export const dynamic = 'force-dynamic';

/** Owner-only, chrome-free render of a CV used as the source for PDF export (see lib/pdf.ts). */
export default async function PrintCVPage({ params }: { params: { cvId: string } }) {
  const userId = await getAuthUserId();
  if (!userId) redirect('/signin');

  let cv;
  try {
    cv = await loadOwnedCV(params.cvId, userId);
  } catch (error) {
    if (error instanceof ApiException) notFound();
    throw error;
  }

  const data = toCVData(cv);
  const Template = getTemplate(data.templateId);

  return (
    <>
      {/* Print on white, not the app's desk surface. */}
      <style>{`body{background:#fff}`}</style>
      <div className="mx-auto max-w-[820px]">
        <Template cv={data} />
      </div>
    </>
  );
}
