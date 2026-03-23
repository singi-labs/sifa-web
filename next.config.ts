import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons**',
      },
      {
        protocol: 'https',
        hostname: 'sifa.id',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/u/script.js',
        destination: 'https://u.a11y.nl/script.js',
      },
      {
        source: '/u/api/send',
        destination: 'https://u.a11y.nl/api/send',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/profile/:handle',
        destination: '/p/:handle',
        permanent: true,
      },
      {
        source: '/p/:handle/edit',
        destination: '/p/:handle',
        permanent: true,
      },
    ];
  },
  async headers() {
    const sharedSecurityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ];

    return [
      {
        source: '/embed/:handleOrDid',
        headers: [
          ...sharedSecurityHeaders,
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://sifa.id https://public.api.bsky.app; frame-ancestors *;",
          },
        ],
      },
      {
        source: '/((?!embed/).*)',
        headers: [
          ...sharedSecurityHeaders,
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://sifa.id https://public.api.bsky.app; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
