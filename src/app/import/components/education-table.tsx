'use client';

import type { SifaEducation } from '@/lib/import/field-mapper';
import { Button } from '@/components/ui/button';
import { X } from '@phosphor-icons/react';

interface EducationTableProps {
  education: SifaEducation[];
  onRemove: (index: number) => void;
}

export function EducationTable({ education, onRemove }: EducationTableProps) {
  if (education.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No education found in export.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {education.map((edu, i) => (
        <li key={i} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{edu.institution}</p>
            {edu.degree && <p className="text-sm text-muted-foreground">{edu.degree}</p>}
            <p className="text-xs text-muted-foreground">
              {edu.startDate ?? '?'} &ndash; {edu.endDate ?? '?'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${edu.institution}`}
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
