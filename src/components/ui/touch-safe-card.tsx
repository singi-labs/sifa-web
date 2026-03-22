import Link from 'next/link';
import type { ReactNode } from 'react';

interface TouchSafeCardProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * Renders a full-card link on pointer-fine (mouse/trackpad) devices,
 * but a plain div on pointer-coarse (touch) devices.
 *
 * On touch devices the CTA button inside the card should be a real
 * Link, keeping tap targets intentional and preventing accidental
 * navigation from touching anywhere on the card.
 */
export function TouchSafeCard({ href, className = '', children }: TouchSafeCardProps) {
  return (
    <>
      <Link
        href={href}
        className={`pointer-coarse:hidden ${className}`}
        data-testid="touch-safe-card-link"
      >
        {children}
      </Link>
      <div className={`pointer-fine:hidden ${className}`} data-testid="touch-safe-card-plain">
        {children}
      </div>
    </>
  );
}
