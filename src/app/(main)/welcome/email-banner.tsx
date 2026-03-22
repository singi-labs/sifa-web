'use client';

import { useEffect, useState } from 'react';
import { EnvelopeSimple, X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isEmailBannerDismissed, dismissEmailBanner } from '@/lib/onboarding';
import { trackEvent } from '@/lib/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

type BannerState = 'idle' | 'loading' | 'success' | 'error-invalid' | 'error-server';

export function EmailBanner() {
  const t = useTranslations('welcome.emailBanner');
  // null = not yet hydrated (SSR), true = dismissed, false = visible
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [bannerState, setBannerState] = useState<BannerState>('idle');

  useEffect(() => {
    // Hydrate localStorage state after mount; safe to call setState here
    // because this runs exactly once after the initial render, not in response
    // to another state change. Suppressed: react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(isEmailBannerDismissed());
  }, []);

  if (dismissed !== false) return null;

  function handleDismiss() {
    dismissEmailBanner();
    setDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      setBannerState('error-invalid');
      return;
    }

    setBannerState('loading');
    try {
      const res = await fetch(`${API_URL}/api/email-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        setBannerState('error-server');
        return;
      }

      setBannerState('success');
      trackEvent('onboarding_email_submitted');
    } catch {
      setBannerState('error-server');
    }
  }

  const errorMessage =
    bannerState === 'error-invalid'
      ? t('errorInvalid')
      : bannerState === 'error-server'
        ? t('errorServer')
        : null;

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex flex-1 items-center gap-3">
          <EnvelopeSimple size={20} color="#8B7EC8" aria-hidden="true" />
          {bannerState === 'success' ? (
            <p className="text-sm text-foreground">{t('success')}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('pitch')}</p>
          )}
        </div>

        {bannerState !== 'success' && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-2 md:flex-row md:items-center"
            noValidate
          >
            <div className="flex flex-1 flex-col gap-1">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (bannerState === 'error-invalid' || bannerState === 'error-server') {
                    setBannerState('idle');
                  }
                }}
                placeholder={t('placeholder')}
                aria-invalid={errorMessage !== null}
                aria-describedby={errorMessage ? 'email-banner-error' : undefined}
                autoComplete="email"
                className="h-8"
              />
              {errorMessage && (
                <p id="email-banner-error" className="text-xs text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="default"
              size="default"
              disabled={bannerState === 'loading'}
              className="shrink-0"
            >
              {t('submit')}
            </Button>
          </form>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label={t('dismiss')}
          className="shrink-0 self-start md:self-center"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
