import { notFound } from 'next/navigation';
import { fetchProfile } from '@/lib/api';
import { IdentityCard } from '@/components/identity-card';

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata() {
  return {
    robots: 'noindex, nofollow',
  };
}

interface EmbedPageProps {
  params: Promise<{ handleOrDid: string }>;
  searchParams: Promise<{ theme?: string }>;
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
  const { handleOrDid } = await params;
  const { theme = 'auto' } = await searchParams;

  const profile = await fetchProfile(handleOrDid);
  if (!profile) notFound();

  return (
    <div data-theme={theme} className="bg-transparent p-2">
      <IdentityCard
        variant="embed"
        did={profile.did}
        handle={profile.handle}
        displayName={profile.displayName}
        avatar={profile.avatar}
        headline={profile.headline}
        about={profile.about}
        location={profile.location}
        website={profile.website}
        openTo={profile.openTo}
        trustStats={profile.trustStats}
        verifiedAccounts={profile.verifiedAccounts}
        claimed={profile.claimed}
      />
    </div>
  );
}
