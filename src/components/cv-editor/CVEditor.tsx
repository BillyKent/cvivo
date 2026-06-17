'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CVData, CVSectionData, TemplateId } from '@/types/cv';
import { templateMeta } from '@/components/cv-templates/registry';
import { CVPreview } from '@/components/cv-preview/CVPreview';
import { Button, CheckIcon, AlertIcon } from '@/components/ui';
import { isSectionEmpty } from '@/lib/validation';
import { SectionEditor } from './SectionEditor';
import { SharePanel } from './SharePanel';
import { ExportButton } from './ExportButton';

type SaveStatus = 'clean' | 'dirty' | 'saving' | 'saved' | 'error';

function SaveState({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return <span className="text-ink-muted">Saving…</span>;
    case 'saved':
      return (
        <span className="flex items-center gap-1 text-pine">
          <CheckIcon className="text-[14px]" /> Saved
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1 text-clay">
          <AlertIcon className="text-[13px]" /> Couldn’t save
        </span>
      );
    case 'dirty':
      return <span className="text-ink-muted">Unsaved changes</span>;
    default:
      return <span className="text-ink-muted">Saved</span>;
  }
}

function TemplateChips({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Template"
      className="inline-flex gap-0.5 rounded-lg border border-line bg-paper p-0.5"
    >
      {templateMeta.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={value === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === t.id ? 'bg-pine text-white' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}

/** US1 editor (T039): a drafting desk — controls on the left, the live sheet on the right. */
export function CVEditor({ initialCV }: { initialCV: CVData }) {
  const [title, setTitle] = useState(initialCV.title);
  const [templateId, setTemplateId] = useState<TemplateId>(initialCV.templateId);
  const [sections, setSections] = useState<CVSectionData[]>(initialCV.sections);
  const [status, setStatus] = useState<SaveStatus>('clean');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [shareOpen, setShareOpen] = useState(false);

  const cv: CVData = { ...initialCV, title, templateId, sections };

  function touch() {
    setStatus((s) => (s === 'saving' ? s : 'dirty'));
  }

  function updateSection(id: string, content: unknown) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? ({ ...s, content } as CVSectionData) : s)),
    );
    touch();
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
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Sub-bar: title + save state + save action */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-surface-raised px-3 py-2 sm:px-4">
        <Link
          href="/dashboard"
          aria-label="Back to your CVs"
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 12 6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">CVs</span>
        </Link>

        <input
          aria-label="CV title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            touch();
          }}
          className="min-w-0 flex-1 truncate rounded-md bg-transparent px-2 py-1 text-base font-semibold text-ink hover:bg-surface focus:bg-paper focus:outline-none focus:ring-2 focus:ring-pine/30"
        />

        <span className="hidden text-sm sm:inline">
          <SaveState status={status} />
        </span>
        <div className="hidden sm:block">
          <ExportButton cvId={initialCV.id} onBeforeExport={save} />
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            // Share what you see: persist the latest edits before opening the panel.
            await save();
            setShareOpen(true);
          }}
          className="shrink-0"
        >
          Share
        </Button>
        <Button onClick={save} disabled={status === 'saving'} className="shrink-0">
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {/* Mobile: switch between editing and the sheet */}
      <div className="shrink-0 border-b border-line bg-surface-raised px-4 py-2 lg:hidden">
        <div className="mx-auto flex max-w-xs rounded-lg border border-line bg-paper p-0.5 text-sm">
          {([
            ['edit', 'Edit'],
            ['preview', 'Preview'],
          ] as const).map(([view, label]) => (
            <button
              key={view}
              type="button"
              aria-pressed={mobileView === view}
              onClick={() => setMobileView(view)}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                mobileView === view ? 'bg-pine text-white' : 'text-ink-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div
          className={`${mobileView === 'edit' ? 'block' : 'hidden'} h-full w-full overflow-y-auto border-line lg:block lg:w-1/2 lg:border-r`}
        >
          <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Style
              </span>
              <TemplateChips
                value={templateId}
                onChange={(id) => {
                  setTemplateId(id);
                  touch();
                }}
              />
            </div>

            <div className="space-y-7">
              {sections.map((section, i) => {
                const empty = isSectionEmpty(section.type, section.content);
                return (
                  <section
                    key={section.id}
                    className="animate-rise"
                    style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                  >
                    <header className="mb-3 flex items-baseline justify-between gap-2 border-b border-line pb-2">
                      <h2 className="font-display text-lg font-medium text-ink">{section.title}</h2>
                      {empty && (
                        <span className="shrink-0 text-[11px] text-ink-muted">
                          Hidden until you add content
                        </span>
                      )}
                    </header>
                    <SectionEditor
                      section={section}
                      onChange={(content) => updateSection(section.id, content)}
                    />
                  </section>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview pane */}
        <div
          className={`${mobileView === 'preview' ? 'block' : 'hidden'} h-full w-full p-4 lg:block lg:w-1/2`}
        >
          <CVPreview cv={cv} />
        </div>
      </div>

      {shareOpen && <SharePanel cvId={initialCV.id} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
