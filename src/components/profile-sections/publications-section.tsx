'use client';

import { useTranslations } from 'next-intl';
import { EditableSection, EditableEntry, PUBLICATION_FIELDS } from '@/components/profile-editor';
import { publicationToValues, valuesToPublication } from '@/components/profile-editor/section-converters';
import type { ProfilePublication } from '@/lib/types';

interface PublicationsSectionProps {
  publications: ProfilePublication[];
  isOwnProfile?: boolean;
}

export function PublicationsSection({ publications, isOwnProfile }: PublicationsSectionProps) {
  const t = useTranslations('sections');

  if (!publications.length && !isOwnProfile) return null;

  return (
    <section className="mt-8" aria-label={t('publications')}>
      <h2 className="mb-4 text-xl font-semibold">{t('publications')}</h2>
      <EditableSection<ProfilePublication>
        sectionTitle={t('publications')}
        profileKey="publications"
        isOwnProfile={isOwnProfile}
        fields={PUBLICATION_FIELDS}
        toValues={publicationToValues}
        fromValues={valuesToPublication as (v: Record<string, string | boolean>) => Omit<ProfilePublication, 'rkey'>}
        collection="id.sifa.profile.publication"
        renderEntry={(pub, controls) => (
          <EditableEntry
            key={pub.rkey}
            isOwnProfile={isOwnProfile}
            onEdit={controls?.onEdit ?? (() => {})}
            onDelete={controls?.onDelete ?? (() => {})}
            entryLabel={pub.title}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {pub.url ? (
                    <a
                      href={pub.url}
                      className="underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {pub.title}
                    </a>
                  ) : (
                    pub.title
                  )}
                </p>
                {pub.publisher && <p className="text-sm text-muted-foreground">{pub.publisher}</p>}
              </div>
              {pub.date && <span className="shrink-0 text-xs text-muted-foreground">{pub.date}</span>}
            </div>
          </EditableEntry>
        )}
      />
    </section>
  );
}
