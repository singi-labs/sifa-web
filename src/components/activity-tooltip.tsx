'use client';

import { useState, useRef, type ReactNode } from 'react';

interface ActivityTooltipProps {
  appName: string;
  tooltipDescription: string;
  tooltipNetworkNote?: string;
  appUrl?: string;
  children: ReactNode;
}

export function ActivityTooltip({
  appName,
  tooltipDescription,
  tooltipNetworkNote,
  appUrl,
  children,
}: ActivityTooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tooltipId = `tooltip-${appName.replace(/\s+/g, '-').toLowerCase()}`;

  function handleEnter() {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- tooltip trigger delegates focus/keyboard to the interactive child */
    <span
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <span aria-describedby={open ? tooltipId : undefined}>{children}</span>
      {open && (
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- tooltip must track mouse to stay open when user moves to it */
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <span className="font-medium">{appName}</span>
          <br />
          <span className="text-muted-foreground">{tooltipDescription}</span>
          {tooltipNetworkNote && (
            <>
              <br />
              <span className="text-muted-foreground/80">{tooltipNetworkNote}</span>
            </>
          )}
          {appUrl && (
            <>
              <br />
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-primary hover:underline"
              >
                View on {new URL(appUrl).hostname} &rarr;
              </a>
            </>
          )}
        </span>
      )}
    </span>
  );
}
