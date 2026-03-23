import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  openGraph: {
    images: ['/api/og?title=Privacy+Policy'],
  },
};

const linkClass = 'font-medium text-foreground underline-offset-4 hover:underline';

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('lastUpdated')}</p>

      <p className="mt-6 text-muted-foreground">
        {t('introPrefix')}{' '}
        <a href="https://singi.dev" className={linkClass} target="_blank" rel="noopener noreferrer">
          Singi Labs
        </a>
        {t('introFoundedBy')}{' '}
        <Link href="/p/gui.do" className={linkClass}>
          Guido X Jansen
        </Link>{' '}
        {t('introSuffix')}
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold">{t('dataStorageTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('dataStorageBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('importTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('importBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('hostingTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('hostingBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('euCommitmentTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('euCommitmentBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('analyticsTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('analyticsBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('cookiesTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('cookiesBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('activityTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('activityBody')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('activityLegalBasis')}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">{t('activityUnclaimedTitle')}</h3>
          <p className="mt-2 text-muted-foreground">{t('activityUnclaimedBody')}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">{t('activityVisibilityTitle')}</h3>
          <p className="mt-2 text-muted-foreground">{t('activityVisibilityBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('removalTitle')}</h2>
          <p className="mt-2 text-muted-foreground">
            {t('removalBody')}{' '}
            <Link href="/privacy/removal" className={linkClass}>
              Request removal
            </Link>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('rightsTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('rightsBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('loggingTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('loggingBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('contactTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('contactBody')}</p>
        </section>
      </div>
    </div>
  );
}
