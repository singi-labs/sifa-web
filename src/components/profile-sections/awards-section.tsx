'use client';

import { useTranslations } from 'next-intl';
import { EditableSection, EditableEntry, HONOR_FIELDS } from '@/components/profile-editor';
import { honorToValues, valuesToHonor } from '@/components/profile-editor/section-converters';
import { formatTimelineDate } from './timeline';
import { sortByDateDesc, singleDateExtractor } from '@/lib/sort-by-date';
import type { ProfileHonor } from '@/lib/types';

interface AwardsSectionProps {
  honors: ProfileHonor[];
  isOwnProfile?: boolean;
}

export function AwardsSection({ honors, isOwnProfile }: AwardsSectionProps) {
  const t = useTranslations('sections');

  if (!honors.length && !isOwnProfile) return null;

  return (
    <section className="mt-8" aria-label={t('awards')}>
      <h2 className="mb-4 text-xl font-semibold">{t('awards')}</h2>
      <EditableSection<ProfileHonor>
        sectionTitle={t('awards')}
        profileKey="honors"
        isOwnProfile={isOwnProfile}
        fields={HONOR_FIELDS}
        toValues={honorToValues}
        fromValues={
          valuesToHonor as (v: Record<string, string | boolean>) => Omit<ProfileHonor, 'rkey'>
        }
        collection="id.sifa.profile.honor"
        sortItems={(items) => sortByDateDesc(items, singleDateExtractor)}
        renderEntry={(honor, controls) => (
          <EditableEntry
            key={honor.rkey}
            isOwnProfile={isOwnProfile}
            onEdit={controls?.onEdit ?? (() => {})}
            onDelete={controls?.onDelete ?? (() => {})}
            entryLabel={honor.title}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{honor.title}</p>
                {honor.issuer && <p className="text-sm text-muted-foreground">{honor.issuer}</p>}
              </div>
              {honor.date && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatTimelineDate(honor.date)}
                </span>
              )}
            </div>
          </EditableEntry>
        )}
      />
    </section>
  );
}
