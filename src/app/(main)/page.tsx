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
          cta={t('claimProfile')}
        />
      )}
      <p className="mt-8 text-sm text-muted-foreground">{t('comingSoon')}</p>
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
    </div>
  );
}
