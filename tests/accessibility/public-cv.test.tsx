import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PublicCVView } from '@/components/cv-public/PublicCVView';
import type { CVData } from '@/types/cv';

// WCAG 2.1 AA audit of the public shared CV view (FR-011, SC-005).
const WCAG_AA = {
  runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
};

const cv: CVData = {
  id: 'cv1',
  title: 'Ada Lovelace',
  templateId: 'classic',
  visibility: 'SHARED',
  sections: [
    {
      id: 's1',
      type: 'CONTACT',
      title: 'Contact',
      position: 0,
      content: { fullName: 'Ada Lovelace', email: 'ada@example.com' },
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

describe('public CV view accessibility', () => {
  it('has no WCAG 2.1 AA violations', async () => {
    const { container } = render(<PublicCVView cv={cv} />);
    expect(await axe(container, WCAG_AA)).toHaveNoViolations();
  });
});
