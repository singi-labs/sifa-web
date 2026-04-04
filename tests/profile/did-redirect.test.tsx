import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

const { permanentRedirectMock, fetchProfileMock } = vi.hoisted(() => ({
  permanentRedirectMock: vi.fn(),
  fetchProfileMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  permanentRedirect: permanentRedirectMock,
  notFound: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  fetchProfile: fetchProfileMock,
}));

vi.mock('@/lib/jsonld', () => ({
  buildProfilePageJsonLd: vi.fn(() => ({})),
  buildMetaDescription: vi.fn(() => ''),
}));
vi.mock('@/lib/sanitize', () => ({ sanitize: vi.fn((s: string) => s) }));
vi.mock('@/components/identity-card', () => ({ IdentityCard: () => null }));
vi.mock('@/components/data-transparency-card', () => ({ DataTransparencyCard: () => null }));
vi.mock('@/components/profile-edit-provider', () => ({
  ProfileEditProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/profile-body', () => ({ ProfileBody: () => null }));
vi.mock('@/components/unclaimed-banner', () => ({ UnclaimedBanner: () => null }));
vi.mock('@/components/deleted-account-modal', () => ({ DeletedAccountModal: () => null }));
vi.mock('@/components/connect-modal', () => ({ ConnectModal: () => null }));
vi.mock('@/components/profile-note', () => ({ ProfileNote: () => null }));

import ProfilePage from '@/app/(main)/p/[handle]/page';

const makeParams = (handle: string) => Promise.resolve({ handle }) as Promise<{ handle: string }>;
const makeSearchParams = () =>
  Promise.resolve({}) as Promise<{ deleted?: string; connect?: string }>;

describe('Profile page DID → handle redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /p/:handle when a DID is passed and profile has a real handle', async () => {
    fetchProfileMock.mockResolvedValue({
      did: 'did:plc:abc123',
      handle: 'alice.bsky.social',
      claimed: true,
      isOwnProfile: false,
      positions: [],
      skills: [],
    });

    // permanentRedirect throws in Next.js; simulate that so the render short-circuits
    permanentRedirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    await expect(
      ProfilePage({ params: makeParams('did:plc:abc123'), searchParams: makeSearchParams() }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(permanentRedirectMock).toHaveBeenCalledWith('/p/alice.bsky.social');
  });

  it('does NOT redirect when a regular handle is passed', async () => {
    fetchProfileMock.mockResolvedValue({
      did: 'did:plc:abc123',
      handle: 'alice.bsky.social',
      claimed: true,
      isOwnProfile: false,
      positions: [],
      skills: [],
    });

    await ProfilePage({
      params: makeParams('alice.bsky.social'),
      searchParams: makeSearchParams(),
    });

    expect(permanentRedirectMock).not.toHaveBeenCalled();
  });

  it('does NOT redirect when DID handle resolves to another DID (no real handle)', async () => {
    fetchProfileMock.mockResolvedValue({
      did: 'did:plc:abc123',
      handle: 'did:plc:abc123', // API returns DID as handle — no real handle yet
      claimed: false,
      isOwnProfile: false,
      positions: [],
      skills: [],
    });

    await ProfilePage({ params: makeParams('did:plc:abc123'), searchParams: makeSearchParams() });

    expect(permanentRedirectMock).not.toHaveBeenCalled();
  });
});
