'use client';

import { Children, useId, useState } from 'react';

import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface SectionOverflowProps {
  /** Max items to show before "Show N more" button */
  maxVisible: number;
  /** When true, show all items without disclosure (used for own profile editing) */
  disableOverflow?: boolean;
  children: React.ReactNode;
}

export function SectionOverflow({ maxVisible, disableOverflow, children }: SectionOverflowProps) {
  const [expanded, setExpanded] = useState(false);
  const overflowId = useId();
  const t = useTranslations('sections');

  const items = Children.toArray(children);

  if (items.length <= maxVisible || disableOverflow) {
    return <>{items}</>;
  }

  const visible = items.slice(0, maxVisible);
  const overflow = items.slice(maxVisible);

  return (
    <>
      {visible}
      <div
        id={overflowId}
        className={cn(
          'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-in-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">{overflow}</div>
      </div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={overflowId}
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-3 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground motion-safe:transition-colors"
      >
        {expanded ? (
          <>
            {t('showLess')}
            <CaretUp size={16} aria-hidden="true" />
          </>
        ) : (
          <>
            {t('showMore', { count: overflow.length })}
            <CaretDown size={16} aria-hidden="true" />
          </>
        )}
      </button>
    </>
  );
}
