import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockFetchProfile = vi.fn();
vi.mock('@/lib/api', () => ({
  fetchProfile: (...args: unknown[]) => mockFetchProfile(...args),
}));

const identityCardProps: Record<string, unknown>[] = [];
vi.mock('@/components/identity-card', () => ({
  IdentityCard: (props: Record<string, unknown>) => {
    identityCardProps.push(props);
    return <div data-testid="identity-card" data-variant={props.variant} />;
  },
}));

import EmbedPage from '@/app/(embed)/embed/[handleOrDid]/page';

describe('EmbedPage', () => {
  beforeEach(() => {
    mockFetchProfile.mockReset();
    identityCardProps.length = 0;
  });

  it('renders IdentityCard with embed variant', async () => {
    mockFetchProfile.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'alice.bsky.social',
      displayName: 'Alice',
      claimed: true,
      followersCount: 0,
      followingCount: 0,
      connectionsCount: 0,
      positions: [],
      education: [],
      skills: [],
    });

    const page = await EmbedPage({
      params: Promise.resolve({ handleOrDid: 'alice.bsky.social' }),
    });
    render(page as React.ReactElement);

    expect(screen.getByTestId('identity-card')).toBeDefined();
    expect(identityCardProps[0]?.variant).toBe('embed');
  });

  it('calls fetchProfile with the handleOrDid param', async () => {
    mockFetchProfile.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'bob.bsky.social',
      claimed: true,
    });

    await EmbedPage({
      params: Promise.resolve({ handleOrDid: 'bob.bsky.social' }),
    });

    expect(mockFetchProfile).toHaveBeenCalledWith('bob.bsky.social');
  });

  it('renders inline not-found message when profile is null', async () => {
    mockFetchProfile.mockResolvedValue(null);

    const page = await EmbedPage({
      params: Promise.resolve({ handleOrDid: 'nonexistent' }),
    });
    render(page as React.ReactElement);

    expect(screen.getByText('nonexistent')).toBeDefined();
    expect(screen.getByText(/No profile found for/)).toBeDefined();
    expect(screen.queryByTestId('identity-card')).toBeNull();
  });

  it('builds location from city, region, country fields', async () => {
    mockFetchProfile.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'alice.bsky.social',
      claimed: true,
      locationCity: 'Amsterdam',
      locationRegion: 'North Holland',
      locationCountry: 'Netherlands',
    });

    const page = await EmbedPage({
      params: Promise.resolve({ handleOrDid: 'alice.bsky.social' }),
    });
    render(page as React.ReactElement);

    expect(identityCardProps[0]?.location).toEqual({
      country: 'Netherlands',
      countryCode: undefined,
      region: 'North Holland',
      city: 'Amsterdam',
    });
  });
});
