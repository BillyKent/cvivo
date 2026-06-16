import type { CVSectionData, TemplateProps } from '@/types/cv';
import { SectionBody, getContact, visibleSections } from '../sections';

function Block({ section }: { section: CVSectionData }) {
  return (
    <section aria-labelledby={`sec-${section.id}`}>
      <h2
        id={`sec-${section.id}`}
        className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wide text-gray-700"
      >
        {section.title}
      </h2>
      <SectionBody section={section} />
    </section>
  );
}

/** Classic: traditional two-column layout with a serif accent and a sidebar. */
export function ClassicTemplate({ cv }: TemplateProps) {
  const contact = getContact(cv);
  const sections = visibleSections(cv);
  const sidebar = sections.filter((s) => s.type === 'CONTACT' || s.type === 'SKILLS');
  const main = sections.filter((s) => s.type !== 'CONTACT' && s.type !== 'SKILLS');

  return (
    <article className="mx-auto max-w-4xl bg-white p-10 font-serif text-gray-900">
      <header className="border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold">{contact?.fullName || cv.title}</h1>
      </header>
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <aside className="space-y-6 md:col-span-1">
          {sidebar.map((section) => (
            <Block key={section.id} section={section} />
          ))}
        </aside>
        <div className="space-y-6 md:col-span-2">
          {main.map((section) => (
            <Block key={section.id} section={section} />
          ))}
        </div>
      </div>
    </article>
  );
}
