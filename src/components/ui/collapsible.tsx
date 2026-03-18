'use client';

import { cn } from '@/lib/utils';

interface CollapsibleProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Collapsible({ open, children, className }: CollapsibleProps) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-200 ease-in-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
