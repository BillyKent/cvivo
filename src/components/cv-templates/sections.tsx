import type { CVData, CVSectionData, ContactContent } from '@/types/cv';
import { isSectionEmpty } from '@/lib/validation';

/** Sections with content, in display order. Empty optional sections are dropped (FR-015). */
export function visibleSections(cv: CVData): CVSectionData[] {
  return [...cv.sections]
    .filter((section) => !isSectionEmpty(section.type, section.content))
    .sort((a, b) => a.position - b.position);
}

/** The contact section content, if present — used for the name header. */
export function getContact(cv: CVData): ContactContent | undefined {
  const section = cv.sections.find((s) => s.type === 'CONTACT');
  return section?.type === 'CONTACT' ? section.content : undefined;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonth(value?: string): string {
  if (!value) return '';
  const [year, month] = value.split('-');
  const index = Number(month) - 1;
  return month && index >= 0 && index < 12 ? `${MONTHS[index]} ${year}` : (year ?? '');
}

export function formatRange(start: string, end: string | undefined, current: boolean): string {
  const from = formatMonth(start);
  const to = current ? 'Present' : formatMonth(end);
  return [from, to].filter(Boolean).join(' – ');
}

/** Renders the inner content of a section, narrowed by its type. Layout-agnostic so every
 *  template composes the same content (single render path → faithful preview/PDF, Principle II). */
export function SectionBody({ section }: { section: CVSectionData }) {
  switch (section.type) {
    case 'CONTACT': {
      const { email, phone, location, website, linkedin } = section.content;
      const items = [email, phone, location, website, linkedin].filter(Boolean);
      return (
        <ul className="space-y-0.5">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    case 'SUMMARY':
    case 'CUSTOM':
      return <p className="whitespace-pre-wrap">{section.content.text}</p>;
    case 'EXPERIENCE':
      return (
        <div className="space-y-3">
          {section.content.entries.map((entry, i) => (
            <div key={i}>
              <div className="flex flex-wrap justify-between gap-x-2">
                <span className="font-medium">
                  {entry.role} · {entry.company}
                </span>
                <span className="shrink-0 text-sm text-gray-600">
                  {formatRange(entry.startDate, entry.endDate, entry.current)}
                </span>
              </div>
              {entry.description && (
                <p className="mt-1 whitespace-pre-wrap text-sm">{entry.description}</p>
              )}
            </div>
          ))}
        </div>
      );
    case 'EDUCATION':
      return (
        <div className="space-y-3">
          {section.content.entries.map((entry, i) => (
            <div key={i}>
              <div className="flex flex-wrap justify-between gap-x-2">
                <span className="font-medium">
                  {entry.degree}
                  {entry.field ? `, ${entry.field}` : ''}
                </span>
                <span className="shrink-0 text-sm text-gray-600">
                  {formatRange(entry.startDate, entry.endDate, entry.current)}
                </span>
              </div>
              <div className="text-sm">{entry.institution}</div>
            </div>
          ))}
        </div>
      );
    case 'SKILLS':
      return (
        <div className="space-y-1">
          {section.content.groups.map((group, i) => {
            const skills = group.skills.filter(Boolean);
            if (skills.length === 0) return null;
            return (
              <div key={i}>
                {group.label && <span className="font-medium">{group.label}: </span>}
                <span>{skills.join(', ')}</span>
              </div>
            );
          })}
        </div>
      );
  }
}
