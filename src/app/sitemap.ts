import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';
const SITE_URL = 'https://sifa.id';

interface SitemapProfile {
  handle: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const res = await fetch(`${API_URL}/api/sitemap/profiles`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const profiles: SitemapProfile[] = await res.json();
      for (const profile of profiles) {
        entries.push({
          url: `${SITE_URL}/p/${profile.handle}`,
          lastModified: new Date(profile.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch {
    // API unavailable -- return static entries only
  }

  return entries;
}
