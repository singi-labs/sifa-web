'use client';

import { useState, type ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PencilSimple } from '@phosphor-icons/react';
import { sanitize } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProfileEditDialog } from '@/components/profile-edit-dialog';
import { useProfileEdit } from '@/components/profile-edit-provider';

const COLLAPSE_THRESHOLD = 300;

interface AboutSectionProps {
  about: string;
  isOwnProfile?: boolean;
}

/** Open links in new tab with safe rel attributes. */
function MarkdownLink(props: ComponentProps<'a'>) {
  // eslint-disable-next-line jsx-a11y/anchor-has-content -- children are passed via spread props from react-markdown
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
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

  // Strip any raw HTML from the source before markdown rendering
  const cleaned = sanitize(about);
  const isLong = cleaned.length > COLLAPSE_THRESHOLD;

  return (
    <section className="mt-6" aria-label={t('about')}>
      <div className="group/about relative">
        <div
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none overflow-hidden text-base leading-relaxed text-foreground transition-[max-height] duration-200 ease-in-out prose-a:text-primary prose-a:underline prose-a:underline-offset-4',
            isLong && !expanded && 'max-h-[4.5rem]',
            isLong && expanded && 'max-h-[200rem]',
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink }}>
            {cleaned}
          </ReactMarkdown>
        </div>
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
