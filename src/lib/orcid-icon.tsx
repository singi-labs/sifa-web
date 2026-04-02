import type { IconWeight } from '@phosphor-icons/react';

interface OrcidIconProps {
  size?: number;
  weight?: IconWeight;
  className?: string;
}

/** ORCID "iD" logo icon matching Phosphor Icons interface. */
export function OrcidIcon({ size = 24, className }: OrcidIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zM70.7 53.5c4.6 0 8.4 3.7 8.4 8.4 0 4.6-3.7 8.4-8.4 8.4-4.6 0-8.4-3.7-8.4-8.4 0-4.6 3.8-8.4 8.4-8.4zm-7.2 26.2h14.4v122.5H63.5V79.7zm35.1 0h39c36.6 0 57.6 23.6 57.6 61.2 0 37.7-21 61.3-57.6 61.3h-39V79.7zm14.4 12.1v97.8h24c29.5 0 43.5-18.3 43.5-49 0-30.6-14-49-43.5-49h-24z" />
    </svg>
  );
}
