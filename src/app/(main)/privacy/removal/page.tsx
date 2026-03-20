'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestProfileRemoval } from '@/lib/api';

export default function PrivacyRemovalPage() {
  const t = useTranslations('privacyRemoval');
  const [handleOrDid, setHandleOrDid] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handleOrDid.trim()) return;

    setStatus('submitting');
    const ok = await requestProfileRemoval(handleOrDid.trim());
    setStatus(ok ? 'success' : 'error');
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('description')}</p>

      {status === 'success' ? (
        <div
          className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          role="status"
        >
          {t('successMessage')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="handle-or-did" className="block text-sm font-medium">
              {t('inputLabel')}
            </label>
            <Input
              id="handle-or-did"
              type="text"
              placeholder={t('inputPlaceholder')}
              value={handleOrDid}
              onChange={(e) => setHandleOrDid(e.target.value)}
              required
              className="mt-1"
              disabled={status === 'submitting'}
            />
          </div>

          {status === 'error' && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              role="alert"
            >
              {t('errorMessage')}
            </div>
          )}

          <Button type="submit" disabled={status === 'submitting' || !handleOrDid.trim()}>
            {status === 'submitting' ? t('submitting') : t('submitButton')}
          </Button>
        </form>
      )}

      <div className="mt-10 space-y-4 text-sm text-muted-foreground">
        <div>
          <h2 className="font-semibold text-foreground">{t('whatGetsRemovedTitle')}</h2>
          <p className="mt-1">{t('whatGetsRemoved')}</p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{t('whatStaysTitle')}</h2>
          <p className="mt-1">{t('whatStays')}</p>
        </div>
        <p>
          <Link
            href="/privacy"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('privacyPolicyLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
