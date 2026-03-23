import type { ReactNode } from 'react';

interface InsightSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  children: ReactNode;
  table?: ReactNode;
  className?: string;
}

export function InsightSection({
  id,
  title,
  subtitle,
  summary,
  children,
  table,
  className,
}: InsightSectionProps) {
  const titleId = `${id}-title`;
  const summaryId = `${id}-summary`;

  return (
    <figure
      id={id}
      aria-labelledby={titleId}
      aria-describedby={summary ? summaryId : undefined}
      className={`rounded-xl border border-border bg-secondary/50 p-6 ${className ?? ''}`}
    >
      <figcaption>
        <h3 id={titleId} className="text-base font-semibold">
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </figcaption>
      {summary && (
        <p id={summaryId} className="sr-only">
          {summary}
        </p>
      )}
      <div className="mt-3 border-t border-border pt-4">{children}</div>
      {table && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Show data as table
          </summary>
          <div className="mt-2">{table}</div>
        </details>
      )}
    </figure>
  );
}
