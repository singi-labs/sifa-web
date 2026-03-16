import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AuthReturnHandler } from '@/components/auth-return-handler';
import { SuggestionsBanner } from '@/components/suggestions-banner';
import { AtprotoCounter } from '@/components/atproto-counter';
import { AvatarReel } from '@/components/avatar-reel';
import { fetchStats } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const t = await getTranslations('home');
  const stats = await fetchStats();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
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
      {stats && stats.avatars.length > 0 && (
        <AvatarReel avatars={stats.avatars} caption={t('avatarReelCaption')} />
      )}

      {/* ATmosphereConf 2026 promo -- remove after mid-April 2026 */}
      <div className="mt-20 w-full max-w-lg rounded-xl border border-border bg-card p-6">
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
              <span style={{ color: '#0085ff' }}>AT</span>mosphereConf 2026
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
  );
}
