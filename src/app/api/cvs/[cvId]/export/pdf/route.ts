import { NextResponse } from 'next/server';
import { ApiException, failCode, getAuthUserId } from '@/lib/api';
import { loadOwnedCV } from '@/lib/cv';
import { renderCVPdf } from '@/lib/pdf';

export const dynamic = 'force-dynamic';
// PDF generation launches Chromium — give it room beyond the default serverless limit.
export const maxDuration = 60;

type Params = { params: { cvId: string } };

function filenameFor(title: string): string {
  const base = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return `${base || 'cv'}.pdf`;
}

/** POST /api/cvs/:cvId/export/pdf — owner-only PDF export of the CV. */
export async function POST(request: Request, { params }: Params) {
  const userId = await getAuthUserId();
  if (!userId) return failCode('unauthorized', 'Sign in required');

  let cv;
  try {
    cv = await loadOwnedCV(params.cvId, userId);
  } catch (error) {
    if (error instanceof ApiException) return error.toResponse();
    throw error;
  }

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const cookie = request.headers.get('cookie') ?? '';
    const pdf = await renderCVPdf({ cvId: params.cvId, cookie, origin });
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filenameFor(cv.title)}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation failed', error);
    return failCode('pdf_generation_failed', 'We couldn’t generate the PDF. Please try again.');
  }
}
