import type { Metadata } from 'next';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { KonamiRickroll } from '@/components/konami-rickroll';
import { StaleDeploymentDetector } from '@/components/stale-deployment-detector';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://sifa.id'),
  title: {
    default: 'Sifa ID',
    template: '%s | Sifa ID',
  },
  description: 'Professional identity on the AT Protocol',
  openGraph: {
    siteName: 'Sifa ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
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
      <head>
        <Script
          src="/u/script.js"
          data-website-id="7f659ec9-5d5f-4ee4-96e0-10d8bcefd69d"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <KonamiRickroll />
            <StaleDeploymentDetector />
            <Toaster position="bottom-left" closeButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
