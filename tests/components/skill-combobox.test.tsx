import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SkillCombobox } from '@/components/skill-combobox';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const mockSuggestions = [
  { canonicalName: 'TypeScript', slug: 'typescript', category: 'Technical' },
  { canonicalName: 'Type Theory', slug: 'type-theory', category: 'Academic' },
];

function renderCombobox(props: Partial<React.ComponentProps<typeof SkillCombobox>> = {}) {
  const defaultProps = {
    value: '',
    category: '',
    onChange: vi.fn(),
    id: 'test-skill',
    ...props,
  };
  return { ...render(<SkillCombobox {...defaultProps} />), onChange: defaultProps.onChange };
}

describe('SkillCombobox', () => {
  it('renders with combobox role and ARIA attributes', () => {
    renderCombobox();
    const input = screen.getByRole('combobox');
    expect(input).toBeDefined();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-controls')).toBe('test-skill-listbox');
  });

  it('passes vitest-axe accessibility checks', async () => {
    const { container } = renderCombobox();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows suggestions after typing and debounce', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typ');

    // Wait for debounce and API call
    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Type Theory')).toBeDefined();
  });

  it('selects a suggestion and calls onChange', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    const { onChange } = renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typ');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    await user.click(screen.getByText('TypeScript'));
    expect(onChange).toHaveBeenCalledWith('TypeScript', 'Technical');
  });

  it('shows "Add as new skill" when no exact match', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typing');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    // Should show the "Add as new skill" option
    const options = screen.getAllByRole('option');
    const addNewOption = options[options.length - 1];
    expect(addNewOption?.textContent).toContain('Typing');
    expect(addNewOption?.textContent).toContain('as new skill');
  });

  it('does not show "Add as new skill" when exact match exists', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'TypeScript');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    const options = screen.getAllByRole('option');
    // Should not have an "Add as new" option
    for (const opt of options) {
      expect(opt.textContent).not.toContain('as new skill');
    }
  });

  it('navigates with keyboard arrows and selects with Enter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    const { onChange } = renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typ');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    // Arrow down to first option
    await user.keyboard('{ArrowDown}');
    const firstOption = screen.getByText('TypeScript').closest('[role="option"]');
    expect(firstOption?.getAttribute('aria-selected')).toBe('true');

    // Arrow down to second option
    await user.keyboard('{ArrowDown}');
    const secondOption = screen.getByText('Type Theory').closest('[role="option"]');
    expect(secondOption?.getAttribute('aria-selected')).toBe('true');

    // Arrow up back to first
    await user.keyboard('{ArrowUp}');
    expect(firstOption?.getAttribute('aria-selected')).toBe('true');

    // Enter to select
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('TypeScript', 'Technical');
  });

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typ');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { onChange } = renderCombobox({ value: 'TypeScript' });

    const clearButton = screen.getByLabelText('Clear skill search');
    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith('', '');
  });

  it('gracefully falls back when API returns error', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const { onChange } = renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typ');

    await vi.advanceTimersByTimeAsync(350);

    // Dropdown should not appear, but typing should still work (free text)
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    // onChange should have been called with the typed text
    expect(onChange).toHaveBeenCalledWith('T', '');
    expect(onChange).toHaveBeenCalledWith('Ty', '');
    expect(onChange).toHaveBeenCalledWith('Typ', '');
  });

  it('gracefully falls back when API throws network error', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockRejectedValue(new Error('Network failure'));

    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'React');

    await vi.advanceTimersByTimeAsync(350);

    // Should not crash, dropdown should not appear
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  it('does not search when query is less than 2 characters', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockClear();
    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'T');

    await vi.advanceTimersByTimeAsync(350);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows category labels in suggestion options', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typ');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    expect(screen.getByText('Technical')).toBeDefined();
    expect(screen.getByText('Academic')).toBeDefined();
  });

  it('sets aria-activedescendant on keyboard navigation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ skills: mockSuggestions }),
    });

    renderCombobox();
    const input = screen.getByRole('combobox');
    await user.type(input, 'Typ');

    await vi.advanceTimersByTimeAsync(350);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe('test-skill-listbox-option-0');

    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe('test-skill-listbox-option-1');
  });
});
