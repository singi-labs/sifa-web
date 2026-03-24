import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!REVALIDATE_SECRET || authHeader !== `Bearer ${REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag('event-attendees', 'max');
  revalidatePath('/events/atmosphereconf-2026', 'page');
  revalidatePath('/events/atmosphereconf-2026/unconference', 'page');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
