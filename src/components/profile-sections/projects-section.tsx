'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry, formatTimelineDate } from './timeline';
import { EditableSection, EditableEntry, PROJECT_FIELDS } from '@/components/profile-editor';
import { projectToValues, valuesToProject } from '@/components/profile-editor/section-converters';
import { sortByDateDesc, dateRangeExtractor } from '@/lib/sort-by-date';
import type { ProfileProject } from '@/lib/types';

interface ProjectsSectionProps {
  projects: ProfileProject[];
  isOwnProfile?: boolean;
}

export function ProjectsSection({ projects, isOwnProfile }: ProjectsSectionProps) {
  const t = useTranslations('sections');

  if (!projects.length && !isOwnProfile) return null;

  return (
    <TimelineSection title={t('projects')}>
      <EditableSection<ProfileProject>
        sectionTitle={t('projects')}
        profileKey="projects"
        isOwnProfile={isOwnProfile}
        fields={PROJECT_FIELDS}
        toValues={projectToValues}
        fromValues={
          valuesToProject as (v: Record<string, string | boolean>) => Omit<ProfileProject, 'rkey'>
        }
        collection="id.sifa.profile.project"
        sortItems={(items) => sortByDateDesc(items, dateRangeExtractor)}
        renderEntry={(proj, controls) => (
          <EditableEntry
            key={proj.rkey}
            isOwnProfile={isOwnProfile}
            onEdit={controls?.onEdit ?? (() => {})}
            onDelete={controls?.onDelete ?? (() => {})}
            entryLabel={proj.name}
          >
            <TimelineEntry
              title={proj.name}
              subtitle={proj.url ? proj.url.replace(/^https?:\/\/(www\.)?/, '') : ''}
              dateRange={formatProjectDateRange(proj.startDate, proj.endDate)}
              description={proj.description}
              isLast={false}
            />
          </EditableEntry>
        )}
      />
    </TimelineSection>
  );
}

function formatProjectDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  if (!start) return end ? formatTimelineDate(end) : '';
  if (!end) return formatTimelineDate(start);
  return `${formatTimelineDate(start)} - ${formatTimelineDate(end)}`;
}
