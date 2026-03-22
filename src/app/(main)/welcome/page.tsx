import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { WelcomeContent } from './welcome-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('welcome');
  return {
    title: t('pageTitle'),
    robots: { index: false, follow: false },
  };
}

export default function WelcomePage() {
  return (
    <Suspense>
      <WelcomeContent />
    </Suspense>
  );
}
