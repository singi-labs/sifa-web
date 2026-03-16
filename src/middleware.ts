import { NextResponse, type NextRequest } from 'next/server';

interface SessionResponse {
  authenticated: boolean;
  did: string;
  handle: string;
  displayName: string;
}

function handleAssetProtection(request: NextRequest): NextResponse | null {
  const referer = request.headers.get('referer');
  const host = request.headers.get('host') ?? '';

  const isOwnSite = referer?.includes(host) || referer?.includes('sifa.id');

  if (!isOwnSite) {
    return new NextResponse(null, { status: 403 });
  }

  return null;
}

async function handleAdminProtection(
  request: NextRequest,
): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';

  let session: SessionResponse;
  try {
    const response = await fetch(`${apiUrl}/api/auth/session`, {
      headers: {
        cookie: `session=${sessionCookie.value}`,
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    session = (await response.json()) as SessionResponse;
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!session.authenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const adminDids = (process.env.ADMIN_DIDS ?? '')
    .split(',')
    .map((did) => did.trim())
    .filter(Boolean);

  if (!adminDids.includes(session.did)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return null;
}

export async function middleware(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const adminResponse = await handleAdminProtection(request);
    if (adminResponse) {
      return adminResponse;
    }
    return NextResponse.next();
  }

  // Asset hotlink protection
  const assetResponse = handleAssetProtection(request);
  if (assetResponse) {
    return assetResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/assets/:path*'],
};
