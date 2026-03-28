'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth-provider';
import { getOAuthLoginUrl, getOAuthSignupUrl } from '@/lib/auth';
import { sanitizeHandleInput } from '@/lib/handle-utils';
import { PROVIDERS, type Provider } from './providers';

function ProviderIcon({ id }: { id: string }) {
  switch (id) {
    case 'bluesky':
      return (
        <svg
          viewBox="0 0 568 501"
          className="h-8 w-8 shrink-0"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M123.121 33.664C188.241 82.553 258.281 181.681 284 234.873c25.719-53.192 95.759-152.32 160.879-201.209C491.866-1.612 568-28.906 568 57.947c0 17.345-9.945 131.876-14.624 151.903C537.322 275.855 478.267 293.601 425.672 282.587c-78.544-17.106-101.047 21.172-101.047 21.172s0 37.277 81.625 20.452c78-17.451 106.625 30.5 106.625 30.5s-61.25 111.25-173.625 67.375C298.125 406.711 284 364.711 284 334.211s-14.125 72.5-55.25 87.875c-112.375 43.875-173.625-67.375-173.625-67.375s28.625-47.951 106.625-30.5c81.625 16.825 81.625-20.452 81.625-20.452s-22.503-38.278-101.047-21.172c-52.595 11.014-111.65-6.732-127.704-72.738C9.945 189.823 0 75.292 0 57.947 0-28.906 76.134-1.612 123.121 33.664Z" />
        </svg>
      );
    case 'tangled':
      return (
        <svg
          viewBox="0 0 24.122 23.274"
          className="h-8 w-8 shrink-0"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            transform="translate(-0.439,-0.863)"
            d="m 16.349,24.099 -0.065,-0.038 -0.202,-0.011 -0.202,-0.01 -0.276,-0.026 -0.276,-0.026 v -0.026 -0.027 l -0.205,-0.04 -0.205,-0.04 -0.168,-0.08 -0.168,-0.08 -0.001,-0.041 -0.001,-0.041 -0.266,-0.144 -0.267,-0.144 -0.276,-0.203 -0.276,-0.203 -0.262,-0.252 -0.262,-0.252 -0.221,-0.285 -0.221,-0.285 -0.17,-0.285 -0.17,-0.285 -0.013,-0.014 -0.013,-0.014 -0.142,0.161 -0.142,0.161 -0.223,0.214 -0.223,0.214 -0.186,0.146 -0.186,0.146 -0.253,0.163 -0.253,0.163 -0.249,0.115 -0.249,0.115 0.005,0.032 0.005,0.032 -0.172,0.046 -0.172,0.046 -0.338,0.101 -0.338,0.101 -0.178,0.045 -0.178,0.045 -0.391,0.026 -0.391,0.026 -0.356,-0.035 -0.356,-0.035 -0.037,-0.03 -0.037,-0.03 -0.077,0.02 -0.077,0.02 -0.051,-0.051 -0.05,-0.051 -0.209,-0.046 -0.209,-0.046 -0.297,-0.103 -0.297,-0.103 -0.326,-0.163 -0.326,-0.163 -0.327,-0.228 -0.327,-0.228 -0.305,-0.288 -0.305,-0.288 -0.224,-0.29 -0.224,-0.29 -0.127,-0.213 -0.127,-0.213 -0.107,-0.214 -0.107,-0.214 -0.125,-0.338 -0.125,-0.338 -0.083,-0.391 -0.083,-0.391 0,-0.694 0,-0.694 0.064,-0.319 0.064,-0.319 0.109,-0.339 0.109,-0.339 0.157,-0.319 0.158,-0.319 0.07,-0.114 0.07,-0.114 -0.099,-0.068 -0.099,-0.068 -0.178,-0.101 -0.178,-0.101 -0.267,-0.196 -0.267,-0.196 -0.262,-0.252 -0.262,-0.252 -0.189,-0.235 -0.189,-0.235 -0.159,-0.247 -0.159,-0.247 -0.129,-0.266 -0.129,-0.266 -0.121,-0.338 -0.121,-0.338 -0.083,-0.391 -0.083,-0.391 0.002,-0.694 0.002,-0.694 0.1,-0.426 0.1,-0.426 0.132,-0.342 0.132,-0.342 0.167,-0.307 0.167,-0.307 0.219,-0.296 0.219,-0.296 0.252,-0.262 0.252,-0.262 0.231,-0.185 0.231,-0.185 0.231,-0.151 0.231,-0.151 0.321,-0.155 0.321,-0.155 0.177,-0.065 0.177,-0.065 0.178,-0.338 0.178,-0.338 0.213,-0.302 0.213,-0.302 0.314,-0.326 0.314,-0.326 0.256,-0.196 0.256,-0.196 0.305,-0.179 0.305,-0.179 0.316,-0.131 0.316,-0.131 0.21,-0.067 0.21,-0.067 0.397,-0.079 0.397,-0.079 0.587,0.003 0.587,0.003 0.445,0.092 0.445,0.092 0.302,0.111 0.302,0.111 0.33,0.165 0.33,0.165 0.239,-0.232 0.239,-0.232 0.16,-0.126 0.16,-0.126 0.16,-0.102 0.16,-0.102 0.142,-0.082 0.142,-0.082 0.231,-0.109 0.231,-0.109 0.267,-0.099 0.267,-0.099 0.32,-0.074 0.32,-0.074 0.356,-0.042 0.356,-0.042 0.427,0.024 0.427,0.024 0.356,0.071 0.356,0.071 0.285,0.093 0.285,0.093 0.285,0.131 0.285,0.131 0.238,0.145 0.238,0.145 0.259,0.196 0.259,0.196 0.291,0.297 0.291,0.297 0.152,0.194 0.152,0.194 0.135,0.215 0.135,0.215 0.155,0.32 0.155,0.32 0.094,0.268 0.094,0.268 0.069,0.332 0.069,0.332 0.011,0.008 0.011,0.008 0.445,0.217 0.445,0.217 0.309,0.216 0.309,0.216 0.31,0.293 0.31,0.293 0.188,0.235 0.188,0.235 0.167,0.257 0.167,0.257 0.153,0.326 0.153,0.326 0.09,0.267 0.09,0.267 0.083,0.391 0.083,0.391 -0.001,0.658 -0.001,0.658 -0.064,0.316 -0.064,0.316 -0.09,0.289 -0.09,0.289 -0.123,0.281 -0.123,0.281 -0.147,0.252 -0.147,0.252 -0.19,0.259 -0.19,0.259 -0.255,0.268 -0.255,0.268 -0.287,0.223 -0.287,0.223 -0.32,0.188 -0.32,0.188 -0.043,0.035 -0.043,0.035 0.056,0.13 0.056,0.13 0.087,0.213 0.087,0.213 0.19,0.729 0.19,0.729 0.065,0.302 0.065,0.302 -0.002,0.676 -0.002,0.676 -0.08,0.374 -0.08,0.374 -0.09,0.267 -0.09,0.267 -0.19,0.391 -0.19,0.391 -0.223,0.32 -0.223,0.32 -0.304,0.315 -0.304,0.315 -0.285,0.221 -0.285,0.221 -0.22,0.132 -0.22,0.132 -0.242,0.107 -0.242,0.107 -0.089,0.047 -0.089,0.047 -0.249,0.072 -0.249,0.072 -0.322,0.057 -0.322,0.057 -0.283,-0.003 -0.283,-0.003 -0.071,-0.003 -0.071,-0.003 -0.178,-0.003 -0.178,-0.003 -0.125,0.026 -0.125,0.026 z m -4.47,-5.35 0.215,-0.017 0.207,-0.068 0.207,-0.068 0.244,-0.118 0.244,-0.118 0.274,-0.207 0.275,-0.207 0.229,-0.257 0.229,-0.257 0.219,-0.285 0.219,-0.285 0.189,-0.285 0.189,-0.285 0.215,-0.374 0.215,-0.374 0.134,-0.312 0.134,-0.312 0.029,-0.018 0.029,-0.018 0.197,0.262 0.197,0.262 0.164,0.151 0.164,0.151 0.202,0.093 0.202,0.093 0.302,0.014 0.302,0.014 0.213,-0.08 0.213,-0.08 0.201,-0.205 0.201,-0.205 0.092,-0.279 0.092,-0.279 0.058,-0.302 0.058,-0.302 -0.018,-0.427 -0.018,-0.427 -0.077,-0.426 -0.077,-0.426 -0.086,-0.321 -0.086,-0.321 -0.141,-0.402 -0.141,-0.402 -0.167,-0.31 -0.167,-0.31 -0.117,-0.16 -0.117,-0.16 -0.125,-0.12 -0.125,-0.12 0.019,-0.183 0.019,-0.183 -0.061,-0.249 -0.061,-0.249 -0.134,-0.285 -0.134,-0.285 -0.183,-0.203 -0.183,-0.203 -0.173,-0.127 -0.173,-0.127 -0.204,0.123 -0.204,0.123 -0.267,0.059 -0.267,0.059 -0.206,-0.022 -0.206,-0.022 -0.235,-0.088 -0.235,-0.088 -0.118,-0.09 -0.118,-0.09 h -0.039 -0.039 l -0.055,0.117 -0.056,0.117 -0.159,0.181 -0.159,0.181 -0.17,0.109 -0.17,0.109 -0.221,0.074 -0.221,0.074 h -0.28 -0.28 l -0.196,-0.068 -0.196,-0.068 -0.113,-0.058 -0.113,-0.058 -0.24,-0.221 -0.24,-0.221 -0.096,-0.085 -0.096,-0.085 -0.219,0.198 -0.219,0.198 -0.165,0.078 -0.165,0.078 -0.178,0.048 -0.178,0.048 -0.219,0 -0.219,0 -0.225,-0.07 -0.225,-0.07 -0.102,0.097 -0.102,0.097 -0.121,0.164 -0.121,0.164 -0.17,0.063 -0.17,0.063 -0.115,0.086 -0.115,0.086 -0.109,0.114 -0.109,0.114 -0.356,0.529 -0.356,0.529 -0.216,0.45 -0.216,0.45 -0.222,0.463 -0.222,0.463 -0.146,0.338 -0.146,0.338 -0.055,0.22 -0.055,0.22 -0.016,0.207 -0.016,0.207 0.034,0.243 0.034,0.243 0.096,0.197 0.096,0.197 0.144,0.125 0.144,0.125 0.187,0.087 0.187,0.087 0.275,0.002 0.275,0.002 0.231,-0.098 0.231,-0.098 0.107,-0.076 0.107,-0.076 0.368,-0.294 0.368,-0.294 0.027,0.017 0.027,0.017 0.024,0.467 0.024,0.467 0.088,0.513 0.088,0.513 0.089,0.364 0.089,0.364 0.132,0.302 0.132,0.302 0.105,0.16 0.105,0.16 0.11,0.119 0.11,0.119 0.285,0.206 0.285,0.206 0.144,0.073 0.144,0.073 0.215,0.056 0.215,0.056 0.246,0.031 0.246,0.031 0.205,-0.013 0.205,-0.013 z m 0.686,-3.497 -0.113,-0.061 -0.106,-0.134 -0.106,-0.134 -0.044,-0.184 -0.044,-0.184 0.024,-0.554 0.024,-0.554 0.035,-0.427 0.035,-0.427 0.072,-0.374 0.072,-0.374 0.054,-0.211 0.054,-0.211 0.067,-0.132 0.067,-0.132 0.132,-0.109 0.132,-0.109 0.188,-0.042 0.188,-0.042 0.17,0.065 0.17,0.065 0.114,0.124 0.114,0.124 0.041,0.185 0.041,0.185 -0.111,0.46 -0.111,0.46 -0.034,0.266 -0.034,0.266 -0.04,0.818 -0.04,0.818 -0.038,0.152 -0.038,0.152 -0.111,0.111 -0.111,0.111 -0.114,0.049 -0.114,0.049 -0.188,-0.002 -0.188,-0.002 z m -2.809,-0.358 -0.146,-0.068 -0.088,-0.12 -0.088,-0.12 -0.039,-0.107 -0.039,-0.107 -0.022,-0.135 -0.022,-0.135 -0.032,-0.47 -0.032,-0.47 0.036,-0.445 0.036,-0.445 0.049,-0.215 0.049,-0.215 0.076,-0.203 0.076,-0.203 0.094,-0.111 0.094,-0.111 0.144,-0.065 0.144,-0.065 h 0.142 0.142 l 0.142,0.066 0.142,0.066 0.093,0.102 0.093,0.102 0.04,0.121 0.04,0.121 v 0.152 0.152 l -0.033,0.088 -0.033,0.088 -0.057,0.276 -0.057,0.276 0,0.43 0,0.43 0.043,0.393 0.043,0.393 -0.092,0.201 -0.092,0.201 -0.149,0.098 -0.149,0.098 -0.201,0.012 -0.201,0.012 z"
          />
        </svg>
      );
    case 'eurosky':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/eurosky-logo.png" alt="" className="h-8 w-8 shrink-0" aria-hidden="true" />
      );
    default:
      return null;
  }
}

