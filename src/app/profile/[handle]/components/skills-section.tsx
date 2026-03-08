import { getTranslations } from 'next-intl/server';

interface Skill {
  skillName: string;
  category?: string;
}

export async function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills?.length) return null;

  const t = await getTranslations('profile');

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{t('skills')}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span key={i} className="rounded-full border border-border px-3 py-1 text-sm">
            {skill.skillName}
          </span>
        ))}
      </div>
    </section>
  );
}
