import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { toCVData } from '@/lib/cv';
import { PublicCVView } from '@/components/cv-public/PublicCVView';

export const dynamic = 'force-dynamic';

async function loadSharedCV(slug: string) {
  const link = await prisma.shareLink.findFirst({
    where: { slug: slug.toLowerCase(), status: 'ACTIVE' },
    include: { cv: { include: { sections: true } } },
  });
  return link?.cv ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const cv = await loadSharedCV(params.slug);
  return { title: cv ? cv.title : 'Link not found' };
}

export default async function PublicCVPage({ params }: { params: { slug: string } }) {
  const cv = await loadSharedCV(params.slug);
  if (!cv) notFound();
  return <PublicCVView cv={toCVData(cv)} />;
}
