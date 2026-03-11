'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry } from './timeline';
import { EditableSection, EditableEntry } from '@/components/profile-editor';
import {
  POSITION_FIELDS,
  positionToValues,
  valuesToPosition,
} from '@/components/profile-editor/position-form';
import type { ProfilePosition } from '@/lib/types';

interface CareerSectionProps {
  positions: ProfilePosition[];
  isOwnProfile?: boolean;
}

export function CareerSection({ positions, isOwnProfile }: CareerSectionProps) {
  const t = useTranslations('sections');

  if (!positions.length && !isOwnProfile) return null;

  return (
    <TimelineSection title={t('career')}>
      <EditableSection<ProfilePosition>
        sectionTitle={t('career')}
        profileKey="positions"
        isOwnProfile={isOwnProfile}
        fields={POSITION_FIELDS}
        toValues={positionToValues}
        fromValues={
          valuesToPosition as (v: Record<string, string | boolean>) => Omit<ProfilePosition, 'rkey'>
        }
        collection="id.sifa.profile.position"
        renderEntry={(pos, controls) => (
          <EditableEntry
            key={pos.rkey}
            isOwnProfile={isOwnProfile}
            onEdit={controls?.onEdit ?? (() => {})}
            onDelete={controls?.onDelete ?? (() => {})}
            entryLabel={`${pos.title} at ${pos.companyName}`}
          >
            <TimelineEntry
              title={pos.title}
              subtitle={pos.companyName}
              dateRange={formatDateRange(pos.startDate, pos.endDate, pos.current)}
              description={pos.description}
              isLast={false}
            />
          </EditableEntry>
        )}
      />
    </TimelineSection>
  );
}

function formatDateRange(start: string, end?: string, current?: boolean): string {
  const s = formatDate(start);
  if (current) return `${s} - Present`;
  if (end) return `${s} - ${formatDate(end)}`;
  return s;
}

function formatDate(dateStr: string): string {
  if (dateStr.length === 4) return dateStr;
  const [year, month] = dateStr.split('-');
  if (!month) return year ?? dateStr;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const idx = parseInt(month, 10) - 1;
  return `${months[idx]} ${year}`;
}
