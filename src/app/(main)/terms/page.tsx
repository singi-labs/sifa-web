import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

const linkClass = 'font-medium text-foreground underline-offset-4 hover:underline';

export default async function TermsPage() {
  const t = await getTranslations('terms');

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
          <h2 className="text-xl font-semibold">{t('serviceTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('serviceBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('accountsTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('accountsBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('dataTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('dataBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('contentTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('contentBody')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('disclaimerTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('disclaimerBody')}</p>
        </section>
      </div>
    </div>
  );
}
