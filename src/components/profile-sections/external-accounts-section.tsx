'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import {
  EditableSection,
  EditableEntry,
  EXTERNAL_ACCOUNT_FIELDS,
} from '@/components/profile-editor';
import {
  externalAccountToValues,
  valuesToExternalAccount,
} from '@/components/profile-editor/section-converters';
import type { ExternalAccount } from '@/lib/types';
import { getPlatformInfo } from '@/lib/platforms';

interface ExternalAccountsSectionProps {
  accounts: ExternalAccount[];
  isOwnProfile?: boolean;
}

export function ExternalAccountsSection({ accounts, isOwnProfile }: ExternalAccountsSectionProps) {
  const t = useTranslations('sections');

  if (!accounts.length && !isOwnProfile) return null;

  return (
    <section className="mt-8" aria-label={t('otherProfiles')}>
      <h2 className="mb-4 text-xl font-semibold">{t('otherProfiles')}</h2>
      <EditableSection<ExternalAccount>
        sectionTitle={t('otherProfiles')}
        profileKey="externalAccounts"
        isOwnProfile={isOwnProfile}
        fields={EXTERNAL_ACCOUNT_FIELDS}
        toValues={externalAccountToValues}
        fromValues={
          valuesToExternalAccount as (
            v: Record<string, string | boolean>,
          ) => Omit<ExternalAccount, 'rkey'>
        }
        collection="id.sifa.profile.externalAccount"
        renderEntry={(acc, controls) => {
          const platform = getPlatformInfo(acc.platform);
          const Icon = platform.icon;
          const displayLabel = acc.label ?? platform.label;

          return (
            <EditableEntry
              key={acc.rkey}
              isOwnProfile={isOwnProfile}
              onEdit={controls?.onEdit ?? (() => {})}
              onDelete={controls?.onDelete ?? (() => {})}
              entryLabel={displayLabel}
            >
              <li className="flex items-center gap-3">
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
            </EditableEntry>
          );
        }}
      />
    </section>
  );
}
