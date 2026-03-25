import { getTranslations } from 'next-intl/server';
import { PublicSkillChips } from './public-skill-chips';

interface Skill {
  name: string;
  category?: string;
  endorsed?: boolean;
  activityBacked?: boolean;
}

export async function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills?.length) return null;

  const t = await getTranslations('profile');

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{t('skills')}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <PublicSkillChips skills={skills} />
      </div>
    </section>
  );
}
