'use client';

import { useState } from 'react';
import type { CVData, CVSectionData, TemplateId } from '@/types/cv';
import { templateMeta } from '@/components/cv-templates/registry';
import { CVPreview } from '@/components/cv-preview/CVPreview';
import { Button } from '@/components/ui';
import { SectionEditor } from './SectionEditor';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** US1 editor (T039): section editors on the left, live preview on the right. */
export function CVEditor({ initialCV }: { initialCV: CVData }) {
  const [title, setTitle] = useState(initialCV.title);
  const [templateId, setTemplateId] = useState<TemplateId>(initialCV.templateId);
  const [sections, setSections] = useState<CVSectionData[]>(initialCV.sections);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const cv: CVData = { ...initialCV, title, templateId, sections };

  function updateSection(id: string, content: unknown) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? ({ ...s, content } as CVSectionData) : s)),
    );
    setStatus('idle');
  }

  async function save() {
    setStatus('saving');
    try {
      const meta = await fetch(`/api/cvs/${initialCV.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, templateId }),
      });
      if (!meta.ok) throw new Error('meta');

      const results = await Promise.all(
        sections.map((s) =>
          fetch(`/api/cvs/${initialCV.id}/sections/${s.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: s.content }),
          }),
        ),
      );
      if (results.some((r) => !r.ok)) throw new Error('section');
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="w-full overflow-auto border-gray-200 p-4 lg:w-1/2 lg:border-r">
        <div className="mb-3 flex items-center gap-3">
          <input
            aria-label="CV title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setStatus('idle');
            }}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-lg font-semibold focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
          <Button onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save'}
          </Button>
        </div>
        <div role="status" aria-live="polite" className="mb-4 h-4 text-sm text-gray-500">
          {status === 'saved' && 'All changes saved'}
          {status === 'error' && <span className="text-red-600">Could not save — try again</span>}
        </div>

        <fieldset className="mb-6">
          <legend className="mb-2 text-sm font-medium">Template</legend>
          <div className="flex flex-wrap gap-2">
            {templateMeta.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={templateId === t.id}
                onClick={() => {
                  setTemplateId(t.id);
                  setStatus('idle');
                }}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  templateId === t.id
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.id} aria-label={section.title}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
                {section.title}
              </h2>
              <SectionEditor
                section={section}
                onChange={(content) => updateSection(section.id, content)}
              />
            </section>
          ))}
        </div>
      </div>

      <div className="w-full p-4 lg:w-1/2">
        <CVPreview cv={cv} />
      </div>
    </div>
  );
}
