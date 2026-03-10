import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/theme-toggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
  }),
}));

describe('ThemeToggle', () => {
  it('renders with correct aria-label for light mode', () => {
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeDefined();
  });

  it('calls setTheme on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('accepts className prop', () => {
    render(<ThemeToggle className="my-custom-class" />);

    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(button.className).toContain('my-custom-class');
  });
});
