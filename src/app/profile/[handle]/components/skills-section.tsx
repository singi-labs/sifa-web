interface Skill {
  skillName: string;
  category?: string;
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills?.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Skills</h2>
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
