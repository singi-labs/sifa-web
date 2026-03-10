'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry } from './timeline';
import type { ProfileProject } from '@/lib/types';

interface ProjectsSectionProps {
  projects: ProfileProject[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const t = useTranslations('sections');

  if (!projects.length) return null;

  const sorted = [...projects].sort((a, b) => {
    const aDate = a.startDate ?? '0000';
    const bDate = b.startDate ?? '0000';
    return bDate.localeCompare(aDate);
  });

  return (
    <TimelineSection title={t('projects')}>
      {sorted.map((proj, i) => (
        <TimelineEntry
          key={proj.rkey}
          title={proj.name}
          subtitle={proj.url ? proj.url.replace(/^https?:\/\//, '') : ''}
          dateRange={formatProjectDateRange(proj.startDate, proj.endDate)}
          description={proj.description}
          isLast={i === sorted.length - 1}
        />
      ))}
    </TimelineSection>
  );
}

function formatProjectDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  if (!start) return end ?? '';
  if (!end) return start;
  return `${start} - ${end}`;
}
