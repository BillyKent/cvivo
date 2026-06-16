import {
  validateSectionContent,
  defaultContentFor,
  isSectionEmpty,
} from '@/lib/validation';

describe('validateSectionContent', () => {
  it('accepts a well-formed CONTACT section', () => {
    const result = validateSectionContent('CONTACT', {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555 0100',
    });
    expect(result.success).toBe(true);
  });

  it('accepts CONTACT with empty optional fields', () => {
    const result = validateSectionContent('CONTACT', { fullName: '', email: '' });
    expect(result.success).toBe(true);
  });

  it('accepts a well-formed EXPERIENCE section', () => {
    const result = validateSectionContent('EXPERIENCE', {
      entries: [
        {
          company: 'Acme',
          role: 'Engineer',
          startDate: '2020-01',
          current: true,
          description: 'Built things.',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects EXPERIENCE whose entries is not an array', () => {
    const result = validateSectionContent('EXPERIENCE', { entries: 'nope' });
    expect(result.success).toBe(false);
  });

  it('rejects EXPERIENCE entry missing required fields', () => {
    const result = validateSectionContent('EXPERIENCE', {
      entries: [{ company: 'Acme' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a well-formed SKILLS section', () => {
    const result = validateSectionContent('SKILLS', {
      groups: [{ label: 'Languages', skills: ['TypeScript', 'Go'] }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts SUMMARY and CUSTOM text sections', () => {
    expect(validateSectionContent('SUMMARY', { text: 'Hi' }).success).toBe(true);
    expect(validateSectionContent('CUSTOM', { text: 'Note' }).success).toBe(true);
  });

  it('rejects SUMMARY without text', () => {
    expect(validateSectionContent('SUMMARY', {}).success).toBe(false);
  });

  it('preserves non-Latin Unicode content (FR-017)', () => {
    const result = validateSectionContent('SUMMARY', { text: '日本語のテキスト — Привет' });
    expect(result.success).toBe(true);
  });
});

describe('defaultContentFor', () => {
  it('produces a valid empty shape for every section type', () => {
    for (const type of ['CONTACT', 'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CUSTOM'] as const) {
      const content = defaultContentFor(type);
      expect(validateSectionContent(type, content).success).toBe(true);
    }
  });
});

describe('isSectionEmpty (FR-015)', () => {
  it('treats a blank summary as empty', () => {
    expect(isSectionEmpty('SUMMARY', { text: '   ' })).toBe(true);
  });

  it('treats experience with no entries as empty', () => {
    expect(isSectionEmpty('EXPERIENCE', { entries: [] })).toBe(true);
  });

  it('treats a populated contact as non-empty', () => {
    expect(isSectionEmpty('CONTACT', { fullName: 'Jane', email: '' })).toBe(false);
  });

  it('treats skills with only empty strings as empty', () => {
    expect(isSectionEmpty('SKILLS', { groups: [{ skills: ['', '  '] }] })).toBe(true);
  });
});
