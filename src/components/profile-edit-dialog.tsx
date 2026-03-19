'use client';

import { useState, lazy, Suspense, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, Info, ArrowsClockwise, Eye } from '@phosphor-icons/react';
// @base-ui/react v1.2.0: Popover.Positioner MUST be inside Popover.Portal or it throws at runtime
import { Popover } from '@base-ui/react/popover';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfileEdit } from '@/components/profile-edit-provider';
import { updateProfileSelf, refreshPds } from '@/lib/profile-api';
import { revalidateProfileCache } from '@/app/actions';
import { LocationSearch } from '@/components/location-search';
import type { LocationValue } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

const PlateMarkdownEditor = lazy(() =>
  import('@/components/plate-editor/plate-markdown-editor').then((mod) => ({
    default: mod.PlateMarkdownEditor,
  })),
);

const OPEN_TO_OPTIONS = [
  { value: 'id.sifa.defs#fullTimeRoles', labelKey: 'fullTimeRoles' },
  { value: 'id.sifa.defs#partTimeRoles', labelKey: 'partTimeRoles' },
  { value: 'id.sifa.defs#contractRoles', labelKey: 'contractRoles' },
  { value: 'id.sifa.defs#boardPositions', labelKey: 'boardPositions' },
  { value: 'id.sifa.defs#mentoring', labelKey: 'mentoring' },
  { value: 'id.sifa.defs#collaborations', labelKey: 'collaborations' },
] as const;

const PREFERRED_WORKPLACE_OPTIONS = [
  { value: 'id.sifa.defs#onSite', labelKey: 'onSite' },
  { value: 'id.sifa.defs#remote', labelKey: 'remote' },
  { value: 'id.sifa.defs#hybrid', labelKey: 'hybrid' },
] as const;

interface ProfileEditDialogProps {
  handle: string;
  did?: string;
  displayName?: string;
  avatar?: string;
  headline?: string;
  about?: string;
  location?: LocationValue | null;
  openTo?: string[];
  preferredWorkplace?: string[];
  onClose: () => void;
}

export function ProfileEditDialog({
  handle,
  did,
  displayName,
  avatar,
  headline: initialHeadline,
  about: initialAbout,
  location: initialLocation,
  openTo: initialOpenTo,
  preferredWorkplace: initialPreferredWorkplace,
  onClose,
}: ProfileEditDialogProps) {
  const t = useTranslations('profileEdit');
  const tEditor = useTranslations('editor');
  const router = useRouter();
  const { updateProfile } = useProfileEdit();

  const [headline, setHeadline] = useState(initialHeadline ?? '');
  const [about, setAbout] = useState(initialAbout ?? '');
  const [locationValue, setLocationValue] = useState<LocationValue | null>(initialLocation ?? null);
  const [openTo, setOpenTo] = useState<Set<string>>(new Set(initialOpenTo ?? []));
  const [preferredWorkplace, setPreferredWorkplace] = useState<Set<string>>(
    new Set(initialPreferredWorkplace ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState(displayName);
  const [currentAvatar, setCurrentAvatar] = useState(avatar);

  const handleRefreshPds = async () => {
    setRefreshing(true);
    try {
      const result = await refreshPds();
      if (result.success) {
        if (result.displayName !== undefined)
          setCurrentDisplayName(result.displayName ?? undefined);
        if (result.avatar !== undefined) setCurrentAvatar(result.avatar ?? undefined);
        toast.success(t('refreshPdsSuccess'));
        void revalidateProfileCache(handle);
        if (did) void revalidateProfileCache(did);
        router.refresh();
      } else {
        toast.error(t('refreshPdsFailed'));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const toggleOpenTo = (value: string) => {
    setOpenTo((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const togglePreferredWorkplace = (value: string) => {
    setPreferredWorkplace((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await updateProfileSelf({
      headline: headline || undefined,
      about: about || undefined,
      location: locationValue
        ? {
            country: locationValue.country,
            countryCode: locationValue.countryCode,
            region: locationValue.region,
            city: locationValue.city,
          }
        : undefined,
      openTo: [...openTo],
      preferredWorkplace: [...preferredWorkplace],
    });

    setSaving(false);
    if (result.success) {
      trackEvent('profile-edit');
      updateProfile({
        headline: headline || undefined,
        about: about || undefined,
        location: locationValue ?? undefined,
        openTo: [...openTo],
        preferredWorkplace: [...preferredWorkplace],
      });
      toast.success(t('saved'));
      router.refresh();
      onClose();
    } else {
      setError(result.error ?? tEditor('failedToSave'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-label={t('title')}
      aria-modal="true"
    >
      <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
            aria-label={tEditor('close')}
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30"
            role="note"
          >
            <Eye
              className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
              weight="fill"
              aria-hidden="true"
            />
            <p className="text-xs text-amber-800 dark:text-amber-300">{t('publicDataNotice')}</p>
          </div>

          {/* Avatar & Display Name — read-only, synced from AT Protocol profile */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="block text-sm font-medium">{t('avatarAndName')}</span>
              <Popover.Root>
                <Popover.Trigger
                  className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t('pdsFieldInfo')}
                >
                  <Info className="h-3.5 w-3.5" weight="bold" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={8}>
                    <Popover.Popup className="z-[9999] w-72 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
                      <Popover.Arrow className="fill-popover stroke-border" />
                      <p className="text-muted-foreground">{t('pdsExplanation')}</p>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                {currentAvatar ? (
                  <Image
                    src={currentAvatar}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">
                    {(currentDisplayName ?? '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <Input
                id="edit-displayName"
                type="text"
                value={currentDisplayName ?? ''}
                disabled
                className="bg-muted text-muted-foreground"
                aria-label={t('displayName')}
              />
            </div>
            <div className="mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground"
                onClick={handleRefreshPds}
                disabled={refreshing}
              >
                <ArrowsClockwise
                  className={`h-3.5 w-3.5${refreshing ? ' animate-spin' : ''}`}
                  weight="bold"
                  aria-hidden="true"
                />
                {t('refreshPds')}
              </Button>
            </div>
          </div>

          {/* Headline */}
          <div>
            <label htmlFor="edit-headline" className="mb-1 block text-sm font-medium">
              {t('headline')}
            </label>
            <Input
              id="edit-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={t('headlinePlaceholder')}
              maxLength={120}
            />
          </div>

          {/* About */}
          <div>
            <label htmlFor="edit-about" className="mb-1 block text-sm font-medium">
              {t('about')}
            </label>
            <Suspense
              fallback={
                <textarea
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  rows={8}
                  disabled
                  placeholder="Loading editor..."
                />
              }
            >
              <PlateMarkdownEditor
                id="edit-about"
                value={about}
                onChange={setAbout}
                placeholder={t('aboutPlaceholder')}
                aria-label={t('about')}
              />
            </Suspense>
          </div>

          {/* Location */}
          <div>
            <span className="mb-1 block text-sm font-medium">{t('location')}</span>
            <LocationSearch id="edit-location" value={locationValue} onChange={setLocationValue} />
          </div>

          {/* Open To */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t('openTo')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {OPEN_TO_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={openTo.has(option.value)}
                    onChange={() => toggleOpenTo(option.value)}
                  />
                  {t(option.labelKey)}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Preferred Workplace */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t('preferredWorkplace')}</legend>
            <div className="flex gap-4">
              {PREFERRED_WORKPLACE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={preferredWorkplace.has(option.value)}
                    onChange={() => togglePreferredWorkplace(option.value)}
                  />
                  {t(option.labelKey)}
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              {tEditor('cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? tEditor('saving') : tEditor('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
