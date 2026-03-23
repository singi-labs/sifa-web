import Link from 'next/link';

interface InsightsNavProps {
  slug: string;
  activeTab: 'people' | 'insights';
  attendeeCount?: number;
}

export function InsightsNav({ slug, activeTab, attendeeCount }: InsightsNavProps) {
  const basePath = `/events/${slug}`;

  return (
    <nav
      aria-label="Event views"
      className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex max-w-6xl gap-6">
        <Link
          href={basePath}
          aria-current={activeTab === 'people' ? 'page' : undefined}
          className={`relative py-3 text-sm font-medium transition-colors ${
            activeTab === 'people'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          People{attendeeCount != null ? ` (${attendeeCount})` : ''}
          {activeTab === 'people' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </Link>
        <Link
          href={`${basePath}/insights`}
          aria-current={activeTab === 'insights' ? 'page' : undefined}
          className={`relative py-3 text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Insights
          {activeTab === 'insights' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </Link>
      </div>
    </nav>
  );
}
