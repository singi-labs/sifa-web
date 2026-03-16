/**
 * Intl.DateTimeFormat and Intl.NumberFormat utility wrappers.
 * These ensure consistent formatting across the app and respect the user's locale.
 */

/**
 * Format a date string or Date object for display.
 * Uses medium date style by default (e.g., "Mar 8, 2026" for en-US).
 */
export function formatDate(
  value: string | Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...options,
  }).format(date);
}

/**
 * Format a number for display with locale-appropriate separators.
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a number in compact notation (e.g., 1.2K, 3.4M).
 * Falls back to full number for values under 1000.
 */
export function formatCompactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a currency value for display.
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency = 'EUR',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}
