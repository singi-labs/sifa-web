import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MeetDisplayer } from './meet-displayer';
import { HandshakeScanner } from '@/components/handshake-scanner';

export const metadata: Metadata = {
  title: 'Handshake | Sifa ID',
  robots: { index: false, follow: false },
};

interface MeetPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function MeetPage({ searchParams }: MeetPageProps) {
  const { token } = await searchParams;

  // Scanner flow: someone scanned a QR code
  if (token) {
    return <HandshakeScanner token={token} />;
  }

  // Displayer flow: show QR for others to scan
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sid') ?? cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/login?returnTo=/meet');
  }

  return <MeetDisplayer />;
}
