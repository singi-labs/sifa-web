import { getTranslations } from 'next-intl/server';

interface Education {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
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
            <h3 className="font-medium">{edu.institution}</h3>
            {edu.degree && (
              <p className="text-sm text-muted-foreground">
                {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
              </p>
            )}
            {(edu.startDate || edu.endDate) && (
              <p className="text-xs text-muted-foreground">
                {edu.startDate} - {edu.endDate ?? 'Present'}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
