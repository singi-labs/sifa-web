import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  // Don't prefix the URL with the default locale (e.g., /profile instead of /en/profile)
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except API routes, static files, and internal Next.js paths
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
