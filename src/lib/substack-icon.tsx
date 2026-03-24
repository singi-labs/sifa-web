import type { IconWeight } from '@phosphor-icons/react';

interface SubstackIconProps {
  size?: number;
  weight?: IconWeight;
  className?: string;
}

/** Substack logo icon matching Phosphor Icons interface. */
export function SubstackIcon({ size = 24, className }: SubstackIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24l9.56-5.26L20.539 24V10.812H1.46zm21.08-8.648H1.46V0h21.08v2.164z" />
    </svg>
  );
}
