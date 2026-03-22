'use client';

import type { ReactNode } from 'react';

interface CardLinkProps {
  href: string | null;
  /** Accessible label for the link overlay (e.g. "View post on Bluesky") */
  label: string;
  children: ReactNode;
}

/**
 * Makes an entire activity card clickable by rendering an invisible link overlay.
 *
 * Uses the CSS overlay technique: an absolutely-positioned `<a>` covers the card.
 * Internal links within the card (e.g. Bluesky facet links) must use
 * `className="relative z-10"` to remain clickable above the overlay.
 *
 * When `href` is null, renders children without any link (tier 3: not clickable).
 */
export function CardLink({ href, label, children }: CardLinkProps) {
  if (!href) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 pointer-coarse:hidden"
        aria-label={label}
      />
    </div>
  );
}
