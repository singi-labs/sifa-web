import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AuthReturnHandler } from '@/components/auth-return-handler';
import { SuggestionsBanner } from '@/components/suggestions-banner';
import { AtprotoCounter } from '@/components/atproto-counter';
import { AvatarReel } from '@/components/avatar-reel';
import { fetchStats, fetchFeaturedProfile, fetchProfile } from '@/lib/api';
import { IdentityCard } from '@/components/identity-card';
import { TouchSafeCard } from '@/components/ui/touch-safe-card';
import type { LocationValue, ProfilePosition } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const t = await getTranslations('home');
  const [stats, featuredMeta] = await Promise.all([fetchStats(), fetchFeaturedProfile()]);
  const featuredProfile = featuredMeta ? await fetchProfile(featuredMeta.handle) : null;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <AuthReturnHandler />
      <SuggestionsBanner />
      <Image
        src="/sifa-logo-light.svg"
        alt=""
        width={64}
        height={64}
        className="mb-6 h-16 w-16 dark:hidden"
      />
      <Image
        src="/sifa-logo-dark.svg"
        alt=""
        width={64}
        height={64}
        className="mb-6 hidden h-16 w-16 dark:block"
      />
      <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
      <p className="mt-1 text-lg font-medium text-foreground">{t('subtitleAccent')}</p>
      {stats?.atproto && (
        <AtprotoCounter
          userCount={stats.atproto.userCount}
          growthPerSecond={stats.atproto.growthPerSecond}
          timestamp={stats.atproto.timestamp}
          prefix={t('atprotoCountPrefix')}
          suffix={t('atprotoCountSuffix')}
        />
      )}
      <div className="mt-6 flex gap-4">
        <Link
          href="/search"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t('searchProfiles')}
        </Link>
        <Link
          href="/import"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t('importLinkedIn')}
        </Link>
      </div>
      <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-8">
        {/* Left column: Profile of the Day + avatar reel */}
        <div className="flex flex-col items-center">
          {featuredProfile && (
            <div className="w-full max-w-lg">
              <h2 className="mb-3 text-center text-sm font-medium text-muted-foreground">
                {t('profileOfTheDay')}
              </h2>
              {(() => {
                const location: LocationValue | null = featuredProfile.locationCountry
                  ? {
                      country: featuredProfile.locationCountry,
                      countryCode: featuredProfile.countryCode ?? undefined,
                      region: featuredProfile.locationRegion ?? undefined,
                      city: featuredProfile.locationCity ?? undefined,
                    }
                  : null;
                const currentPositions =
                  (featuredProfile.positions as ProfilePosition[] | undefined)?.filter(
                    (p: ProfilePosition) => !p.endedAt,
                  ) ?? [];
                const currentPosition =
                  currentPositions.find((p: ProfilePosition) => p.primary) ??
                  currentPositions.sort((a: ProfilePosition, b: ProfilePosition) =>
                    (b.startedAt ?? '').localeCompare(a.startedAt ?? ''),
                  )[0] ??
                  null;
                return (
                  <TouchSafeCard
                    href={`/p/${featuredProfile.handle}`}
                    className="block rounded-xl text-left transition-transform pointer-fine:hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <IdentityCard
                      did={featuredProfile.did}
                      handle={featuredProfile.handle}
                      displayName={featuredProfile.displayName}
                      avatar={featuredProfile.avatar}
                      pronouns={featuredProfile.pronouns}
                      headline={featuredProfile.headline}
                      about={featuredProfile.about}
                      currentRole={currentPosition?.title}
                      currentCompany={currentPosition?.company}
                      location={location}
                      website={featuredProfile.website}
                      openTo={featuredProfile.openTo}
                      followersCount={featuredProfile.followersCount}
                      atprotoFollowersCount={featuredProfile.atprotoFollowersCount}
                      trustStats={featuredProfile.trustStats}
                      verifiedAccounts={featuredProfile.verifiedAccounts}
                      activeApps={featuredProfile.activeApps}
                      pdsProviderInfo={featuredProfile.pdsProvider}
                      claimed={featuredProfile.claimed}
                      variant="embed"
                      hideFooter
                      profileHref={`/p/${featuredProfile.handle}`}
                    />
                  </TouchSafeCard>
                );
              })()}
            </div>
          )}
          {stats && stats.avatars.length > 0 && (
            <AvatarReel avatars={stats.avatars} caption={t('avatarReelCaption')} />
          )}
        </div>
      </div>
    </div>
  );
}
