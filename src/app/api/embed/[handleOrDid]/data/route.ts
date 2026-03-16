import { NextRequest, NextResponse } from 'next/server';
import { fetchProfile } from '@/lib/api';
import { sanitize } from '@/lib/sanitize';
import { detectPdsProvider } from '@/lib/pds-utils';
import type { LocationValue } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handleOrDid: string }> },
) {
  const { handleOrDid } = await params;
  const profile = await fetchProfile(handleOrDid);

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const location: LocationValue | null = profile.locationCountry
    ? {
        country: profile.locationCountry,
        countryCode: profile.countryCode ?? undefined,
        region: profile.locationRegion ?? undefined,
        city: profile.locationCity ?? undefined,
      }
    : null;

  const data = {
    did: profile.did,
    handle: sanitize(profile.handle),
    displayName: profile.displayName ? sanitize(profile.displayName) : null,
    avatar: profile.avatar ?? null,
    headline: profile.headline ? sanitize(profile.headline) : null,
    location,
    website: profile.website ?? null,
    openTo: profile.openTo ?? [],
    trustStats: profile.trustStats ?? [],
    verifiedAccounts: (profile.verifiedAccounts ?? []).map(
      (v: { platform: string; identifier: string }) => ({
        platform: v.platform,
        identifier: v.identifier,
      }),
    ),
    followersCount: profile.followersCount ?? 0,
    pdsProvider: detectPdsProvider(profile.handle),
    activeApps: profile.activeApps ?? [],
    claimed: profile.claimed,
    profileUrl: `https://sifa.id/p/${profile.handle}`,
  };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