function LoginContent() {
  const t = useTranslations('login');
  const { session, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/';

  const [handle, setHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupLoading, setSignupLoading] = useState<string | null>(null);
  const upstreamError = searchParams.get('error') === 'upstream' ? t('errorUpstream') : null;
  const [error, setError] = useState<string | null>(upstreamError);
  const [isReturningFromProvider] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('sifa_provider_clicked') !== null;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (session && !isLoading) {
      window.location.href = returnTo;
    }
  }, [session, isLoading, returnTo]);

  if (session && !isLoading) {
    return null;
  }

  const handleProviderClick = () => {
    try {
      localStorage.setItem('sifa_provider_clicked', Date.now().toString());
    } catch {
      // localStorage unavailable
    }
  };

  const handleSignup = async (provider: Provider) => {
    setSignupLoading(provider.id);
    setError(null);

    try {
      const res = await fetch(getOAuthSignupUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ host: provider.host }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
      }

      // Fallback: open external signup URL in new tab
      handleProviderClick();
      window.open(provider.signupUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Network error: fall back to external link
      handleProviderClick();
      window.open(provider.signupUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setSignupLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const identifier = sanitizeHandleInput(handle);

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
        if (data?.error === 'HandleNotFound') {
          setError(t('errorHandleNotFound', { handle: identifier }));
        } else if (data?.error === 'UpstreamError' || res.status === 503) {
          setError(t('errorUpstreamLogin'));
        } else {
          setError(data?.message ?? t('errorGeneric'));
        }
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      if (data.redirectUrl) {
        sessionStorage.setItem('auth_returnTo', returnTo);
        try {
          localStorage.removeItem('sifa_provider_clicked');
        } catch {
          // localStorage unavailable
        }
        window.location.href = data.redirectUrl;
      }
    } catch {
      setError(t('errorNetwork'));
      setIsSubmitting(false);
    }
  };

  const signInForm = (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4" noValidate>
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
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
        <p className="text-xs text-muted-foreground">{t('handleHint')}</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !handle.trim()}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );

  const providerCards = (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PROVIDERS.map((provider) => (
        <div key={provider.id} className="relative flex flex-col">
          {provider.recommended && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {t('providerRecommended')}
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleSignup(provider)}
            disabled={signupLoading !== null}
            className="flex w-full flex-1 flex-col items-center justify-center rounded-lg border border-border bg-background p-4 pt-5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <ProviderIcon id={provider.id} />
            <span className="mt-2 text-sm font-medium">{provider.name}</span>
            <span className="text-xs text-muted-foreground">{t(provider.descriptionKey)}</span>
            <span className="text-xs text-muted-foreground">{t(provider.countryKey)}</span>
            {provider.requiresInvite && (
              <span className="mt-1 text-xs text-muted-foreground">
                {t('providerRequiresInvite')}
              </span>
            )}
            {signupLoading === provider.id && (
              <span className="mt-1 text-xs text-muted-foreground">{t('signupLoading')}</span>
            )}
          </button>
          <a
            href={provider.readMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-center text-xs text-primary underline hover:text-primary/80"
          >
            {t('providerReadMore')}
          </a>
        </div>
      ))}
    </div>
  );

  const newUserSection = (
    <section
      className="mt-8 rounded-xl border border-border bg-muted/30 p-6"
      aria-labelledby="new-user-heading"
    >
      <h2 id="new-user-heading" className="text-lg font-semibold tracking-tight">
        {t('newUserHeading')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t('newUserExplanation')}
      </p>

      {providerCards}

      <p className="mt-3 text-xs text-muted-foreground">{t('providerRecommendation')}</p>

      {/* Why external account */}
      <details className="mt-4 group text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
          {t('whyExternalHeading')}
        </summary>
        <p className="mt-2 text-muted-foreground">{t('whyExternalExplanation')}</p>
      </details>
    </section>
  );

  if (isReturningFromProvider) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">{t('welcomeBackHeading')}</h1>
          <p className="text-sm text-muted-foreground">{t('welcomeBackDescription')}</p>
        </div>

        {/* Sign-in form promoted to top */}
        <section
          className="mt-8 rounded-xl border border-border p-6"
          aria-labelledby="signin-heading"
        >
          <h2 id="signin-heading" className="sr-only">
            {t('returningUserHeading')}
          </h2>
          {signInForm}
        </section>

        {/* New user section collapsed for those who aren't ready yet */}
        <p className="mt-4 text-center text-sm text-muted-foreground">{t('welcomeBackNotReady')}</p>

        <details className="mt-2 group">
          <summary className="cursor-pointer text-center text-sm font-medium text-primary hover:text-primary/80">
            {t('newUserHeading')}
          </summary>
          <div className="mt-4">{newUserSection}</div>
        </details>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

      {newUserSection}

      {/* Returning users section */}
      <section
        className="mt-6 rounded-xl border border-border p-6"
        aria-labelledby="returning-user-heading"
      >
        <h2 id="returning-user-heading" className="text-lg font-semibold tracking-tight">
          {t('returningUserHeading')}
        </h2>
        {signInForm}
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-12">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
