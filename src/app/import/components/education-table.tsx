'use client';

import type { SifaEducation } from '@/lib/import/field-mapper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface EducationTableProps {
  education: SifaEducation[];
  onRemove: (index: number) => void;
}

export function EducationTable({ education, onRemove }: EducationTableProps) {
  if (education.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No education found in export.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Institution</TableHead>
          <TableHead>Degree</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {education.map((edu, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{edu.institution}</TableCell>
            <TableCell>{edu.degree ?? ''}</TableCell>
            <TableCell className="text-muted-foreground">
              {edu.startDate ?? '?'} &ndash; {edu.endDate ?? '?'}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="xs" onClick={() => onRemove(i)}>
                Remove
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
