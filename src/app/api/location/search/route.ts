import { NextRequest, NextResponse } from 'next/server';

const GEONAMES_BASE = 'https://secure.geonames.org';
const GEONAMES_USER = process.env.GEONAMES_USERNAME ?? 'gxjansen';

interface GeoNameResult {
  geonameId: number;
  name: string;
  adminName1?: string;
  countryName: string;
  countryCode: string;
}

interface PostalCodeResult {
  postalCode: string;
  placeName: string;
  adminName1?: string;
  countryCode: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q')?.trim();
  const mode = searchParams.get('mode') ?? 'city';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    if (mode === 'city') {
      const res = await fetch(
        `${GEONAMES_BASE}/searchJSON?q=${encodeURIComponent(q)}&maxRows=8&featureClass=P&style=medium&username=${GEONAMES_USER}`,
      );
      if (!res.ok) throw new Error(`GeoNames responded ${res.status}`);
      const data = (await res.json()) as { geonames?: GeoNameResult[] };
      const results = (data.geonames ?? []).map((g) => ({
        city: g.name,
        region: g.adminName1 || undefined,
        country: g.countryName,
        geonameId: g.geonameId,
        label: [g.name, g.adminName1, g.countryName].filter(Boolean).join(', '),
      }));
      return NextResponse.json({ results });
    }

    if (mode === 'postal') {
      const res = await fetch(
        `${GEONAMES_BASE}/postalCodeSearchJSON?postalcode=${encodeURIComponent(q)}&maxRows=8&username=${GEONAMES_USER}`,
      );
      if (!res.ok) throw new Error(`GeoNames responded ${res.status}`);
      const data = (await res.json()) as { postalCodes?: PostalCodeResult[] };
      const results = (data.postalCodes ?? []).map((p) => ({
        postalCode: p.postalCode,
        city: p.placeName || undefined,
        region: p.adminName1 || undefined,
        country: p.countryCode,
        label: [p.postalCode, p.placeName, p.adminName1, p.countryCode].filter(Boolean).join(', '),
      }));
      return NextResponse.json({ results });
    }

    if (mode === 'country') {
      const res = await fetch(
        `${GEONAMES_BASE}/searchJSON?q=${encodeURIComponent(q)}&maxRows=8&featureCode=PCLI&style=medium&username=${GEONAMES_USER}`,
      );
      if (!res.ok) throw new Error(`GeoNames responded ${res.status}`);
      const data = (await res.json()) as { geonames?: GeoNameResult[] };
      const results = (data.geonames ?? []).map((g) => ({
        country: g.countryName || g.name,
        label: g.countryName || g.name,
      }));
      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch {
    return NextResponse.json({ results: [], error: 'geonames_unavailable' }, { status: 502 });
  }
}
