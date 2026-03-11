'use client';

import { useTranslations } from 'next-intl';
import { TimelineSection, TimelineEntry } from './timeline';
import { EditableSection, EditableEntry, EDUCATION_FIELDS } from '@/components/profile-editor';
import {
  educationToValues,
  valuesToEducation,
} from '@/components/profile-editor/section-converters';
import type { ProfileEducation, ProfileCourse } from '@/lib/types';

interface EducationSectionProps {
  education: ProfileEducation[];
  courses?: ProfileCourse[];
  isOwnProfile?: boolean;
}

export function EducationSection({ education, courses = [], isOwnProfile }: EducationSectionProps) {
  const t = useTranslations('sections');

  if (!education.length && !isOwnProfile) return null;

  return (
    <TimelineSection title={t('education')}>
      <EditableSection<ProfileEducation>
        sectionTitle={t('education')}
        profileKey="education"
        isOwnProfile={isOwnProfile}
        fields={EDUCATION_FIELDS}
        toValues={educationToValues}
        fromValues={
          valuesToEducation as (
            v: Record<string, string | boolean>,
          ) => Omit<ProfileEducation, 'rkey'>
        }
        collection="id.sifa.profile.education"
        renderEntry={(edu, controls) => {
          const subtitle = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
          const dateRange = formatEduDateRange(edu.startDate, edu.endDate);
          const relatedCourses = courses.filter((c) => c.institution === edu.institution);

          return (
            <EditableEntry
              key={edu.rkey}
              isOwnProfile={isOwnProfile}
              onEdit={controls?.onEdit ?? (() => {})}
              onDelete={controls?.onDelete ?? (() => {})}
              entryLabel={edu.institution}
            >
              <TimelineEntry
                title={edu.institution}
                subtitle={subtitle || t('educationEntry')}
                dateRange={dateRange}
                isLast={false}
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
            </EditableEntry>
          );
        }}
      />
    </TimelineSection>
  );
}

function formatEduDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  if (!start) return end ?? '';
  if (!end) return `${start} - Present`;
  return `${start} - ${end}`;
}
