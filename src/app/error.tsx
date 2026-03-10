'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error: _error, reset }: ErrorPageProps) {
  const t = useTranslations('common');

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{t('errorTitle')}</h1>
      <p className="mt-2 text-muted-foreground">{t('errorDescription')}</p>
      <Button onClick={reset} className="mt-6">
        {t('tryAgain')}
      </Button>
    </div>
  );
}
