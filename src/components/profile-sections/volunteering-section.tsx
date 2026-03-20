'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry, formatTimelineDate } from './timeline';
import { EditableSection, EditableEntry, VOLUNTEERING_FIELDS } from '@/components/profile-editor';
import {
  volunteeringToValues,
  valuesToVolunteering,
} from '@/components/profile-editor/section-converters';
import { sortByDateDesc, dateRangeExtractor } from '@/lib/sort-by-date';
import type { ProfileVolunteering } from '@/lib/types';

interface VolunteeringSectionProps {
  volunteering: ProfileVolunteering[];
  isOwnProfile?: boolean;
}

export function VolunteeringSection({ volunteering, isOwnProfile }: VolunteeringSectionProps) {
  const t = useTranslations('sections');

  if (!volunteering.length && !isOwnProfile) return null;

  return (
    <TimelineSection title={t('volunteering')} itemCount={volunteering.length}>
      <EditableSection<ProfileVolunteering>
        sectionTitle={t('volunteering')}
        profileKey="volunteering"
        isOwnProfile={isOwnProfile}
        fields={VOLUNTEERING_FIELDS}
        toValues={volunteeringToValues}
        fromValues={
          valuesToVolunteering as (
            v: Record<string, string | boolean>,
          ) => Omit<ProfileVolunteering, 'rkey'>
        }
        collection="id.sifa.profile.volunteering"
        maxVisible={3}
        sortItems={(items) => sortByDateDesc(items, dateRangeExtractor)}
        renderEntry={(vol, controls) => (
          <EditableEntry
            key={vol.rkey}
            isOwnProfile={isOwnProfile}
            onEdit={controls?.onEdit ?? (() => {})}
            onDelete={controls?.onDelete ?? (() => {})}
            entryLabel={vol.role ?? vol.organization}
          >
            <TimelineEntry
              title={vol.role ?? vol.organization}
              subtitle={vol.role ? vol.organization : (vol.cause ?? '')}
              dateRange={formatVolDateRange(vol.startDate, vol.endDate)}
              description={vol.description}
              isLast={false}
            />
          </EditableEntry>
        )}
      />
    </TimelineSection>
  );
}

function formatVolDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  if (!start) return end ? formatTimelineDate(end) : '';
  if (!end) return `${formatTimelineDate(start)} - Present`;
  return `${formatTimelineDate(start)} - ${formatTimelineDate(end)}`;
}
