'use client';

import type { SifaPosition } from '@/lib/import/field-mapper';
import { Button } from '@/components/ui/button';
import { X } from '@phosphor-icons/react';

interface PositionsTableProps {
  positions: SifaPosition[];
  onRemove: (index: number) => void;
}

export function PositionsTable({ positions, onRemove }: PositionsTableProps) {
  if (positions.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No positions found in export.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {positions.map((pos, i) => (
        <li key={i} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{pos.title}</p>
            <p className="text-sm text-muted-foreground">{pos.companyName}</p>
            <p className="text-xs text-muted-foreground">
              {pos.startDate ?? '?'} &ndash; {pos.current ? 'Present' : (pos.endDate ?? '?')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${pos.title} at ${pos.companyName}`}
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
