'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth-provider';
import { getOAuthLoginUrl } from '@/lib/auth';

function LoginContent() {
  const t = useTranslations('login');
  const { session, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/';

  const [handle, setHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && !isLoading) {
      window.location.href = returnTo;
    }
  }, [session, isLoading, returnTo]);

  if (session && !isLoading) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let identifier = handle
      .trim()
      .replace(/^https?:\/\/bsky\.app\/profile\//i, '')
      .replace(/^at:\/\//i, '')
      .replace(/^@/, '');
    if (!identifier.startsWith('did:')) {
      identifier = identifier.split('/')[0] ?? identifier;
    }
    identifier = identifier.replace(/\.$/, '');
    if (!identifier.startsWith('did:')) {
      identifier = identifier.toLowerCase();
    }

    if (!identifier) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(getOAuthLoginUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ handle: identifier }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? 'Failed to sign in. Please check your handle and try again.');
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      if (data.redirectUrl) {
        sessionStorage.setItem('auth_returnTo', returnTo);
        window.location.href = data.redirectUrl;
      }
    } catch {
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          {error && (
            <p
              className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="handle" className="block text-sm font-medium">
              {t('handleLabel')}
            </label>
            <input
              id="handle"
              name="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={t('handlePlaceholder')}
              autoComplete="username"
              required
              disabled={isSubmitting}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !handle.trim()}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </form>

        <details className="group text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            What is an AT Protocol identity?
          </summary>
          <p className="mt-2 text-muted-foreground">
            <strong className="text-foreground">Sifa</strong> is built on the{' '}
            <a
              href="https://atproto.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              AT Protocol
            </a>
            , which lets you own your data and use one account across many apps. If you have a{' '}
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              Bluesky
            </a>{' '}
            account, you already have one.
          </p>
        </details>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center px-4 py-24">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
