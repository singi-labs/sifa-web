import { ImageResponse } from 'next/og';

export const alt = 'Profile on Sifa ID';
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
  const avatarDataUrl = profile.avatar ? await fetchAvatarDataUrl(profile.avatar) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1a1a1a',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top accent stripe */}
        <div style={{ display: 'flex', width: '100%', height: 6, backgroundColor: '#4385BE' }} />

        {/* Main content: two-column layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            padding: '0 60px',
          }}
        >
          {/* Left column: avatar + brand */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 320,
              flexShrink: 0,
              paddingRight: 48,
            }}
          >
            {/* Avatar with brand ring */}
            {avatarDataUrl ? (
              <div
                style={{
                  display: 'flex',
                  width: 224,
                  height: 224,
                  borderRadius: 112,
                  border: '4px solid #4385BE',
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text -- rendered to PNG by Satori */}
                <img src={avatarDataUrl} width={216} height={216} style={{ borderRadius: 108 }} />
              </div>
            ) : (
              <div
                style={{
                  width: 224,
                  height: 224,
                  borderRadius: 112,
                  border: '4px solid #4385BE',
                  backgroundColor: '#2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                  fontWeight: 700,
                  color: '#b0b0b0',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Brand wordmark below avatar */}
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 600,
                color: '#4385BE',
                marginTop: 24,
                letterSpacing: 1,
              }}
            >
              sifa.id
            </div>
          </div>

          {/* Right column: text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flexGrow: 1,
              overflow: 'hidden',
              paddingTop: 20,
              paddingBottom: 20,
              paddingRight: 20,
            }}
          >
            {/* Display name */}
            <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: '#eeeeee' }}>
              {displayName.length > 26 ? displayName.slice(0, 26) + '\u2026' : displayName}
            </div>

            {/* Handle */}
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                color: '#a0a0a0',
                marginTop: 6,
              }}
            >
              {'@' + profile.handle}
            </div>

            {/* Accent separator line */}
            <div
              style={{
                display: 'flex',
                width: 80,
                height: 3,
                backgroundColor: '#4385BE',
                marginTop: 28,
                marginBottom: 28,
              }}
            />

            {/* Role at Company */}
            {roleAtCompany && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 30,
                  fontWeight: 600,
                  color: '#d4d4d4',
                }}
              >
                {roleAtCompany.length > 50 ? roleAtCompany.slice(0, 50) + '\u2026' : roleAtCompany}
              </div>
            )}

            {/* Headline */}
            {headline && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 26,
                  color: '#b0b0b0',
                  marginTop: roleAtCompany ? 12 : 0,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                }}
              >
                {headline.length > 90 ? headline.slice(0, 90) + '\u2026' : headline}
              </div>
            )}

            {/* CTA pill */}
            <div style={{ display: 'flex', marginTop: 32 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#4385BE',
                  borderRadius: 24,
                  padding: '10px 28px',
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                View profile
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
