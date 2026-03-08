'use client';

import type { SifaPosition } from '@/lib/import/field-mapper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface PositionsTableProps {
  positions: SifaPosition[];
  onRemove: (index: number) => void;
}

export function PositionsTable({ positions, onRemove }: PositionsTableProps) {
  if (positions.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No positions found in export.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((pos, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{pos.title}</TableCell>
            <TableCell>{pos.companyName}</TableCell>
            <TableCell className="text-muted-foreground">
              {pos.startDate ?? '?'} &ndash; {pos.current ? 'Present' : (pos.endDate ?? '?')}
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
