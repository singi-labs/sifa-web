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
      searchParams: Promise.resolve({}),
    });
    render(page as React.ReactElement);

    expect(screen.getByTestId('identity-card')).toBeDefined();
    expect(identityCardProps[0]?.variant).toBe('embed');
  });

  it('passes theme as data attribute', async () => {
    mockFetchProfile.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'alice.bsky.social',
      claimed: true,
    });

    const page = await EmbedPage({
      params: Promise.resolve({ handleOrDid: 'alice.bsky.social' }),
      searchParams: Promise.resolve({ theme: 'dark' }),
    });
    const { container } = render(page as React.ReactElement);

    expect(container.querySelector('[data-theme="dark"]')).not.toBeNull();
  });

  it('defaults theme to auto', async () => {
    mockFetchProfile.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'alice.bsky.social',
      claimed: true,
    });

    const page = await EmbedPage({
      params: Promise.resolve({ handleOrDid: 'alice.bsky.social' }),
      searchParams: Promise.resolve({}),
    });
    const { container } = render(page as React.ReactElement);

    expect(container.querySelector('[data-theme="auto"]')).not.toBeNull();
  });

  it('calls fetchProfile with the handleOrDid param', async () => {
    mockFetchProfile.mockResolvedValue({
      did: 'did:plc:test',
      handle: 'bob.bsky.social',
      claimed: true,
    });

    await EmbedPage({
      params: Promise.resolve({ handleOrDid: 'bob.bsky.social' }),
      searchParams: Promise.resolve({}),
    });

    expect(mockFetchProfile).toHaveBeenCalledWith('bob.bsky.social');
  });

  it('calls notFound when profile is null', async () => {
    mockFetchProfile.mockResolvedValue(null);

    await expect(
      EmbedPage({
        params: Promise.resolve({ handleOrDid: 'nonexistent' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow();
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
      searchParams: Promise.resolve({}),
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
