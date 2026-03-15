'use client';

import { useTranslations } from 'next-intl';
import type { ProfilePosition } from '@/lib/types';

interface PositionLinkListProps {
  positions: ProfilePosition[];
  linkedPositionRkeys: string[];
  onToggle: (positionRkey: string, linked: boolean) => void;
  disabled?: boolean;
}

function formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
  const start = startDate.slice(0, 4);
  if (current) return `${start} - Present`;
  if (endDate) return `${start} - ${endDate.slice(0, 4)}`;
  return start;
}

export function PositionLinkList({
  positions,
  linkedPositionRkeys,
  onToggle,
  disabled = false,
}: PositionLinkListProps) {
  const t = useTranslations('sections');

  if (positions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add positions to link skills to roles
      </p>
    );
  }

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="mb-1 block text-sm font-medium">
        {t('usedIn')}
      </legend>
      {positions.map((position) => {
        const isLinked = linkedPositionRkeys.includes(position.rkey);
        const label = `${position.title} at ${position.companyName} (${formatDateRange(position.startDate, position.endDate, position.current)})`;
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
              className="h-4 w-4 rounded border-border text-primary accent-primary"
              aria-label={label}
            />
            <span className="leading-tight">{label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
