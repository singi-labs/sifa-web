import { NextRequest, NextResponse } from 'next/server';
import { fetchProfile } from '@/lib/api';
import { sanitize } from '@/lib/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handleOrDid: string }> },
) {
  const { handleOrDid } = await params;
  const { searchParams } = request.nextUrl;
  const theme = searchParams.get('theme') ?? 'auto';
  const compact = searchParams.get('compact') === 'true';

  const profile = await fetchProfile(handleOrDid);

  if (!profile) {
    return new NextResponse(renderErrorHtml(), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const name = sanitize(profile.displayName ?? profile.handle);
  const handle = sanitize(profile.handle);
  const headline = profile.headline ? sanitize(profile.headline) : null;
  const avatar = profile.avatar ?? null;
  const location = [profile.locationCity, profile.locationRegion, profile.locationCountry]
    .filter(Boolean)
    .join(', ');
  const profileUrl = `https://sifa.id/p/${handle}`;

  const html = compact
    ? renderCompactHtml(name, handle, headline, avatar, profileUrl, theme)
    : renderFullHtml(name, handle, headline, avatar, location, profileUrl, theme);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Frame-Options': 'ALLOWALL',
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getThemeStyles(theme: string): string {
  if (theme === 'dark') {
    return '--bg:#1a1a2e;--card:#16213e;--text:#eee;--muted:#888;--border:#333;--primary:#6366f1;';
  }
  if (theme === 'light') {
    return '--bg:#fff;--card:#fff;--text:#111;--muted:#666;--border:#e5e5e5;--primary:#6366f1;';
  }
  return '--bg:#fff;--card:#fff;--text:#111;--muted:#666;--border:#e5e5e5;--primary:#6366f1;';
}

function renderFullHtml(
  name: string,
  handle: string,
  headline: string | null,
  avatar: string | null,
  location: string,
  profileUrl: string,
  theme: string,
): string {
  const styles = getThemeStyles(theme);
  const avatarHtml = avatar
    ? `<img src="${escapeHtml(avatar)}" alt="" width="56" height="56" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`
    : `<div style="width:56px;height:56px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;color:var(--muted)">${escapeHtml(name.charAt(0).toUpperCase())}</div>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}:root{${styles}}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text)}
${theme === 'auto' ? '@media(prefers-color-scheme:dark){:root{--bg:#1a1a2e;--card:#16213e;--text:#eee;--muted:#888;--border:#333;--primary:#6366f1}}' : ''}
a{color:inherit;text-decoration:none}.card{max-width:350px;border:1px solid var(--border);border-radius:12px;padding:20px;background:var(--card)}.header{display:flex;align-items:center;gap:12px}.name{font-size:16px;font-weight:600}.handle{font-size:14px;color:var(--muted)}.headline{margin-top:12px;font-size:14px}.location{margin-top:4px;font-size:12px;color:var(--muted)}.footer{margin-top:16px;padding-top:12px;border-top:1px solid var(--border)}.cta{font-size:12px;font-weight:500;color:var(--primary)}.cta:hover{text-decoration:underline}</style>
</head><body><div class="card">
<a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener" class="header">${avatarHtml}<div><div class="name">${escapeHtml(name)}</div><div class="handle">@${escapeHtml(handle)}</div></div></a>
${headline ? `<div class="headline">${escapeHtml(headline)}</div>` : ''}
${location ? `<div class="location">${escapeHtml(location)}</div>` : ''}
<div class="footer"><a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener" class="cta">View full profile on Sifa</a></div>
</div></body></html>`;
}

function renderCompactHtml(
  name: string,
  handle: string,
  headline: string | null,
  avatar: string | null,
  profileUrl: string,
  theme: string,
): string {
  const styles = getThemeStyles(theme);
  const avatarHtml = avatar
    ? `<img src="${escapeHtml(avatar)}" alt="" width="40" height="40" style="width:40px;height:40px;border-radius:50%;object-fit:cover"/>`
    : `<div style="width:40px;height:40px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:var(--muted)">${escapeHtml(name.charAt(0).toUpperCase())}</div>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}:root{${styles}}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text)}
${theme === 'auto' ? '@media(prefers-color-scheme:dark){:root{--bg:#1a1a2e;--card:#16213e;--text:#eee;--muted:#888;--border:#333;--primary:#6366f1}}' : ''}
a{color:inherit;text-decoration:none}.row{display:flex;align-items:center;gap:12px;border:1px solid var(--border);border-radius:8px;padding:12px;background:var(--card)}.row:hover{background:var(--border)}.name{font-size:14px;font-weight:600}.headline{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style>
</head><body><a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener" class="row">${avatarHtml}<div style="min-width:0"><div class="name">${escapeHtml(name)}</div>${headline ? `<div class="headline">${escapeHtml(headline)}</div>` : ''}</div></a></body></html>`;
}

function renderErrorHtml(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#666;font-size:14px}</style></head>
<body>Profile not found</body></html>`;
}
