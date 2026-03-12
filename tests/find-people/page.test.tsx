import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the API module
vi.mock('@/lib/api', () => ({
  fetchProfile: vi.fn().mockResolvedValue(null),
  searchProfiles: vi.fn().mockResolvedValue([]),
  fetchSuggestions: vi.fn().mockResolvedValue({
    onSifa: [
      {
        did: 'did:plc:1',
        handle: 'alice.bsky.social',
        displayName: 'Alice',
        source: 'bluesky',
        dismissed: false,
      },
    ],
    notOnSifa: [
      {
        did: 'did:plc:2',
        handle: 'bob.bsky.social',
        displayName: 'Bob',
        source: 'bluesky',
        dismissed: false,
      },
    ],
  }),
  fetchSuggestionCount: vi.fn().mockResolvedValue(3),
  dismissSuggestion: vi.fn(),
  undismissSuggestion: vi.fn(),
  createInvite: vi.fn().mockResolvedValue('https://sifa.id/claim?ref=did:plc:2'),
}));

// Mock auth
vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    session: { did: 'did:plc:viewer', handle: 'viewer.bsky.social' },
    isLoading: false,
  }),
}));

// Mock useRequireAuth
vi.mock('@/hooks/use-require-auth', () => ({
  useRequireAuth: () => ({
    requireAuth: (fn: () => void) => fn(),
    isAuthenticated: true,
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import FindPeoplePage from '@/app/(main)/find-people/page';

// Ensure localStorage is available in test env
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('Find People page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', async () => {
    render(<FindPeoplePage />);
    expect(screen.getByText(/find people/i)).toBeDefined();
  });

  it('renders suggestions after loading', async () => {
    render(<FindPeoplePage />);
    expect(await screen.findByText('Alice')).toBeDefined();
  });
});
