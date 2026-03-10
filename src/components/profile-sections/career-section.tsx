'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry } from './timeline';
import type { ProfilePosition } from '@/lib/types';

interface CareerSectionProps {
  positions: ProfilePosition[];
}

export function CareerSection({ positions }: CareerSectionProps) {
  const t = useTranslations('sections');

  if (!positions.length) return null;

  const sorted = [...positions].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <TimelineSection title={t('career')}>
      {sorted.map((pos, i) => (
        <TimelineEntry
          key={pos.rkey}
          title={pos.title}
          subtitle={pos.companyName}
          dateRange={formatDateRange(pos.startDate, pos.endDate, pos.current)}
          description={pos.description}
          isLast={i === sorted.length - 1}
        />
      ))}
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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = parseInt(month, 10) - 1;
  return `${months[idx]} ${year}`;
}
