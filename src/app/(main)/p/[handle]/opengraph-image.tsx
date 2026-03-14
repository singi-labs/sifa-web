import { ImageResponse } from 'next/og';

export const alt = 'Profile on Sifa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 43200; // 12 hours

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface ProfileData {
  handle: string;
  displayName?: string;
  avatar?: string;
  headline?: string;
  website?: string;
  locationCountry?: string;
  locationRegion?: string;
  locationCity?: string;
  positions?: { title?: string; companyName?: string; current?: boolean }[];
}

async function fetchAvatarDataUrl(url: string): Promise<string | null> {
  try {
    // Bluesky CDN serves WebP by default which Satori doesn't support.
    // Appending @jpeg forces JPEG format.
    const jpegUrl = url.includes('cdn.bsky.app') && !url.includes('@') ? url + '@jpeg' : url;
    const res = await fetch(jpegUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? 'image/jpeg';
    if (ct.includes('webp')) return null; // Satori can't render WebP
    const buffer = await res.arrayBuffer();
    return `data:${ct};base64,${Buffer.from(buffer).toString('base64')}`;
  } catch {
    return null;
  }
}

function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: '#fafafa',
          fontSize: 36,
        }}
      >
        Profile not found
      </div>
    ),
    { ...size },
  );
}

export default async function ProfileOgImage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  let profile: ProfileData;
  try {
    const res = await fetch(`${API_URL}/api/profile/${encodeURIComponent(handle)}`, {
      next: { revalidate: 43200 },
    });
    if (!res.ok) return fallbackImage();
    profile = await res.json();
  } catch {
    return fallbackImage();
  }

  const displayName = profile.displayName ?? profile.handle;
  const current = profile.positions?.find((p) => p.current);
  const roleAtCompany =
    current && current.title && current.companyName
      ? `${current.title} at ${current.companyName}`
      : null;
  const headline = profile.headline ?? '';
  const location = [profile.locationCity, profile.locationRegion, profile.locationCountry]
    .filter(Boolean)
    .join(', ');
  const website = profile.website
    ? profile.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
    : null;
  const avatarDataUrl = profile.avatar ? await fetchAvatarDataUrl(profile.avatar) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#1a1a1a',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
          padding: 60,
        }}
      >
        {/* Top section: profile info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Avatar + name/handle */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {avatarDataUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- rendered to PNG by Satori
              <img
                src={avatarDataUrl}
                width={96}
                height={96}
                style={{ borderRadius: 48, marginRight: 28 }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#a3a3a3',
                  marginRight: 28,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 44, fontWeight: 700 }}>
                {displayName.length > 30 ? displayName.slice(0, 30) + '\u2026' : displayName}
              </div>
              <div style={{ display: 'flex', fontSize: 22, color: '#a3a3a3', marginTop: 4 }}>
                {'@' + profile.handle}
              </div>
            </div>
          </div>
          {/* Role at Company */}
          {roleAtCompany && (
            <div style={{ display: 'flex', fontSize: 24, color: '#d4d4d4', marginTop: 24 }}>
              {roleAtCompany.length > 80 ? roleAtCompany.slice(0, 80) + '\u2026' : roleAtCompany}
            </div>
          )}
          {/* Headline */}
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#a3a3a3',
              marginTop: roleAtCompany ? 8 : 24,
            }}
          >
            {headline
              ? headline.length > 120
                ? headline.slice(0, 120) + '\u2026'
                : headline
              : '\u00A0'}
          </div>
          {/* Location + Website */}
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: 8 }}>
            {location && (
              <div style={{ display: 'flex', fontSize: 20, color: '#737373', marginRight: 24 }}>
                {location}
              </div>
            )}
            {website && (
              <div style={{ display: 'flex', fontSize: 20, color: '#737373' }}>{website}</div>
            )}
          </div>
        </div>

        {/* Bottom section: CTA with Sifa branding */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {/* Sifa brand mark */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#4385BE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
                color: '#ffffff',
                marginRight: 14,
              }}
            >
              S
            </div>
            <div style={{ display: 'flex', fontSize: 22, color: '#a3a3a3' }}>
              Visit my profile on
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 600,
                color: '#d4d4d4',
                marginLeft: 6,
              }}
            >
              sifa.id
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
