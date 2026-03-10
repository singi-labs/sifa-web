import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/p/',
        disallow: ['/api/', '/settings/', '/import/', '/oauth/'],
      },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
    ],
    sitemap: 'https://sifa.id/sitemap.xml',
  };
}
