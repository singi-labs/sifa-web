'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry } from './timeline';
import type { ProfileVolunteering } from '@/lib/types';

interface VolunteeringSectionProps {
  volunteering: ProfileVolunteering[];
}

export function VolunteeringSection({ volunteering }: VolunteeringSectionProps) {
  const t = useTranslations('sections');

  if (!volunteering.length) return null;

  const sorted = [...volunteering].sort((a, b) => {
    const aDate = a.startDate ?? '0000';
    const bDate = b.startDate ?? '0000';
    return bDate.localeCompare(aDate);
  });

  return (
    <TimelineSection title={t('volunteering')}>
      {sorted.map((vol, i) => (
        <TimelineEntry
          key={vol.rkey}
          title={vol.role ?? vol.organization}
          subtitle={vol.role ? vol.organization : (vol.cause ?? '')}
          dateRange={formatVolDateRange(vol.startDate, vol.endDate)}
          description={vol.description}
          isLast={i === sorted.length - 1}
        />
      ))}
    </TimelineSection>
  );
}

function formatVolDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  if (!start) return end ?? '';
  if (!end) return `${start} - Present`;
  return `${start} - ${end}`;
}
