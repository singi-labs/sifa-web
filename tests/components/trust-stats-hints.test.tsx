import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrustStatsHints } from '@/components/trust-stats-hints';

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

beforeEach(() => {
  mockLocalStorage.clear();
  vi.clearAllMocks();
});

describe('TrustStatsHints', () => {
  it('renders hints for own profile with zero stats', () => {
    render(<TrustStatsHints isOwnProfile did="did:plc:test" trustStats={[]} />);
    expect(screen.getByText('Grow your track record')).toBeDefined();
  });

  it('hides for non-owners', () => {
    const { container } = render(<TrustStatsHints did="did:plc:test" trustStats={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('hides when all stats above zero', () => {
    const { container } = render(
      <TrustStatsHints
        isOwnProfile
        did="did:plc:test"
        trustStats={[
          { key: 'connections', label: 'Connections', value: 5 },
          { key: 'endorsements', label: 'Endorsements', value: 3 },
          { key: 'reactions', label: 'Reactions', value: 1 },
        ]}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('can be dismissed', async () => {
    const user = userEvent.setup();
    render(<TrustStatsHints isOwnProfile did="did:plc:test" trustStats={[]} />);
    expect(screen.getByText('Grow your track record')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Dismiss hints' }));
    expect(screen.queryByText('Grow your track record')).toBeNull();
  });

  it('persists dismissal in localStorage', async () => {
    const user = userEvent.setup();
    render(<TrustStatsHints isOwnProfile did="did:plc:test123" trustStats={[]} />);
    await user.click(screen.getByRole('button', { name: 'Dismiss hints' }));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'sifa:hints-dismissed:did:plc:test123',
      'true',
    );
  });

  it('stays hidden when previously dismissed via localStorage', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('true');
    const { container } = render(
      <TrustStatsHints isOwnProfile did="did:plc:test123" trustStats={[]} />,
    );
    expect(container.innerHTML).toBe('');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
      'sifa:hints-dismissed:did:plc:test123',
    );
  });

  it('hides when account age exceeds 30 days', () => {
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const { container } = render(
      <TrustStatsHints
        isOwnProfile
        did="did:plc:test"
        createdAt={thirtyOneDaysAgo}
        trustStats={[]}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows hints when account age is under 30 days', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    render(
      <TrustStatsHints
        isOwnProfile
        did="did:plc:test"
        createdAt={tenDaysAgo}
        trustStats={[]}
      />,
    );
    expect(screen.getByText('Grow your track record')).toBeDefined();
  });

  it('shows hints when createdAt is not provided', () => {
    render(<TrustStatsHints isOwnProfile did="did:plc:test" trustStats={[]} />);
    expect(screen.getByText('Grow your track record')).toBeDefined();
  });
});
