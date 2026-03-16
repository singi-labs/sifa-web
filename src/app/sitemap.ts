import type { MetadataRoute } from 'next';
import { event } from '@/data/events/atmosphereconf-2026';
import { BEACHHEAD_TOPICS } from '@/data/experts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';
const SITE_URL = 'https://sifa.id';

interface SitemapProfile {
  handle: string;
  updatedAt: string;
}

const STATIC_PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/experts', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/find-people', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/search', changeFrequency: 'weekly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Expert topic pages
  for (const topic of BEACHHEAD_TOPICS) {
    entries.push({
      url: `${SITE_URL}/experts/${topic.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  // Event pages
  entries.push({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  });
  for (const sideEvent of event.sideEvents) {
    entries.push({
      url: `${SITE_URL}/events/${event.slug}/${sideEvent.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    });
  }

  // Dynamic profile pages from API
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
