'use client';

import type { SifaPosition } from '@/lib/import/field-mapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from '@phosphor-icons/react';

interface PositionsTableProps {
  positions: SifaPosition[];
  duplicateIndices: Set<number>;
  onRemove: (index: number) => void;
}

export function PositionsTable({ positions, duplicateIndices, onRemove }: PositionsTableProps) {
  if (positions.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No positions found in export.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {positions.map((pos, i) => (
        <li key={i} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{pos.title}</p>
              {duplicateIndices.has(i) ? (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Already on profile
                </Badge>
              ) : (
                duplicateIndices.size > 0 && (
                  <Badge className="bg-green-100 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                    New
                  </Badge>
                )
              )}
            </div>
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
