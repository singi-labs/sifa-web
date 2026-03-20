'use client';

import { useState } from 'react';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Collapsible } from '@/components/ui/collapsible';

interface TimelineEntryProps {
  title: string;
  subtitle: string;
  dateRange: string;
  description?: string;
  children?: React.ReactNode;
  isLast?: boolean;
}

export function TimelineEntry({
  title,
  subtitle,
  dateRange,
  description,
  children,
  isLast,
}: TimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const hasExpandable = Boolean(description || children);

  const content = (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
        <div className="min-w-0">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="text-xs text-muted-foreground">{dateRange}</span>
          {hasExpandable &&
            (expanded ? (
              <CaretUp className="h-4 w-4 text-muted-foreground" weight="bold" aria-hidden="true" />
            ) : (
              <CaretDown
                className="h-4 w-4 text-muted-foreground"
                weight="bold"
                aria-hidden="true"
              />
            ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-background" />
        {!isLast && <div className="w-px grow bg-border" />}
      </div>

      {/* Content */}
      <div className={cn('min-w-0 flex-1 pb-6', isLast && 'pb-0')}>
        {hasExpandable ? (
          <button
            type="button"
            className="flex w-full cursor-pointer flex-col gap-0.5 text-left"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {content}
          </button>
        ) : (
          <div className="flex flex-col gap-0.5">{content}</div>
        )}
        {hasExpandable && (
          <Collapsible open={expanded}>
            <div className="mt-2 text-sm text-muted-foreground">
              {description && <p className="whitespace-pre-wrap">{description}</p>}
              {children}
            </div>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format "2007-01" as "Jan 2007", pass through year-only strings. */
export function formatTimelineDate(dateStr: string): string {
  if (dateStr.length === 4) return dateStr;
  const [year, month] = dateStr.split('-');
  if (!month) return year ?? dateStr;
  const idx = parseInt(month, 10) - 1;
  return `${MONTHS[idx]} ${year}`;
}

interface TimelineSectionProps {
  title: string;
  children: React.ReactNode;
}

export function TimelineSection({ title, children }: TimelineSectionProps) {
  return (
    <section className="mt-8" aria-label={title}>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
