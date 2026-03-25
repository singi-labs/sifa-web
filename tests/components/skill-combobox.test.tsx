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

    // No API suggestions, but "Add as new" option still shows (free text fallback)
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(1);
      expect(options[0]?.textContent).toContain('as new skill');
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

    // Should not crash; "Add as new" option is the only fallback
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(1);
      expect(options[0]?.textContent).toContain('as new skill');
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

  describe('profile skills layer', () => {
    const profileSkills = [
      { rkey: 'sk1', name: 'TypeScript', category: 'Technical' },
      { rkey: 'sk2', name: 'React', category: 'Frontend' },
      { rkey: 'sk3', name: 'Python', category: 'Technical' },
    ];

    it('shows profile skills instantly without API call', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetch.mockClear();

      renderCombobox({ profileSkills });
      const input = screen.getByRole('combobox');
      await user.type(input, 'Ty');

      // Listbox should appear immediately (before debounce)
      expect(screen.getByRole('listbox')).toBeDefined();
      expect(screen.getByText('TypeScript')).toBeDefined();
      expect(screen.getByText('Your skills')).toBeDefined();

      // API should not have been called yet
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('shows "Your skills" header for profile matches', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ skills: [] }),
      });

      renderCombobox({ profileSkills });
      const input = screen.getByRole('combobox');
      await user.type(input, 'React');

      expect(screen.getByText('Your skills')).toBeDefined();
      expect(screen.getByText('React')).toBeDefined();
    });

    it('shows "Suggestions" header for API results', async () => {
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
        expect(screen.getByText('Suggestions')).toBeDefined();
      });
    });

    it('deduplicates API results against profile skills', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      // API returns TypeScript which is also in profile skills
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            skills: [
              { canonicalName: 'TypeScript', slug: 'typescript', category: 'Technical' },
              { canonicalName: 'Typesafe SQL', slug: 'typesafe-sql', category: 'Technical' },
            ],
          }),
      });

      renderCombobox({ profileSkills });
      const input = screen.getByRole('combobox');
      await user.type(input, 'Typ');

      await vi.advanceTimersByTimeAsync(350);
      await waitFor(() => {
        expect(screen.getByText('Suggestions')).toBeDefined();
      });

      // TypeScript should only appear once (in "Your skills"), not in "Suggestions"
      const options = screen.getAllByRole('option');
      const tsOptions = options.filter(
        (opt) => opt.querySelector('.font-medium')?.textContent === 'TypeScript',
      );
      expect(tsOptions.length).toBe(1);

      // Typesafe SQL should appear in suggestions (not a profile skill)
      expect(screen.getByText('Typesafe SQL')).toBeDefined();
    });

    it('shows profile matches even when API fails', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetch.mockRejectedValue(new Error('Network failure'));

      renderCombobox({ profileSkills });
      const input = screen.getByRole('combobox');
      await user.type(input, 'React');

      await vi.advanceTimersByTimeAsync(350);

      // Profile match should still be visible
      expect(screen.getByRole('listbox')).toBeDefined();
      expect(screen.getByText('React')).toBeDefined();
    });

    it('keyboard navigates across profile and API layers', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            skills: [
              { canonicalName: 'Typesafe SQL', slug: 'typesafe-sql', category: 'Technical' },
            ],
          }),
      });

      const { onChange } = renderCombobox({ profileSkills });
      const input = screen.getByRole('combobox');
      await user.type(input, 'Typ');

      await vi.advanceTimersByTimeAsync(350);
      await waitFor(() => {
        expect(screen.getByText('Suggestions')).toBeDefined();
      });

      // First option: profile TypeScript (index 0)
      await user.keyboard('{ArrowDown}');
      expect(input.getAttribute('aria-activedescendant')).toBe('test-skill-listbox-option-0');

      // Second option: API Typesafe SQL (index 1)
      await user.keyboard('{ArrowDown}');
      expect(input.getAttribute('aria-activedescendant')).toBe('test-skill-listbox-option-1');

      // Select API suggestion with Enter
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith('Typesafe SQL', 'Technical');
    });

    it('fires onSelect for profile skill selection', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSelect = vi.fn();

      renderCombobox({ profileSkills, onSelect });
      const input = screen.getByRole('combobox');
      await user.type(input, 'React');

      await user.click(screen.getByText('React'));
      expect(onSelect).toHaveBeenCalledWith('React', 'Frontend');
    });

    it('does not show profile matches below 2-character threshold', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      renderCombobox({ profileSkills });
      const input = screen.getByRole('combobox');
      await user.type(input, 'T');

      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });
});
