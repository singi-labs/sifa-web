import { getTranslations } from 'next-intl/server';
import { sanitize } from '@/lib/sanitize';

interface Position {
  companyName: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
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
            <p className="text-sm text-muted-foreground">{sanitize(pos.companyName)}</p>
            <p className="text-xs text-muted-foreground">
              {pos.startDate} - {pos.current ? 'Present' : pos.endDate}
            </p>
            {pos.description && <p className="mt-1 text-sm">{sanitize(pos.description)}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
