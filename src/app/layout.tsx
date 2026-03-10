import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { SkipLinks } from '@/components/skip-links';
import { SiteHeader } from '@/components/site-header';
import { BetaBanner } from '@/components/beta-banner';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sifa',
    template: '%s | Sifa',
  },
  description: 'Professional identity on the AT Protocol',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <SkipLinks />
              <SiteHeader />
              <BetaBanner />
              <main id="main-content" className="min-h-[calc(100vh-3.5rem)]">
                {children}
              </main>
              <SiteFooter />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
