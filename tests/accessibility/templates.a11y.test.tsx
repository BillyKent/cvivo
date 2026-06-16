import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { templates } from '@/components/cv-templates/registry';
import type { CVData } from '@/types/cv';

// WCAG 2.1 AA audit of rendered CV templates (foundation for FR-011 / SC-005; the public
// page gets its own audit in US2). Restricted to WCAG A/AA tags to match the requirement.
const WCAG_AA = {
  runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
};

const cv: CVData = {
  id: 'cv1',
  title: 'My CV',
  templateId: 'classic',
  visibility: 'SHARED',
  sections: [
    {
      id: 's1',
      type: 'CONTACT',
      title: 'Contact',
      position: 0,
      content: { fullName: 'Jane Doe', email: 'jane@example.com' },
    },
    { id: 's2', type: 'SUMMARY', title: 'Summary', position: 1, content: { text: 'Engineer.' } },
    {
      id: 's3',
      type: 'EXPERIENCE',
      title: 'Experience',
      position: 2,
      content: {
        entries: [
          { company: 'Acme', role: 'Engineer', startDate: '2020-01', current: true, description: 'Work' },
        ],
      },
    },
  ],
};

describe.each(Object.entries(templates))('%s template accessibility', (_id, Template) => {
  it('has no WCAG 2.1 AA violations', async () => {
    const { container } = render(
      <main>
        <Template cv={cv} />
      </main>,
    );
    const results = await axe(container, WCAG_AA);
    expect(results).toHaveNoViolations();
  });
});
