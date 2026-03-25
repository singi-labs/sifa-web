'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MagnifyingGlass } from '@phosphor-icons/react';
import type { ProfilePosition } from '@/lib/types';

const FILTER_THRESHOLD = 10;

interface PositionLinkListProps {
  positions: ProfilePosition[];
  linkedPositionRkeys: string[];
  onToggle: (positionRkey: string, linked: boolean) => void;
  disabled?: boolean;
}

function formatDateRange(startedAt: string, endedAt?: string): string {
  const start = startedAt.slice(0, 4);
  if (!endedAt) return `${start} - Present`;
  return `${start} - ${endedAt.slice(0, 4)}`;
}

export function PositionLinkList({
  positions,
  linkedPositionRkeys,
  onToggle,
  disabled = false,
}: PositionLinkListProps) {
  const t = useTranslations('sections');
  const [filter, setFilter] = useState('');

  const sorted = useMemo(() => {
    const linked = new Set(linkedPositionRkeys);
    return [...positions].sort((a, b) => {
      const aLinked = linked.has(a.rkey) ? 0 : 1;
      const bLinked = linked.has(b.rkey) ? 0 : 1;
      if (aLinked !== bLinked) return aLinked - bLinked;
      // Within each group, sort by start date descending (recent first)
      return b.startedAt.localeCompare(a.startedAt);
    });
  }, [positions, linkedPositionRkeys]);

  const filtered = useMemo(() => {
    if (!filter) return sorted;
    const q = filter.toLowerCase();
    return sorted.filter(
      (p) => p.title.toLowerCase().includes(q) || p.company.toLowerCase().includes(q),
    );
  }, [sorted, filter]);

  if (positions.length === 0) {
    return <p className="text-sm text-muted-foreground">Add positions to link skills to roles</p>;
  }

  const showFilter = positions.length >= FILTER_THRESHOLD;

  return (
    <fieldset className="space-y-1" disabled={disabled}>
      <legend className="mb-1 block text-sm font-medium">{t('usedIn')}</legend>
      {showFilter && (
        <div className="relative">
          <MagnifyingGlass
            className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            weight="bold"
            aria-hidden="true"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter positions..."
            className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filter positions"
          />
        </div>
      )}
      <div className="max-h-[18.5rem] space-y-0.5 overflow-y-auto">
        {filtered.map((position) => {
          const isLinked = linkedPositionRkeys.includes(position.rkey);
          const label = `${position.title} at ${position.company} (${formatDateRange(position.startedAt, position.endedAt)})`;
          const checkboxId = `position-link-${position.rkey}`;

          return (
            <label
              key={position.rkey}
              htmlFor={checkboxId}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
            >
              <input
                id={checkboxId}
                type="checkbox"
                checked={isLinked}
                onChange={() => onToggle(position.rkey, !isLinked)}
                className="h-4 w-4 shrink-0 rounded border-border text-primary accent-primary"
                aria-label={label}
              />
              <span className="leading-tight">{label}</span>
            </label>
          );
        })}
        {filtered.length === 0 && filter && (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">No matching positions</p>
        )}
      </div>
    </fieldset>
  );
}
