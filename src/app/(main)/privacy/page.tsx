import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('lastUpdated')}</p>

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
          <h2 className="text-xl font-semibold">{t('cookiesTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('cookiesBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('contactTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('contactBody')}</p>
        </section>
      </div>
    </div>
  );
}
