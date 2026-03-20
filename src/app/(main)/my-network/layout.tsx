import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Network | Sifa',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function MyNetworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
