import { getTranslations } from 'next-intl/server';
import { sanitize } from '@/lib/sanitize';

interface Education {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startedAt?: string;
  endedAt?: string;
}

export async function EducationSection({ education }: { education: Education[] }) {
  if (!education?.length) return null;

  const t = await getTranslations('profile');

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{t('education')}</h2>
      <div className="mt-4 space-y-4">
        {education.map((edu, i) => (
          <div key={i} className="border-l-2 border-border pl-4">
            <h3 className="font-medium">{sanitize(edu.institution)}</h3>
            {edu.degree && (
              <p className="text-sm text-muted-foreground">
                {sanitize(edu.degree)}
                {edu.fieldOfStudy ? `, ${sanitize(edu.fieldOfStudy)}` : ''}
              </p>
            )}
            {(edu.startedAt || edu.endedAt) && (
              <p className="text-xs text-muted-foreground">
                {edu.startedAt} - {edu.endedAt ?? 'Present'}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
