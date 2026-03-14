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
  locationCountry?: string;
  locationRegion?: string;
  locationCity?: string;
  positions?: { title?: string; companyName?: string; current?: boolean }[];
  trustStats?: { key: string; label: string; value: number }[];
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
  const subtitle =
    profile.headline ??
    (current ? [current.title, current.companyName].filter(Boolean).join(' at ') : '');
  const location = [profile.locationCity, profile.locationRegion, profile.locationCountry]
    .filter(Boolean)
    .join(', ');
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          <div style={{ display: 'flex', fontSize: 26, color: '#d4d4d4', marginTop: 28 }}>
            {subtitle
              ? subtitle.length > 120
                ? subtitle.slice(0, 120) + '\u2026'
                : subtitle
              : '\u00A0'}
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#a3a3a3', marginTop: 8 }}>
            {location || '\u00A0'}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: '#a3a3a3' }}>sifa.id</div>
      </div>
    ),
    { ...size },
  );
}
