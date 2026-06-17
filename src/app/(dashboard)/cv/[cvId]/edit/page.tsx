import { notFound, redirect } from 'next/navigation';
import { ApiException, getAuthUserId } from '@/lib/api';
import { loadOwnedCV, toCVData } from '@/lib/cv';
import { CVEditor } from '@/components/cv-editor/CVEditor';

export const dynamic = 'force-dynamic';

export default async function EditCVPage({ params }: { params: { cvId: string } }) {
  const userId = await getAuthUserId();
  if (!userId) redirect('/signin');

  try {
    const cv = await loadOwnedCV(params.cvId, userId);
    return <CVEditor initialCV={toCVData(cv)} />;
  } catch (error) {
    if (error instanceof ApiException) notFound();
    throw error;
  }
}
