import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_GLITCHTIP_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_GLITCHTIP_DSN,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}
