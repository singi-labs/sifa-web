import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { UserMenu } from '@/components/user-menu';
import * as authLib from '@/lib/auth';

// Override the mock for specific tests
const mockGetSession = vi.mocked(authLib.getSession);

function TestAuthConsumer() {
  const { session, isLoading } = useAuth();
  if (isLoading) return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;
  return <p>Signed in as {session.handle}</p>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  it('provides null session when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ status: 'unauthenticated' });
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Not signed in')).toBeDefined();
    });
  });

  it('provides session when authenticated', async () => {
    mockGetSession.mockResolvedValue({
      status: 'authenticated',
      session: {
        did: 'did:plc:test',
        handle: 'alice.bsky.social',
      },
    });
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Signed in as alice.bsky.social')).toBeDefined();
    });
  });
});

describe('UserMenu', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  it('shows sign in link when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ status: 'unauthenticated' });
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Sign in / Register')).toBeDefined();
    });
  });

  it('shows user avatar button when authenticated', async () => {
    mockGetSession.mockResolvedValue({
      status: 'authenticated',
      session: {
        did: 'did:plc:test',
        handle: 'alice.bsky.social',
        displayName: 'Alice',
      },
    });
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'User menu' })).toBeDefined();
    });
  });

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup();
    mockGetSession.mockResolvedValue({
      status: 'authenticated',
      session: {
        did: 'did:plc:test',
        handle: 'alice.bsky.social',
        displayName: 'Alice',
      },
    });
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'User menu' })).toBeDefined();
    });
    await user.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.getByRole('menu')).toBeDefined();
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Sign out')).toBeDefined();
  });
});
