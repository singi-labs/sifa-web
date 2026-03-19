import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlateMarkdownEditor } from '@/components/plate-editor/plate-markdown-editor';

describe('PlateMarkdownEditor', () => {
  it('renders with toolbar buttons', () => {
    render(
      <PlateMarkdownEditor
        id="test-editor"
        value=""
        onChange={vi.fn()}
        placeholder="Write something..."
      />,
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Link' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Bullet list' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Numbered list' })).toBeDefined();
  });

  it('toolbar has correct ARIA attributes', () => {
    render(<PlateMarkdownEditor id="test-editor" value="" onChange={vi.fn()} />);

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar.getAttribute('aria-label')).toBe('Text formatting');
  });

  it('renders with aria-label when provided', () => {
    render(
      <PlateMarkdownEditor
        id="test-editor"
        value=""
        onChange={vi.fn()}
        aria-label="About section"
      />,
    );

    expect(screen.getByRole('textbox', { name: 'About section' })).toBeDefined();
  });

  it('accepts and renders without errors for empty string value', () => {
    const { container } = render(
      <PlateMarkdownEditor id="test-editor" value="" onChange={vi.fn()} />,
    );

    expect(container.querySelector('#test-editor')).not.toBeNull();
  });
});
