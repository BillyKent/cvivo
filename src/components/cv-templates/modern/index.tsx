import type { CVSectionData, TemplateProps } from '@/types/cv';
import { SectionBody, getContact, visibleSections } from '../sections';

function Block({ section }: { section: CVSectionData }) {
  return (
    <section aria-labelledby={`sec-${section.id}`}>
      <h2 id={`sec-${section.id}`} className="mb-2 text-lg font-semibold text-pine">
        {section.title}
      </h2>
      <SectionBody section={section} />
    </section>
  );
}

/** Modern: single column, bold typographic header with an accent color. */
export function ModernTemplate({ cv }: TemplateProps) {
  const contact = getContact(cv);
  const sections = visibleSections(cv);

  return (
    <article className="mx-auto max-w-3xl bg-white p-10 text-gray-900">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-pine">
          {contact?.fullName || cv.title}
        </h1>
        {contact && (
          <p className="mt-2 text-sm text-gray-600">
            {[contact.email, contact.phone, contact.location].filter(Boolean).join('  ·  ')}
          </p>
        )}
      </header>
      <div className="space-y-6">
        {sections
          .filter((s) => s.type !== 'CONTACT')
          .map((section) => (
            <Block key={section.id} section={section} />
          ))}
      </div>
    </article>
  );
}
