import { AuthProvider } from '@/components/auth-provider';
import { SkipLinks } from '@/components/skip-links';
import { SiteHeader } from '@/components/site-header';
import { BetaBanner } from '@/components/beta-banner';
import { ConferenceHandshakeBanner } from '@/components/conference-handshake-banner';
import { SiteFooter } from '@/components/site-footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <SkipLinks />
      <SiteHeader />
      <BetaBanner />
      <ConferenceHandshakeBanner />
      <main id="main-content" className="min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>
      <SiteFooter />
    </AuthProvider>
  );
}
