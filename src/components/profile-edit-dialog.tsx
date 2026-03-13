'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, Info } from '@phosphor-icons/react';
import { Popover } from '@base-ui/react/popover';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfileSelf } from '@/lib/profile-api';
import {
  LocationSearch,
  parseLocationString,
  type LocationValue,
} from '@/components/location-search';

const OPEN_TO_OPTIONS = [
  { value: 'id.sifa.defs#fullTimeRoles', labelKey: 'fullTimeRoles' },
  { value: 'id.sifa.defs#partTimeRoles', labelKey: 'partTimeRoles' },
  { value: 'id.sifa.defs#contractRoles', labelKey: 'contractRoles' },
  { value: 'id.sifa.defs#boardPositions', labelKey: 'boardPositions' },
  { value: 'id.sifa.defs#mentoring', labelKey: 'mentoring' },
  { value: 'id.sifa.defs#collaborations', labelKey: 'collaborations' },
] as const;

interface ProfileEditDialogProps {
  displayName?: string;
  avatar?: string;
  headline?: string;
  about?: string;
  location?: string;
  openTo?: string[];
  onClose: () => void;
}

export function ProfileEditDialog({
  displayName,
  avatar,
  headline: initialHeadline,
  about: initialAbout,
  location: initialLocation,
  openTo: initialOpenTo,
  onClose,
}: ProfileEditDialogProps) {
  const t = useTranslations('profileEdit');
  const tEditor = useTranslations('editor');
  const router = useRouter();

  const [headline, setHeadline] = useState(initialHeadline ?? '');
  const [about, setAbout] = useState(initialAbout ?? '');
  const [locationValue, setLocationValue] = useState<LocationValue | null>(
    initialLocation ? parseLocationString(initialLocation) : null,
  );
  const [openTo, setOpenTo] = useState<Set<string>>(new Set(initialOpenTo ?? []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            ...(locationValue.region ? { region: locationValue.region } : {}),
            ...(locationValue.city ? { city: locationValue.city } : {}),
          }
        : undefined,
      openTo: [...openTo],
    });

    setSaving(false);
    if (result.success) {
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
          {/* Avatar — read-only with PDS explanation */}
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="block text-sm font-medium">{t('avatar')}</span>
              <Popover.Root>
                <Popover.Trigger
                  className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t('pdsFieldInfo')}
                >
                  <Info className="h-3.5 w-3.5" weight="bold" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={8}>
                    <Popover.Popup className="z-[100] w-72 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
                      <Popover.Arrow className="fill-popover stroke-border" />
                      <p className="text-muted-foreground">{t('pdsExplanation')}</p>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{(displayName ?? '?').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          {/* Display Name — read-only with PDS explanation */}
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <label htmlFor="edit-displayName" className="block text-sm font-medium">
                {t('displayName')}
              </label>
              <Popover.Root>
                <Popover.Trigger
                  className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t('pdsFieldInfo')}
                >
                  <Info className="h-3.5 w-3.5" weight="bold" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={8}>
                    <Popover.Popup className="z-[100] w-72 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
                      <Popover.Arrow className="fill-popover stroke-border" />
                      <p className="text-muted-foreground">{t('pdsExplanation')}</p>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>
            <Input
              id="edit-displayName"
              type="text"
              value={displayName ?? ''}
              disabled
              className="bg-muted text-muted-foreground"
            />
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
            <textarea
              id="edit-about"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={8}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={t('aboutPlaceholder')}
            />
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
