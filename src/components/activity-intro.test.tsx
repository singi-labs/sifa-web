import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

import { ActivityIntro } from './activity-intro';

describe('ActivityIntro', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('shows intro when not dismissed', () => {
    render(<ActivityIntro />);
    expect(screen.getByText(/AT Protocol ecosystem/)).toBeDefined();
  });

  it('hides after dismiss click', async () => {
    render(<ActivityIntro />);
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    // The component dispatches a storage event to trigger re-render
    act(() => {
      window.dispatchEvent(new Event('storage'));
    });
    expect(screen.queryByText(/AT Protocol ecosystem/)).toBeNull();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sifa-activity-intro-dismissed', 'true');
  });

  it('stays hidden when previously dismissed', () => {
    mockLocalStorage.setItem('sifa-activity-intro-dismissed', 'true');
    render(<ActivityIntro />);
    expect(screen.queryByText(/AT Protocol ecosystem/)).toBeNull();
  });
});
