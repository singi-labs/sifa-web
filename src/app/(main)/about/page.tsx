import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
};

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>{t('mission')}</p>
        <p>{t('atproto')}</p>
        <p>{t('openSource')}</p>
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          {t('builtBy')}{' '}
          <a
            href="https://singi.dev"
            className="font-medium text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Singi Labs
          </a>
        </p>
      </div>
    </div>
  );
}
