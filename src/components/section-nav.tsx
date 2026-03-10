'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SectionNavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: SectionNavItem[];
}

function useScrollSpy(sections: SectionNavItem[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (sections.length < 3) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      const first = visible[0];
      if (first) {
        setActiveId(first.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  return activeId;
}

export function SectionNav({ sections }: SectionNavProps) {
  const activeId = useScrollSpy(sections);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (sections.length < 3) return null;

  return (
    <>
      {/* Desktop: left sidebar — positioned by parent flex container */}
      <nav
        className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-44 shrink-0 self-start lg:block"
        aria-label="Profile sections"
      >
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleClick(section.id)}
                className={cn(
                  'block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                  activeId === section.id
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: horizontal pill bar */}
      <nav
        className="sticky top-14 z-30 -mx-4 overflow-x-auto border-b border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
        aria-label="Profile sections"
      >
        <ul className="flex gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleClick(section.id)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors',
                  activeId === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
