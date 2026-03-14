'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, WarningCircle, Star, Info } from '@phosphor-icons/react';
import { Popover } from '@base-ui/react/popover';
import { toast } from 'sonner';
import { setExternalAccountPrimary, unsetExternalAccountPrimary } from '@/lib/profile-api';
import { useProfileEdit } from '@/components/profile-edit-provider';
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
import { getPlatformInfo, PLATFORM_OPTIONS } from '@/lib/platforms';
import { Favicon } from '@/components/ui/favicon';

interface ExternalAccountsSectionProps {
  accounts: ExternalAccount[];
  isOwnProfile?: boolean;
}

export function ExternalAccountsSection({ accounts, isOwnProfile }: ExternalAccountsSectionProps) {
  const t = useTranslations('sections');
  const tEdit = useTranslations('profileEdit');
  const { updateItem } = useProfileEdit();

  const handleTogglePrimary = useCallback(
    async (acc: ExternalAccount) => {
      const newPrimary = !acc.primary;
      const result = newPrimary
        ? await setExternalAccountPrimary(acc.rkey)
        : await unsetExternalAccountPrimary(acc.rkey);

      if (result.success) {
        // If setting as primary, unset all others first
        if (newPrimary) {
          for (const other of accounts) {
            if (other.rkey !== acc.rkey && other.primary) {
              updateItem('externalAccounts', other.rkey, { primary: false });
            }
          }
        }
        updateItem('externalAccounts', acc.rkey, { primary: newPrimary });
        toast.success(newPrimary ? tEdit('setPrimary') : tEdit('removePrimary'));
      }
    },
    [accounts, updateItem, tEdit],
  );

  const handleFieldChange = useCallback(
    (
      name: string,
      value: string | boolean,
      currentValues: Record<string, string | boolean>,
    ): Record<string, string | boolean> | undefined => {
      if (name === 'platform' && typeof value === 'string' && !currentValues.label) {
        const option = PLATFORM_OPTIONS.find((o) => o.value === value);
        if (option) {
          return { label: option.label };
        }
      }
      return undefined;
    },
    [],
  );

  if (!accounts.length && !isOwnProfile) return null;

  return (
    <section className="mt-8" aria-label={t('otherProfiles')}>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-semibold">{t('otherProfiles')}</h2>
        {isOwnProfile && (
          <Popover.Root>
            <Popover.Trigger
              className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label={tEdit('primaryLink')}
            >
              <Info className="h-3.5 w-3.5" weight="bold" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner sideOffset={8}>
                <Popover.Popup className="z-[60] w-72 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
                  <Popover.Arrow className="fill-popover stroke-border" />
                  <p className="text-muted-foreground">{tEdit('primaryLinkInfo')}</p>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
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
        onFieldChange={handleFieldChange}
        renderEntry={(acc, controls) => {
          const platform = getPlatformInfo(acc.platform);
          const Icon = platform.icon;
          const displayLabel = acc.label ?? platform.label;
          const usesFavicon = acc.platform === 'website';

          const starToggle = isOwnProfile ? (
            <button
              type="button"
              onClick={() => void handleTogglePrimary(acc)}
              className={`shrink-0 rounded-full p-1 transition-colors ${
                acc.primary
                  ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={acc.primary ? tEdit('removePrimary') : tEdit('setPrimary')}
              aria-pressed={acc.primary}
              title={acc.primary ? tEdit('removePrimary') : tEdit('setPrimary')}
            >
              <Star size={16} weight={acc.primary ? 'fill' : 'regular'} />
            </button>
          ) : undefined;

          return (
            <EditableEntry
              key={acc.rkey}
              isOwnProfile={isOwnProfile}
              onEdit={controls?.onEdit ?? (() => {})}
              onDelete={controls?.onDelete ?? (() => {})}
              entryLabel={displayLabel}
              trailingContent={starToggle}
            >
              <li className="flex items-center gap-3">
                {usesFavicon ? (
                  <Favicon url={acc.url} size={20} className="shrink-0 text-muted-foreground" />
                ) : (
                  <Icon size={20} weight="regular" className="shrink-0 text-muted-foreground" />
                )}
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
                {acc.primary && !isOwnProfile && (
                  <Star
                    size={16}
                    weight="fill"
                    className="shrink-0 text-amber-500 dark:text-amber-400"
                    aria-label={tEdit('primaryLink')}
                  />
                )}
              </li>
            </EditableEntry>
          );
        }}
      />
    </section>
  );
}
