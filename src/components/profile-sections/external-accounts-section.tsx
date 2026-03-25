'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, Star, Info, EyeSlash } from '@phosphor-icons/react';
import { Popover } from '@base-ui/react/popover';
import { toast } from 'sonner';
import {
  setExternalAccountPrimary,
  unsetExternalAccountPrimary,
  fetchExternalAccounts,
  hideKeytraceClaim,
} from '@/lib/profile-api';
import { useProfileEdit } from '@/components/profile-edit-provider';
import {
  EditableSection,
  EditableEntry,
  getExternalAccountFields,
} from '@/components/profile-editor';
import {
  externalAccountToValues,
  valuesToExternalAccount,
} from '@/components/profile-editor/section-converters';
import type { ExternalAccount } from '@/lib/types';
import { getPlatformInfo, PLATFORM_OPTIONS } from '@/lib/platforms';
import { Favicon } from '@/components/ui/favicon';
import { PdsIcon } from '@/components/pds-icon';
import { pdsProviderFromApi, detectPdsProvider, getPdsDisplayName } from '@/lib/pds-utils';
import { VerificationPopover } from './verification-popover';

interface ExternalAccountsSectionProps {
  accounts: ExternalAccount[];
  isOwnProfile?: boolean;
}

export function ExternalAccountsSection({ accounts, isOwnProfile }: ExternalAccountsSectionProps) {
  const t = useTranslations('sections');
  const tEdit = useTranslations('profileEdit');
  const { profile, updateItem, updateProfile } = useProfileEdit();

  const externalAccountFields = useMemo(
    () => getExternalAccountFields(profile.handle, t),
    [profile.handle, t],
  );

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

  const handleHideKeytrace = useCallback(
    async (rkey: string) => {
      const result = await hideKeytraceClaim(rkey);
      if (result.success) {
        updateProfile({
          externalAccounts: accounts.filter((a) => a.rkey !== rkey),
        });
        toast.success(t('hideLink'));
      }
    },
    [accounts, updateProfile, t],
  );

  const handleFieldChange = useCallback(
    (
      name: string,
      value: string | boolean,
      _currentValues: Record<string, string | boolean>,
    ): Record<string, string | boolean> | undefined => {
      if (name === 'platform' && typeof value === 'string') {
        const option = PLATFORM_OPTIONS.find((o) => o.value === value);
        if (option) {
          return { label: option.label };
        }
      }
      return undefined;
    },
    [],
  );

  const handlePostSave = useCallback(() => {
    setTimeout(async () => {
      const fresh = await fetchExternalAccounts(profile.handle);
      if (fresh.length > 0) {
        updateProfile({ externalAccounts: fresh });
      }
    }, 2000);
  }, [profile.handle, updateProfile]);

  const pdsProvider =
    pdsProviderFromApi(profile.pdsProvider, profile.handle) ?? detectPdsProvider(profile.handle);
  const atprotoUrl = `https://bsky.app/profile/${profile.handle}`;
  const isSelfHosted =
    pdsProvider?.name === 'selfhosted' || pdsProvider?.name === 'selfhosted-social';
  const atprotoLabel = isSelfHosted
    ? `Self-hosted ATProto (@${profile.handle})`
    : `${getPdsDisplayName(pdsProvider?.name ?? 'bluesky')} (@${profile.handle})`;

  const renderAccountRow = (acc: ExternalAccount) => {
    const platform = getPlatformInfo(acc.platform);
    const Icon = platform.icon;
    const displayLabel = acc.label ?? platform.label;
    const usesFavicon = acc.platform === 'website';
    const isVerified = acc.verified || acc.keytraceVerified;

    return (
      <div className="flex items-center gap-3">
        {usesFavicon ? (
          <Favicon url={acc.url} size={20} className="shrink-0 text-muted-foreground" />
        ) : (
          <Icon size={20} weight="fill" className="shrink-0 text-muted-foreground" />
        )}
        <a
          href={acc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-4 hover:underline"
        >
          {displayLabel}
        </a>
        {isVerified && (
          <VerificationPopover
            verified={acc.verified}
            verifiedVia={acc.verifiedVia}
            keytraceVerified={acc.keytraceVerified}
          />
        )}
        {acc.primary && !isOwnProfile && (
          <Star
            size={16}
            weight="fill"
            className="shrink-0 text-amber-500 dark:text-amber-400"
            aria-label={tEdit('primaryLink')}
          />
        )}
      </div>
    );
  };

  return (
    <section
      className="mt-8"
      aria-label={t('alsoFindOn', { name: profile.displayName ?? profile.handle })}
    >
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-semibold">
          {t('alsoFindOn', { name: profile.displayName ?? profile.handle })}
        </h2>
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
      {/* ATProto identity -- always shown, verified via AT Protocol */}
      <div className="mb-4 flex items-center gap-3">
        <PdsIcon
          provider={pdsProvider?.name ?? 'bluesky'}
          host={pdsProvider?.host}
          className="h-5 w-5 shrink-0 text-muted-foreground"
        />
        <a
          href={atprotoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-4 hover:underline"
        >
          {atprotoLabel}
        </a>
        <CheckCircle
          size={16}
          weight="fill"
          className="shrink-0 text-green-600 dark:text-green-400"
          aria-label={t('verified')}
        />
      </div>

      <EditableSection<ExternalAccount>
        sectionTitle={t('otherProfiles')}
        profileKey="externalAccounts"
        isOwnProfile={isOwnProfile}
        fields={externalAccountFields}
        editRequestKey="externalAccounts"
        toValues={externalAccountToValues}
        fromValues={
          valuesToExternalAccount as (
            v: Record<string, string | boolean>,
          ) => Omit<ExternalAccount, 'rkey'>
        }
        collection="id.sifa.profile.externalAccount"
        onPostSave={handlePostSave}
        onFieldChange={handleFieldChange}
        renderEntry={(acc, controls) => {
          // Keytrace-only entries: read-only, no edit/delete/primary, hide option for owner
          if (acc.source === 'keytrace') {
            const hideButton = isOwnProfile ? (
              <button
                type="button"
                onClick={() => void handleHideKeytrace(acc.rkey)}
                className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t('hideLink')}
                title={t('hideLink')}
              >
                <EyeSlash size={16} weight="regular" />
              </button>
            ) : undefined;

            return (
              <div className="flex items-center justify-between py-2">
                {renderAccountRow(acc)}
                {hideButton}
              </div>
            );
          }

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
              entryLabel={acc.label ?? getPlatformInfo(acc.platform).label}
              trailingContent={starToggle}
            >
              {renderAccountRow(acc)}
            </EditableEntry>
          );
        }}
      />
    </section>
  );
}
