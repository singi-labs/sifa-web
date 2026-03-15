import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SkillEditDialog } from '@/components/skill-edit-dialog';
import { SKILL_CATEGORIES } from '@/lib/skill-categories';

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
  { canonicalName: 'TypeScript', slug: 'typescript', category: 'technical' },
  { canonicalName: 'Python', slug: 'python', category: 'technical' },
];

function renderDialog(props: Partial<React.ComponentProps<typeof SkillEditDialog>> = {}) {
  const defaultProps = {
    title: 'Add Skill',
    onSave: vi.fn().mockResolvedValue({ success: true }),
    onCancel: vi.fn(),
    ...props,
  };
  return { ...render(<SkillEditDialog {...defaultProps} />), ...defaultProps };
}

describe('SkillEditDialog', () => {
  describe('category dropdown', () => {
    it('shows exactly 6 category options plus None', () => {
      renderDialog();
      const select = screen.getByLabelText('Category');
      const options = select.querySelectorAll('option');
      // 6 knownValues + 1 "None" option
      expect(options.length).toBe(7);
      expect(options[0]?.textContent).toBe('None');
      expect(options[0]?.getAttribute('value')).toBe('');
    });

    it('renders all 6 knownValues from SKILL_CATEGORIES', () => {
      renderDialog();
      const select = screen.getByLabelText('Category');
      const options = Array.from(select.querySelectorAll('option'));
      const values = options.map((opt) => opt.getAttribute('value')).filter(Boolean);
      const expected = SKILL_CATEGORIES.map((c) => c.value);
      expect(values).toEqual(expected);
    });

    it('allows user to select a category', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderDialog();
      const select = screen.getByLabelText('Category');
      await user.selectOptions(select, 'business');
      expect((select as HTMLSelectElement).value).toBe('business');
    });

    it('has proper label association for accessibility', () => {
      renderDialog();
      const select = screen.getByLabelText('Category');
      expect(select.tagName).toBe('SELECT');
      expect(select.id).toBe('edit-category');
    });

    it('passes vitest-axe accessibility checks', async () => {
      const { container } = renderDialog();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('auto-fill from typeahead', () => {
    it('auto-fills category when selecting a skill from typeahead', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ skills: mockSuggestions }),
      });

      renderDialog();
      const input = screen.getByLabelText('Skills') as HTMLInputElement;
      await user.type(input, 'Typ');

      await vi.advanceTimersByTimeAsync(350);
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeDefined();
      });

      // Click the first option in the listbox (TypeScript)
      const options = screen.getAllByRole('option');
      await user.click(options[0]!);

      // Category dropdown should now show 'technical'
      const select = screen.getByLabelText('Category') as HTMLSelectElement;
      expect(select.value).toBe('technical');
    });

    it('allows user to override auto-suggested category', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ skills: mockSuggestions }),
      });

      renderDialog();
      const input = screen.getByLabelText('Skills') as HTMLInputElement;
      await user.type(input, 'Typ');

      await vi.advanceTimersByTimeAsync(350);
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeDefined();
      });

      // Select TypeScript which auto-fills 'technical'
      const options = screen.getAllByRole('option');
      await user.click(options[0]!);
      const select = screen.getByLabelText('Category') as HTMLSelectElement;
      expect(select.value).toBe('technical');

      // Override to 'business'
      await user.selectOptions(select, 'business');
      expect(select.value).toBe('business');
    });
  });

  describe('form submission', () => {
    it('includes category in save payload', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSave = vi.fn().mockResolvedValue({ success: true });

      renderDialog({ onSave, initialSkillName: 'React' });
      const select = screen.getByLabelText('Category');
      await user.selectOptions(select, 'creative');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith({
        skillName: 'React',
        category: 'creative',
      });
    });

    it('pre-fills category when editing existing skill', () => {
      renderDialog({ initialSkillName: 'TypeScript', initialCategory: 'technical' });
      const select = screen.getByLabelText('Category') as HTMLSelectElement;
      expect(select.value).toBe('technical');
    });
  });
});
