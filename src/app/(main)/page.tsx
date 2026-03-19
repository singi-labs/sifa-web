import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AuthReturnHandler } from '@/components/auth-return-handler';
import { SuggestionsBanner } from '@/components/suggestions-banner';
import { AtprotoCounter } from '@/components/atproto-counter';
import { AvatarReel } from '@/components/avatar-reel';
import { fetchStats, fetchFeaturedProfile } from '@/lib/api';
import { IdentityCard } from '@/components/identity-card';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const t = await getTranslations('home');
  const [stats, featuredProfile] = await Promise.all([fetchStats(), fetchFeaturedProfile()]);

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
      <p className="mt-4 max-w-md text-lg text-muted-foreground">{t('subtitle')}</p>
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
      {/* Two-column layout on desktop when ATmosphereConf is present; collapses to single column when the promo block is removed */}
      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left column: Profile of the Day + avatar reel */}
        <div className="flex flex-col items-center">
          {featuredProfile && (
            <div className="w-full max-w-lg">
              <h2 className="mb-3 text-center text-sm font-medium text-muted-foreground">
                {t('profileOfTheDay')}
              </h2>
              <Link
                href={`/p/${featuredProfile.handle}`}
                className="block rounded-xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <IdentityCard
                  did={featuredProfile.did}
                  handle={featuredProfile.handle}
                  displayName={featuredProfile.displayName}
                  avatar={featuredProfile.avatar}
                  headline={featuredProfile.headline}
                  about={featuredProfile.about}
                  currentRole={featuredProfile.currentRole}
                  currentCompany={featuredProfile.currentCompany}
                  location={
                    featuredProfile.locationCountry
                      ? {
                          country: featuredProfile.locationCountry,
                          countryCode: featuredProfile.countryCode,
                          region: featuredProfile.locationRegion,
                          city: featuredProfile.locationCity,
                        }
                      : null
                  }
                  website={featuredProfile.website}
                  openTo={featuredProfile.openTo}
                  followersCount={featuredProfile.followersCount}
                  atprotoFollowersCount={featuredProfile.atprotoFollowersCount}
                  pdsProviderInfo={featuredProfile.pdsProvider}
                  claimed={featuredProfile.claimed}
                  variant="embed"
                  hideFooter
                />
              </Link>
            </div>
          )}
          {stats && stats.avatars.length > 0 && (
            <AvatarReel avatars={stats.avatars} caption={t('avatarReelCaption')} />
          )}
        </div>

        {/* Right column: ATmosphereConf 2026 promo -- remove entire column after mid-April 2026 */}
        <div className="flex flex-col items-center lg:items-start lg:pt-8">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:text-left">
              <Image
                src="/atmosphereconf-goose.webp"
                alt="Goodstuff the goose, ATmosphereConf mascot"
                width={120}
                height={150}
                className="h-auto w-24 shrink-0 sm:w-28"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold">
                  <span style={{ color: '#006AD5' }}>AT</span>mosphereConf 2026
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  March 26&ndash;29 &middot; Vancouver, BC
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sifa will be at the global AT Protocol community conference. Come say hi!
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link
                    href="/events/atmosphereconf-2026"
                    className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    See who&apos;s going
                  </Link>
                  <a
                    href="https://atmosphereconf.org/#tickets"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Get tickets
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
