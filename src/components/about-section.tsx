'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { sanitize } from '@/lib/sanitize';
import { Button } from '@/components/ui/button';
import { EditDialog } from '@/components/profile-editor/edit-dialog';
import { ABOUT_FIELDS, profileToAboutValues } from '@/components/profile-editor/about-form';
import { updateProfileSelf } from '@/lib/profile-api';
import { useProfileEdit } from '@/components/profile-edit-provider';

const COLLAPSE_THRESHOLD = 300;

interface AboutSectionProps {
  about: string;
  isOwnProfile?: boolean;
}

export function AboutSection({ about, isOwnProfile }: AboutSectionProps) {
  const t = useTranslations('profile');
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const { profile, updateProfile } = useProfileEdit();

  if (!about && !isOwnProfile) return null;

  const handleSave = async (
    values: Record<string, string | boolean>,
  ): Promise<{ success: boolean; error?: string }> => {
    const data = {
      headline: (values.headline as string) || undefined,
      about: (values.about as string) || undefined,
      location: (values.location as string) || undefined,
      website: (values.website as string) || undefined,
    };
    const result = await updateProfileSelf(data);
    if (result.success) {
      updateProfile(data);
      setEditing(false);
      toast.success('Profile updated');
    }
    return result;
  };

  if (!about && isOwnProfile) {
    return (
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{t('addAbout')}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setEditing(true)}
            aria-label={t('editAbout')}
          >
            <PencilSimple className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
          </Button>
        </div>
        {editing && (
          <EditDialog
            title="Edit Profile"
            fields={ABOUT_FIELDS}
            initialValues={profileToAboutValues(profile)}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        )}
      </section>
    );
  }

  const sanitized = sanitize(about);
  const isLong = sanitized.length > COLLAPSE_THRESHOLD;
  const displayText =
    isLong && !expanded ? sanitized.slice(0, COLLAPSE_THRESHOLD) + '...' : sanitized;

  return (
    <section className="mt-6" aria-label={t('about')}>
      <div className="group/about relative">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
          {displayText}
        </p>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-2 top-0 h-7 w-7 p-0 opacity-0 transition-opacity group-hover/about:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-60"
            onClick={() => setEditing(true)}
            aria-label={t('editAbout')}
          >
            <PencilSimple className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
          </Button>
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {expanded ? t('readLess') : t('readMore')}
        </button>
      )}
      {editing && (
        <EditDialog
          title="Edit Profile"
          fields={ABOUT_FIELDS}
          initialValues={profileToAboutValues(profile)}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </section>
  );
}
