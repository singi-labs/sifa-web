import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SectionOverflow } from '../section-overflow';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === 'showMore') return `Show ${params?.count} more`;
    if (key === 'showLess') return 'Show less';
    return key;
  },
}));

function makeItems(count: number): React.ReactNode[] {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} data-testid={`item-${i}`}>
      Item {i}
    </div>
  ));
}

describe('SectionOverflow', () => {
  it('renders all items when count <= maxVisible, no button present', () => {
    render(<SectionOverflow maxVisible={3}>{makeItems(3)}</SectionOverflow>);

    expect(screen.getByTestId('item-0')).toBeDefined();
    expect(screen.getByTestId('item-1')).toBeDefined();
    expect(screen.getByTestId('item-2')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders overflow items in DOM but hidden when count > maxVisible', () => {
    render(<SectionOverflow maxVisible={2}>{makeItems(5)}</SectionOverflow>);

    // Visible items
    expect(screen.getByTestId('item-0')).toBeDefined();
    expect(screen.getByTestId('item-1')).toBeDefined();

    // Overflow items are in the DOM
    expect(screen.getByTestId('item-2')).toBeDefined();
    expect(screen.getByTestId('item-3')).toBeDefined();
    expect(screen.getByTestId('item-4')).toBeDefined();

    // Overflow container uses grid-rows-[0fr] with overflow-hidden when collapsed
    const overflowContainer = screen.getByTestId('item-2').closest('[class*="overflow-hidden"]');
    expect(overflowContainer).not.toBeNull();

    const gridWrapper = overflowContainer?.parentElement;
    expect(gridWrapper?.className).toContain('grid-rows-[0fr]');
  });

  it('shows disclosure button with correct aria-expanded and text when collapsed', () => {
    render(<SectionOverflow maxVisible={2}>{makeItems(5)}</SectionOverflow>);

    const button = screen.getByRole('button', { name: /show 3 more/i });
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBeTruthy();
  });

  it('expands on click: all items visible, aria-expanded true, button text changes', async () => {
    const user = userEvent.setup();
    render(<SectionOverflow maxVisible={2}>{makeItems(5)}</SectionOverflow>);

    const button = screen.getByRole('button', { name: /show 3 more/i });
    await user.click(button);

    // Button text changes to "Show less"
    const expandedButton = screen.getByRole('button', { name: /show less/i });
    expect(expandedButton).toBeDefined();
    expect(expandedButton.getAttribute('aria-expanded')).toBe('true');

    // Overflow container now has grid-rows-[1fr]
    const overflowContainer = screen.getByTestId('item-2').closest('[class*="overflow-hidden"]');
    const gridWrapper = overflowContainer?.parentElement;
    expect(gridWrapper?.className).toContain('grid-rows-[1fr]');
  });

  it('collapses again on second click', async () => {
    const user = userEvent.setup();
    render(<SectionOverflow maxVisible={2}>{makeItems(5)}</SectionOverflow>);

    const button = screen.getByRole('button', { name: /show 3 more/i });
    await user.click(button);

    const collapseButton = screen.getByRole('button', { name: /show less/i });
    await user.click(collapseButton);

    // Back to collapsed state
    const collapsedButton = screen.getByRole('button', { name: /show 3 more/i });
    expect(collapsedButton.getAttribute('aria-expanded')).toBe('false');

    const overflowContainer = screen.getByTestId('item-2').closest('[class*="overflow-hidden"]');
    const gridWrapper = overflowContainer?.parentElement;
    expect(gridWrapper?.className).toContain('grid-rows-[0fr]');
  });

  it('shows all items and no button when disableOverflow is true', () => {
    render(
      <SectionOverflow maxVisible={2} disableOverflow>
        {makeItems(5)}
      </SectionOverflow>,
    );

    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`item-${i}`)).toBeDefined();
    }

    expect(screen.queryByRole('button')).toBeNull();
  });
});
