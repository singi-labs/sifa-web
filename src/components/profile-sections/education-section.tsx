'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry } from './timeline';
import type { ProfileEducation, ProfileCourse } from '@/lib/types';

interface EducationSectionProps {
  education: ProfileEducation[];
  courses?: ProfileCourse[];
}

export function EducationSection({ education, courses = [] }: EducationSectionProps) {
  const t = useTranslations('sections');

  if (!education.length) return null;

  const sorted = [...education].sort((a, b) => {
    const aDate = a.startDate ?? '0000';
    const bDate = b.startDate ?? '0000';
    return bDate.localeCompare(aDate);
  });

  return (
    <TimelineSection title={t('education')}>
      {sorted.map((edu, i) => {
        const subtitle = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
        const dateRange = formatEduDateRange(edu.startDate, edu.endDate);
        const relatedCourses = courses.filter((c) => c.institution === edu.institution);

        return (
          <TimelineEntry
            key={edu.rkey}
            title={edu.institution}
            subtitle={subtitle || t('educationEntry')}
            dateRange={dateRange}
            isLast={i === sorted.length - 1}
          >
            {relatedCourses.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium">{t('courses')}</p>
                <ul className="mt-1 list-inside list-disc text-xs">
                  {relatedCourses.map((course) => (
                    <li key={course.rkey}>
                      {course.number ? `${course.number}: ` : ''}
                      {course.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TimelineEntry>
        );
      })}
    </TimelineSection>
  );
}

function formatEduDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  if (!start) return end ?? '';
  if (!end) return `${start} - Present`;
  return `${start} - ${end}`;
}
