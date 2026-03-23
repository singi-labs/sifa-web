import { getTranslations } from 'next-intl/server';
import { EmbedBuilder } from '@/components/embed-builder';

export async function generateMetadata() {
  const t = await getTranslations('embedBuilder');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function EmbedBuilderPage() {
  const t = await getTranslations('embedBuilder');

  const anyProfileDesc = t('anyProfileDescription');
  const parts = anyProfileDesc.split(/\{exampleLinkStart\}|\{exampleLinkEnd\}/);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
      <p className="mt-2 text-muted-foreground">{t('pageSubtitle')}</p>
      <div className="mt-8">
        <EmbedBuilder />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <div>
          <h3 className="font-semibold">{t('alwaysUpToDate')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('alwaysUpToDateDescription')}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t('anyProfile')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {parts[0]}
            <a
              href="https://sifa.id/events/atmosphereconf-2026"
              className="text-primary hover:underline"
            >
              {parts[1]}
            </a>
            {parts[2]}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">{t('comingSoon')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('comingSoonDescription')}</p>
        </div>
      </div>
    </div>
  );
}
