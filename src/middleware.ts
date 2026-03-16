import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const referer = request.headers.get('referer');
  const host = request.headers.get('host') ?? '';

  const isOwnSite =
    referer?.includes(host) || referer?.includes('sifa.id');

  if (!isOwnSite) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/assets/:path*',
};
