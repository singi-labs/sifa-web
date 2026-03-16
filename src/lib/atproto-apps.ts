/**
 * ATproto app metadata for display in identity cards.
 * Colors are chosen for readability on both light and dark backgrounds.
 */

interface AppMeta {
  name: string;
  /** Tailwind classes for badge styling (bg + text) */
  className: string;
}

const APP_REGISTRY: Record<string, AppMeta> = {
  bluesky: {
    name: 'Bluesky',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  },
  whitewind: {
    name: 'Whitewind',
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300',
  },
  smokesignal: {
    name: 'Smoke Signal',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  },
  frontpage: {
    name: 'Frontpage',
    className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  },
  picosky: {
    name: 'Picosky',
    className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  },
  linkat: {
    name: 'Linkat',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  pastesphere: {
    name: 'PasteSphere',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

const FALLBACK_CLASS = 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';

export function getAppMeta(appId: string): AppMeta {
  return APP_REGISTRY[appId] ?? { name: appId, className: FALLBACK_CLASS };
}
