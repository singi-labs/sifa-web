'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PencilSimple } from '@phosphor-icons/react';
import { sanitize } from '@/lib/sanitize';
import { Button } from '@/components/ui/button';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
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
  const { profile } = useProfileEdit();

  if (!about && !isOwnProfile) return null;

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
          <ProfileEditDialog
            handle={profile.handle}
            did={profile.did}
            displayName={profile.displayName}
            avatar={profile.avatar}
            headline={profile.headline}
            about={profile.about}
            location={profile.location}
            openTo={profile.openTo}
            preferredWorkplace={profile.preferredWorkplace}
            onClose={() => setEditing(false)}
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
          className="mt-2 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {expanded ? t('readLess') : t('readMore')}
        </button>
      )}
      {editing && (
        <ProfileEditDialog
          handle={profile.handle}
          did={profile.did}
          displayName={profile.displayName}
          avatar={profile.avatar}
          headline={profile.headline}
          about={profile.about}
          location={profile.location}
          openTo={profile.openTo}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  );
}
