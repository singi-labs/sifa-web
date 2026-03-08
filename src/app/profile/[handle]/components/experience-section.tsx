interface Position {
  companyName: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export function ExperienceSection({ positions }: { positions: Position[] }) {
  if (!positions?.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Experience</h2>
      <div className="mt-4 space-y-4">
        {positions.map((pos, i) => (
          <div key={i} className="border-l-2 border-border pl-4">
            <h3 className="font-medium">{pos.title}</h3>
            <p className="text-sm text-muted-foreground">{pos.companyName}</p>
            <p className="text-xs text-muted-foreground">
              {pos.startDate} - {pos.current ? 'Present' : pos.endDate}
            </p>
            {pos.description && <p className="mt-1 text-sm">{pos.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
