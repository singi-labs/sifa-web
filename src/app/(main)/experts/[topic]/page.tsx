import type { Metadata } from 'next';
import { searchProfiles } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';

export const dynamic = 'force-dynamic';

const TOPIC_LABELS: Record<string, string> = {
  atproto: 'AT Protocol',
  devrel: 'Developer Relations',
  'open-source': 'Open Source',
  typescript: 'TypeScript',
  react: 'React',
};

interface ExpertTopicPageProps {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: ExpertTopicPageProps): Promise<Metadata> {
  const { topic } = await params;
  const label = TOPIC_LABELS[topic] ?? topic;
  return {
    title: `${label} Experts`,
    description: `Find ${label} professionals and experts on Sifa.`,
  };
}

export default async function ExpertTopicPage({ params }: ExpertTopicPageProps) {
  const { topic } = await params;
  const label = TOPIC_LABELS[topic] ?? topic;

  const profiles = await searchProfiles(topic);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{label} Experts</h1>
      <p className="mt-2 text-muted-foreground">
        Professionals with demonstrated {label.toLowerCase()} expertise on Sifa.
      </p>

      <div className="mt-8 space-y-3">
        {profiles.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No experts found yet. As more professionals join Sifa, this directory will grow.
          </p>
        ) : (
          profiles.map((profile) => (
            <ProfileCard
              key={profile.handle}
              handle={profile.handle}
              headline={profile.headline}
              avatar={profile.avatar}
              currentRole={profile.currentRole}
              currentCompany={profile.currentCompany}
            />
          ))
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${label} Experts on Sifa`,
            description: `Find ${label} professionals and experts on Sifa.`,
            numberOfItems: profiles.length,
            itemListElement: profiles.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Person',
                name: p.handle,
                url: `https://sifa.id/p/${p.handle}`,
                ...(p.headline ? { jobTitle: p.headline } : {}),
                ...(p.avatar ? { image: p.avatar } : {}),
              },
            })),
          }),
        }}
      />
    </main>
  );
}
