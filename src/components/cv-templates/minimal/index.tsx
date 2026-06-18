import type { CVSectionData, TemplateProps } from '@/types/cv';
import { ContactLine, SectionBody, getContact, visibleSections } from '../sections';

function Block({ section }: { section: CVSectionData }) {
  return (
    <section aria-labelledby={`sec-${section.id}`}>
      <h2
        id={`sec-${section.id}`}
        className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500"
      >
        {section.title}
      </h2>
      <SectionBody section={section} />
    </section>
  );
}

/** Minimal: compact, text-forward layout that maximizes content density. */
export function MinimalTemplate({ cv }: TemplateProps) {
  const contact = getContact(cv);
  const sections = visibleSections(cv).filter((s) => s.type !== 'CONTACT');

  return (
    <article className="mx-auto max-w-3xl bg-white p-8 text-sm leading-relaxed text-gray-900">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold">{contact?.fullName || cv.title}</h1>
        <ContactLine contact={contact} />
      </header>
      <div className="space-y-4">
        {sections.map((section) => (
          <Block key={section.id} section={section} />
        ))}
      </div>
    </article>
  );
}
