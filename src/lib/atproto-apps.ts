/**
 * ATproto app metadata for display in identity cards.
 * Colors are defined as CSS custom properties in globals.css (--app-{id}-*).
 */

interface AppMeta {
  name: string;
  /** CSS variable-based classes for badge styling (bg + text) */
  className: string;
}

/** Build badge className from CSS custom properties for a given app id */
function badgeClass(id: string): string {
  return `bg-[var(--app-${id}-badge-bg)] text-[var(--app-${id}-badge-text)]`;
}

const APP_REGISTRY: Record<string, AppMeta> = {
  bluesky: { name: 'Bluesky', className: badgeClass('bluesky') },
  whitewind: { name: 'Whitewind', className: badgeClass('whitewind') },
  smokesignal: { name: 'Smoke Signal', className: badgeClass('smokesignal') },
  frontpage: { name: 'Frontpage', className: badgeClass('frontpage') },
  picosky: { name: 'Picosky', className: badgeClass('picosky') },
  linkat: { name: 'Linkat', className: badgeClass('linkat') },
  pastesphere: { name: 'PasteSphere', className: badgeClass('pastesphere') },
  tangled: { name: 'Tangled', className: badgeClass('tangled') },
  flashes: { name: 'Flashes', className: badgeClass('flashes') },
};

const FALLBACK_CLASS = badgeClass('fallback');

export function getAppMeta(appId: string): AppMeta {
  return APP_REGISTRY[appId] ?? { name: appId, className: FALLBACK_CLASS };
}

/** Get the CSS variable reference for an app's stripe (accent border) color */
export function getAppStripeColor(appId: string): string {
  return `var(--app-${appId}-stripe, var(--app-fallback-stripe))`;
}
