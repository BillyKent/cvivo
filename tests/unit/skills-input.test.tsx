import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillsEditor } from '@/components/cv-editor/editors/SkillsEditor';
import type { SkillsContent } from '@/types/cv';

function Harness() {
  const [content, setContent] = useState<SkillsContent>({ groups: [] });
  return <SkillsEditor content={content} onChange={setContent} />;
}

describe('SkillsEditor chip input (FR-005/FR-006)', () => {
  it('keeps spaces in a multi-word skill committed with Enter', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Add a skill');
    await user.type(input, 'Technical writing');
    await user.keyboard('{Enter}');
    expect(screen.getByText('Technical writing')).toBeInTheDocument();
  });

  it('commits a skill when a comma is typed', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Add a skill');
    await user.type(input, 'Go,');
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('ignores duplicates (case-insensitive) and blank entries', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Add a skill');
    await user.type(input, 'Go,go,   ,');
    expect(screen.getAllByText(/^Go$/i)).toHaveLength(1);
  });

  it('removes a skill via its remove button', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Add a skill');
    await user.type(input, 'TypeScript{Enter}');
    await user.click(screen.getByRole('button', { name: 'Remove TypeScript' }));
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });
});
