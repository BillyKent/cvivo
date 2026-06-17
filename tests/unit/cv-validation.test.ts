import { validateCVForSave } from '@/lib/validation';
import type { CVData, CVSectionData } from '@/types/cv';

function cvWith(sections: CVSectionData[]): CVData {
  return { id: 'cv', title: 'CV', templateId: 'classic', visibility: 'PRIVATE', sections };
}

describe('validateCVForSave (FR-001a/FR-002a)', () => {
  it('passes when an experience entry is entirely blank (ignored)', () => {
    const cv = cvWith([
      {
        id: 's1',
        type: 'EXPERIENCE',
        title: 'Experience',
        position: 0,
        content: { entries: [{ company: '', role: '', startDate: '', endDate: '', current: false, description: '' }] },
      },
    ]);
    expect(validateCVForSave(cv).ok).toBe(true);
  });

  it('flags missing required fields on a started experience entry', () => {
    const cv = cvWith([
      {
        id: 's1',
        type: 'EXPERIENCE',
        title: 'Experience',
        position: 0,
        content: { entries: [{ company: 'Acme', role: '', startDate: '', endDate: '', current: false, description: '' }] },
      },
    ]);
    const result = validateCVForSave(cv);
    expect(result.ok).toBe(false);
    const paths = result.errors['s1'].map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining(['entries.0.role', 'entries.0.startDate']));
    expect(paths).not.toContain('entries.0.company');
  });

  it('passes a complete experience entry', () => {
    const cv = cvWith([
      {
        id: 's1',
        type: 'EXPERIENCE',
        title: 'Experience',
        position: 0,
        content: { entries: [{ company: 'Acme', role: 'Engineer', startDate: '2020-01', current: true, description: '' }] },
      },
    ]);
    expect(validateCVForSave(cv).ok).toBe(true);
  });

  it('flags a started education entry', () => {
    const cv = cvWith([
      {
        id: 'e',
        type: 'EDUCATION',
        title: 'Education',
        position: 0,
        content: { entries: [{ institution: 'MIT', degree: '', startDate: '', current: false }] },
      },
    ]);
    const result = validateCVForSave(cv);
    expect(result.ok).toBe(false);
    expect(result.errors['e'].map((x) => x.path)).toEqual(
      expect.arrayContaining(['entries.0.degree', 'entries.0.startDate']),
    );
  });

  it('requires a name when contact has other info', () => {
    const cv = cvWith([
      { id: 'c', type: 'CONTACT', title: 'Contact', position: 0, content: { fullName: '', email: 'a@b.com' } },
    ]);
    const result = validateCVForSave(cv);
    expect(result.ok).toBe(false);
    expect(result.errors['c'][0].path).toBe('fullName');
  });

  it('ignores empty contact, summary, and skills sections', () => {
    const cv = cvWith([
      { id: 'c', type: 'CONTACT', title: 'Contact', position: 0, content: { fullName: '', email: '' } },
      { id: 's', type: 'SUMMARY', title: 'Summary', position: 1, content: { text: '' } },
      { id: 'k', type: 'SKILLS', title: 'Skills', position: 2, content: { groups: [] } },
    ]);
    expect(validateCVForSave(cv).ok).toBe(true);
  });
});
