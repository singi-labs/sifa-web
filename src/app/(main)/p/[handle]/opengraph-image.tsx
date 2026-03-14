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
  countryCode?: string;
  trustStats?: { key: string; label: string; value: number }[];
  positions?: { title?: string; companyName?: string; current?: boolean }[];
}

function formatLocation(profile: ProfileData): string {
  const parts = [profile.locationCity, profile.locationRegion, profile.locationCountry].filter(
    Boolean,
  );
  return parts.join(', ');
}

function getCurrentRole(profile: ProfileData): string | null {
  const current = profile.positions?.find((p) => p.current);
  if (!current) return null;
  const parts = [current.title, current.companyName].filter(Boolean);
  return parts.length > 0 ? parts.join(' at ') : null;
}

export default async function ProfileOgImage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const res = await fetch(`${API_URL}/api/profile/${encodeURIComponent(handle)}`, {
    next: { revalidate: 43200 },
  });

  if (!res.ok) {
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
            fontFamily: 'system-ui, sans-serif',
            fontSize: 36,
          }}
        >
          Profile not found
        </div>
      ),
      { ...size },
    );
  }

  const profile: ProfileData = await res.json();

  const displayName = profile.displayName ?? profile.handle;
  const location = formatLocation(profile);
  const currentRole = getCurrentRole(profile);
  const trustStats = (profile.trustStats ?? []).slice(0, 3);

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
          padding: 60,
        }}
      >
        {/* Top section: avatar + identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* Avatar */}
          {profile.avatar ? (
            // eslint-disable-next-line jsx-a11y/alt-text -- rendered to PNG by Satori, not a browser DOM
            <img
              src={profile.avatar}
              width={96}
              height={96}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                backgroundColor: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                fontWeight: 700,
                color: '#a3a3a3',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name + handle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {displayName.length > 30 ? displayName.slice(0, 30) + '\u2026' : displayName}
            </div>
            <div style={{ fontSize: 22, color: '#a3a3a3' }}>@{profile.handle}</div>
          </div>
        </div>

        {/* Headline */}
        {profile.headline && (
          <div
            style={{
              fontSize: 26,
              color: '#d4d4d4',
              marginTop: 28,
              lineHeight: 1.4,
            }}
          >
            {profile.headline.length > 120
              ? profile.headline.slice(0, 120) + '\u2026'
              : profile.headline}
          </div>
        )}

        {/* Current role (if no headline, show role instead) */}
        {!profile.headline && currentRole && (
          <div
            style={{
              fontSize: 26,
              color: '#d4d4d4',
              marginTop: 28,
              lineHeight: 1.4,
            }}
          >
            {currentRole.length > 120 ? currentRole.slice(0, 120) + '\u2026' : currentRole}
          </div>
        )}

        {/* Location */}
        {location && (
          <div style={{ fontSize: 22, color: '#a3a3a3', marginTop: 12 }}>{location}</div>
        )}

        {/* Spacer */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* Bottom: trust stats + Sifa branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          {/* Trust stats */}
          {trustStats.length > 0 && (
            <div style={{ display: 'flex', gap: 40 }}>
              {trustStats.map((stat) => (
                <div
                  key={stat.key}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <div style={{ fontSize: 32, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ fontSize: 16, color: '#a3a3a3', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Sifa branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginLeft: 'auto',
            }}
          >
            <svg viewBox="0 0 256 256" width="32" height="32">
              <g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">
                <path
                  d="M128,71.5C159.183,71.5 184.5,96.817 184.5,128C184.5,159.183 159.183,184.5 128,184.5C96.817,184.5 71.5,159.183 71.5,128C71.5,96.817 96.817,71.5 128,71.5ZM128,104.5C115.03,104.5 104.5,115.03 104.5,128C104.5,140.97 115.03,151.5 128,151.5C140.97,151.5 151.5,140.97 151.5,128C151.5,115.03 140.97,104.5 128,104.5Z"
                  fill="#a3a3a3"
                />
              </g>
              <g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">
                <path
                  d="M174.866,194.259C182.45,189.218 192.7,191.282 197.741,198.866C202.782,206.45 200.718,216.7 193.134,221.741C175.432,233.507 150.846,240.5 128,240.5C66.284,240.5 15.5,189.716 15.5,128C15.5,66.284 66.284,15.5 128,15.5C189.716,15.5 240.5,66.284 240.5,128C240.5,160.538 225.46,184.5 196,184.5C166.54,184.5 151.5,160.538 151.5,128L151.5,88C151.5,78.893 158.893,71.5 168,71.5C177.107,71.5 184.5,78.893 184.5,88L184.5,128C184.5,134.408 185.237,140.363 187.279,145.164C188.851,148.858 191.536,151.5 196,151.5C200.464,151.5 203.149,148.858 204.721,145.164C206.763,140.363 207.5,134.408 207.5,128C207.5,84.388 171.612,48.5 128,48.5C84.388,48.5 48.5,84.388 48.5,128C48.5,171.612 84.388,207.5 128,207.5C144.415,207.5 162.148,202.713 174.866,194.259Z"
                  fill="#a3a3a3"
                />
              </g>
              <path
                d="M176,47.75 L208,79.75 L176,111.75 L144,79.75 Z"
                fill="none"
                stroke="#a3a3a3"
                strokeWidth="12"
              />
              <path
                d="M80,144 L112,176 L80,208 L48,176 Z"
                fill="none"
                stroke="#a3a3a3"
                strokeWidth="12"
              />
              <path d="M152,192 L176,160 L200,192" fill="none" stroke="#a3a3a3" strokeWidth="11" />
            </svg>
            <div style={{ fontSize: 24, color: '#a3a3a3', fontWeight: 600 }}>sifa.id</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
