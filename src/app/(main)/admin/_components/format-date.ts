import type { ReactNode } from 'react';

/**
 * Format an ISO date string (e.g. "2026-03-14") to a short display format (e.g. "Mar 14").
 * Used as XAxis tickFormatter (receives string) and Tooltip labelFormatter (receives ReactNode).
 */
export function formatDateShort(value: ReactNode): string {
  if (typeof value !== 'string') return String(value ?? '');
  const date = new Date(value + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
