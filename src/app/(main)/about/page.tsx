import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
};

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold">{t('introTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('intro')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('whyTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('why')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('howTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('how')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('nameTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('name')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('founderTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('founder')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('openSourceTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('openSource')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t('ctaTitle')}</h2>
          <p className="mt-2 text-muted-foreground">{t('cta')}</p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Link>
            <Link
              href="/import"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Import from LinkedIn
            </Link>
          </div>
        </section>
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
