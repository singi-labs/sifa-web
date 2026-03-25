import { getTranslations } from 'next-intl/server';
import { sanitize } from '@/lib/sanitize';

interface Position {
  company: string;
  title: string;
  description?: string;
  startedAt: string;
  endedAt?: string;
}

export async function ExperienceSection({ positions }: { positions: Position[] }) {
  if (!positions?.length) return null;

  const t = await getTranslations('profile');

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{t('experience')}</h2>
      <div className="mt-4 space-y-4">
        {positions.map((pos, i) => (
          <div key={i} className="border-l-2 border-border pl-4">
            <h3 className="font-medium">{sanitize(pos.title)}</h3>
            <p className="text-sm text-muted-foreground">{sanitize(pos.company)}</p>
            <p className="text-xs text-muted-foreground">
              {pos.startedAt} - {pos.endedAt ?? 'Present'}
            </p>
            {pos.description && <p className="mt-1 text-sm">{sanitize(pos.description)}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
