'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

/**
 * Returns a guard function that checks auth state before performing an action.
 * If the user is not authenticated, shows a toast prompting them to sign in.
 * If authenticated, executes the callback.
 */
export function useRequireAuth() {
  const { session } = useAuth();
  const t = useTranslations('auth');
  const isAuthenticated = session !== null;

  const requireAuth = useCallback(
    (action: () => void | Promise<void>) => {
      if (!isAuthenticated) {
        toast(t('loginRequired'), {
          description: t('loginRequiredDescription'),
          action: {
            label: t('signIn'),
            onClick: () => {
              window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
            },
          },
        });
        return;
      }
      void action();
    },
    [isAuthenticated, t],
  );

  return { requireAuth, isAuthenticated };
}
