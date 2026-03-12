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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
      <p className="mt-2 text-muted-foreground">{t('pageSubtitle')}</p>
      <div className="mt-8">
        <EmbedBuilder />
      </div>
    </div>
  );
}
