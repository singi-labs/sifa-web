'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import type { ExternalAccount } from '@/lib/types';
import { getPlatformInfo } from '@/lib/platforms';

interface ExternalAccountsSectionProps {
  accounts: ExternalAccount[];
}

export function ExternalAccountsSection({ accounts }: ExternalAccountsSectionProps) {
  const t = useTranslations('sections');

  if (!accounts.length) return null;

  return (
    <section className="mt-8" aria-label={t('otherProfiles')}>
      <h2 className="mb-4 text-xl font-semibold">{t('otherProfiles')}</h2>
      <ul className="space-y-3">
        {accounts.map((acc) => {
          const platform = getPlatformInfo(acc.platform);
          const Icon = platform.icon;
          const displayLabel = acc.label ?? platform.label;

          return (
            <li key={acc.rkey} className="flex items-center gap-3">
              <Icon size={20} weight="regular" className="shrink-0 text-muted-foreground" />
              <a
                href={acc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-4 hover:underline"
              >
                {displayLabel}
              </a>
              {acc.verified && (
                <CheckCircle
                  size={16}
                  weight="fill"
                  className="shrink-0 text-green-600 dark:text-green-400"
                  aria-label={t('verified')}
                />
              )}
              {acc.verifiable && !acc.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <WarningCircle size={12} weight="fill" />
                  {t('unverified')}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
