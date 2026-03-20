'use client';

import { useState, lazy, Suspense, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, Info, ArrowsClockwise, Eye, Camera } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfileEdit } from '@/components/profile-edit-provider';
import {
  updateProfileSelf,
  refreshPds,
  uploadAvatar,
  deleteAvatarOverride,
  updateProfileOverride,
} from '@/lib/profile-api';
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
  { value: 'id.sifa.defs#mentoringOthers', labelKey: 'mentoringOthers' },
  { value: 'id.sifa.defs#beingMentored', labelKey: 'beingMentored' },
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
  hasDisplayNameOverride?: boolean;
  hasAvatarUrlOverride?: boolean;
  sourceDisplayName?: string;
  sourceAvatar?: string;
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
  hasDisplayNameOverride: initialHasDisplayNameOverride,
  hasAvatarUrlOverride: initialHasAvatarUrlOverride,
  sourceDisplayName: _sourceDisplayName,
  sourceAvatar,
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
  const [currentAvatar, setCurrentAvatar] = useState(avatar);
  const [editDisplayName, setEditDisplayName] = useState(displayName ?? '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [hasAvatarOverride, setHasAvatarOverride] = useState(initialHasAvatarUrlOverride ?? false);
  const [hasDisplayNameOvr, setHasDisplayNameOvr] = useState(
    initialHasDisplayNameOverride ?? false,
  );

  const handleRefreshPds = async () => {
    setRefreshing(true);
    try {
      const result = await refreshPds();
      if (result.success) {
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const result = await uploadAvatar(file);
      if (result.success && result.url) {
        setCurrentAvatar(result.url);
        setHasAvatarOverride(true);
        updateProfile({ avatar: result.url, hasAvatarUrlOverride: true });
        toast.success(t('saved'));
        void revalidateProfileCache(handle);
        if (did) void revalidateProfileCache(did);
      } else {
        toast.error(result.error ?? 'Upload failed');
      }
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    const result = await deleteAvatarOverride();
    if (result.success) {
      setCurrentAvatar(sourceAvatar);
      setHasAvatarOverride(false);
      updateProfile({ avatar: sourceAvatar, hasAvatarUrlOverride: false });
      toast.success(t('saved'));
      void revalidateProfileCache(handle);
      if (did) void revalidateProfileCache(did);
    } else {
      toast.error(result.error ?? 'Failed to remove avatar');
    }
  };

  const toggleOpenTo = (value: string) => {
    setOpenTo((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const togglePreferredWorkplace = (value: string) => {
    setPreferredWorkplace((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Save profile self fields (headline, about, location, etc.)
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

    if (!result.success) {
      setSaving(false);
      setError(result.error ?? tEditor('failedToSave'));
      return;
    }

    // Save displayName override if changed
    const displayNameChanged = editDisplayName !== (displayName ?? '');
    if (displayNameChanged) {
      const overrideResult = await updateProfileOverride({
        displayName: editDisplayName || null,
      });
      if (!overrideResult.success) {
        setSaving(false);
        setError(overrideResult.error ?? tEditor('failedToSave'));
        return;
      }
      setHasDisplayNameOvr(!!editDisplayName);
    }

    setSaving(false);
    trackEvent('profile-edit', { section: 'profile' });
    updateProfile({
      displayName: editDisplayName || undefined,
      headline: headline || undefined,
      about: about || undefined,
      location: locationValue ?? undefined,
      openTo: [...openTo],
      preferredWorkplace: [...preferredWorkplace],
      hasDisplayNameOverride: hasDisplayNameOvr,
    });
    toast.success(t('saved'));
    router.refresh();
    onClose();
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
          {/* Public data notice */}
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

          {/* Override scope notice */}
          <div
            className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30"
            role="note"
          >
            <Info
              className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400"
              weight="fill"
              aria-hidden="true"
            />
            <p className="text-xs text-blue-800 dark:text-blue-300">{t('overrideNotice')}</p>
          </div>

          {/* Avatar & Display Name */}
          <div>
            <span className="mb-2 block text-sm font-medium">{t('avatarAndName')}</span>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                {currentAvatar ? (
                  <Image
                    src={currentAvatar}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{(editDisplayName || '?').charAt(0).toUpperCase()}</span>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                >
                  <Camera className="h-5 w-5 text-white" weight="fill" aria-hidden="true" />
                  <span className="sr-only">{t('avatarUpload')}</span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  id="edit-displayName"
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder={t('displayNamePlaceholder')}
                  maxLength={256}
                  aria-label={t('displayName')}
                />
                <p className="text-xs text-muted-foreground">{t('avatarFormats')}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {hasAvatarOverride && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground"
                  onClick={handleRemoveAvatar}
                >
                  {t('avatarRemove')}
                </Button>
              )}
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
