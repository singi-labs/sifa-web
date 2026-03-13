'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, Info } from '@phosphor-icons/react';
import { Popover } from '@base-ui/react/popover';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfileSelf } from '@/lib/profile-api';

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
  headline?: string;
  about?: string;
  location?: string;
  website?: string;
  openTo?: string[];
  onClose: () => void;
}

export function ProfileEditDialog({
  displayName,
  headline: initialHeadline,
  about: initialAbout,
  location: initialLocation,
  website: initialWebsite,
  openTo: initialOpenTo,
  onClose,
}: ProfileEditDialogProps) {
  const t = useTranslations('profileEdit');
  const tEditor = useTranslations('editor');
  const router = useRouter();

  const [headline, setHeadline] = useState(initialHeadline ?? '');
  const [about, setAbout] = useState(initialAbout ?? '');
  const [location, setLocation] = useState(initialLocation ?? '');
  const [website, setWebsite] = useState(initialWebsite ?? '');
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
      location: location || undefined,
      website: website || undefined,
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
                    <Popover.Popup className="z-[60] w-72 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
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
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={t('aboutPlaceholder')}
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="edit-location" className="mb-1 block text-sm font-medium">
              {t('location')}
            </label>
            <Input
              id="edit-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('locationPlaceholder')}
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="edit-website" className="mb-1 block text-sm font-medium">
              {t('website')}
            </label>
            <Input
              id="edit-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={t('websitePlaceholder')}
            />
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
