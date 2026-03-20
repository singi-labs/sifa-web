'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth-provider';
import { fetchProfile, updateActivityVisibility } from '@/lib/api';
import { getAppMeta } from '@/lib/atproto-apps';
import type { ActiveApp } from '@/lib/types';

type FeedbackState = { type: 'success' | 'error'; appId: string; message: string } | null;

export default function ActivityVisibilityPage() {
  const t = useTranslations('activitySettings');
  const tAuth = useTranslations('auth');
  const { session, isLoading: isAuthLoading } = useAuth();
  const params = useParams<{ handle: string }>();
  const router = useRouter();

  const [apps, setApps] = useState<ActiveApp[] | null>(null);
  const [togglingApps, setTogglingApps] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const isLoading = isAuthLoading || (session != null && apps === null);

  // Fetch profile to get activeApps
  useEffect(() => {
    if (isAuthLoading || !session) return;

    let cancelled = false;
    async function load() {
      const profile = await fetchProfile(session!.handle);
      if (cancelled) return;
      setApps(profile?.activeApps ?? []);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [session, isAuthLoading]);

  // Verify the user is viewing their own settings
  const isOwnProfile = session?.handle === params.handle;

  const handleToggle = useCallback(
    async (appId: string, currentlyVisible: boolean) => {
      const newVisible = !currentlyVisible;
      setTogglingApps((prev) => new Set(prev).add(appId));
      setFeedback(null);

      const ok = await updateActivityVisibility(appId, newVisible);

      setTogglingApps((prev) => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });

      if (ok) {
        if (!newVisible) {
          // Remove from local state since the API will filter it out
          setApps((prev) => (prev ?? []).filter((a) => a.id !== appId));
        }
        setFeedback({ type: 'success', appId, message: t('updateSuccess') });
      } else {
        setFeedback({ type: 'error', appId, message: t('updateError') });
      }

      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    },
    [t],
  );

  // Auth loading state
  if (isAuthLoading || isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-16 w-full rounded bg-muted" />
          <div className="h-16 w-full rounded bg-muted" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{tAuth('loginRequired')}</h1>
        <p className="mt-2 text-muted-foreground">{tAuth('loginRequiredDescription')}</p>
      </div>
    );
  }

  // Not own profile
  if (!isOwnProfile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('notOwnProfile')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        type="button"
        onClick={() => router.push(`/p/${params.handle}`)}
        className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label={t('backToProfile')}
      >
        &larr; {t('backToProfile')}
      </button>

      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>

      {/* Feedback banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-md px-4 py-2 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {(apps ?? []).length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">{t('noApps')}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border" aria-label={t('title')}>
          {(apps ?? []).map((app) => {
            const meta = getAppMeta(app.id);
            const isToggling = togglingApps.has(app.id);
            const toggleId = `toggle-${app.id}`;

            return (
              <li key={app.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
                  >
                    {meta.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{app.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor={toggleId} className="sr-only">
                    {t('toggleLabel', { app: meta.name })}
                  </label>
                  <button
                    id={toggleId}
                    type="button"
                    role="switch"
                    aria-checked={true}
                    disabled={isToggling}
                    onClick={() => handleToggle(app.id, true)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50 bg-primary`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-5`}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 text-xs text-muted-foreground">{t('hiddenAppsNote')}</p>
    </div>
  );
}
