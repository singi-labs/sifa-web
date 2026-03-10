import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  // Pages live at app/ root (no [locale] segment), so never prefix URLs
  localePrefix: 'never',
});

export const config = {
  // Match all pathnames except API routes, static files, and internal Next.js paths
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
