export const locales = ['en', 'nl', 'de', 'fr', 'es', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Human-readable labels for locale picker UI.
 */
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  de: 'Deutsch',
  fr: 'Francais',
  es: 'Espanol',
  pt: 'Portugues',
};
