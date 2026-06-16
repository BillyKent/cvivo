import { render, screen } from '@testing-library/react';
import { templates, getTemplate, templateMeta } from '@/components/cv-templates/registry';
import type { CVData } from '@/types/cv';

const sampleCV: CVData = {
  id: 'cv1',
  title: 'My CV',
  templateId: 'classic',
  visibility: 'PRIVATE',
  sections: [
    {
      id: 's1',
      type: 'CONTACT',
      title: 'Contact',
      position: 0,
      content: { fullName: 'Jane Doe', email: 'jane@example.com', phone: '+1 555 0100' },
    },
    {
      id: 's2',
      type: 'SUMMARY',
      title: 'Summary',
      position: 1,
      content: { text: '日本語 — Experienced engineer' },
    },
    {
      id: 's3',
      type: 'EXPERIENCE',
      title: 'Experience',
      position: 2,
      content: {
        entries: [
          {
            company: 'Acme',
            role: 'Engineer',
            startDate: '2020-01',
            current: true,
            description: 'Built systems',
          },
        ],
      },
    },
    {
      id: 's4',
      type: 'SKILLS',
      title: 'Skills',
      position: 3,
      content: { groups: [{ label: 'Languages', skills: ['TypeScript', 'Go'] }] },
    },
    {
      id: 's5',
      type: 'EDUCATION',
      title: 'Education',
      position: 4,
      content: { entries: [] }, // empty → must be omitted
    },
  ],
};

describe.each(Object.entries(templates))('%s template', (_id, Template) => {
  it('renders the person name as the level-1 heading', () => {
    render(<Template cv={sampleCV} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument();
  });

  it('renders core section content', () => {
    render(<Template cv={sampleCV} />);
    expect(screen.getByText(/Experienced engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/)).toBeInTheDocument();
  });

  it('omits empty optional sections (FR-015)', () => {
    render(<Template cv={sampleCV} />);
    expect(screen.queryByRole('heading', { name: 'Education' })).not.toBeInTheDocument();
  });

  it('preserves non-Latin Unicode (FR-017)', () => {
    render(<Template cv={sampleCV} />);
    expect(screen.getByText(/日本語/)).toBeInTheDocument();
  });
});

describe('template registry', () => {
  it('falls back to Classic for unknown ids', () => {
    expect(getTemplate('does-not-exist')).toBe(templates.classic);
  });

  it('exposes metadata for all three templates', () => {
    expect(templateMeta.map((t) => t.id).sort()).toEqual(['classic', 'minimal', 'modern']);
  });
});
