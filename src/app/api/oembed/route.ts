import { NextRequest, NextResponse } from 'next/server';
import { fetchProfile } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get('url');
  const format = searchParams.get('format') ?? 'json';
  const maxWidth = parseInt(searchParams.get('maxwidth') ?? '350', 10);
  const maxHeight = parseInt(searchParams.get('maxheight') ?? '250', 10);

  if (format !== 'json') {
    return NextResponse.json({ error: 'Only JSON format is supported' }, { status: 501 });
  }

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const match = url.match(/sifa\.id\/p\/([^/]+)/);
  if (!match) {
    return NextResponse.json(
      { error: 'URL does not match sifa.id/p/:handle pattern' },
      { status: 404 },
    );
  }

  const handle = match[1];
  if (!handle) {
    return NextResponse.json({ error: 'Could not extract handle from URL' }, { status: 404 });
  }

  const profile = await fetchProfile(handle);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const width = Math.min(maxWidth, 350);
  const height = Math.min(maxHeight, 250);

  const oembedResponse = {
    version: '1.0',
    type: 'rich',
    provider_name: 'Sifa ID',
    provider_url: 'https://sifa.id',
    title: `${profile.displayName ?? profile.handle} on Sifa ID`,
    author_name: profile.displayName ?? profile.handle,
    author_url: `https://sifa.id/p/${profile.handle}`,
    width,
    height,
    html: `<iframe src="https://sifa.id/embed/${encodeURIComponent(profile.handle)}" width="${width}" height="${height}" frameborder="0" style="border:none;border-radius:12px;overflow:hidden" allowtransparency="true"></iframe>`,
    thumbnail_url: profile.avatar ?? undefined,
    thumbnail_width: profile.avatar ? 64 : undefined,
    thumbnail_height: profile.avatar ? 64 : undefined,
    cache_age: 3600,
  };

  return NextResponse.json(oembedResponse, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
