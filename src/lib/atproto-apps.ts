/**
 * ATproto app metadata for display in identity cards.
 * Colors are defined as CSS custom properties in globals.css (--app-{id}-*).
 */

interface AppMeta {
  name: string;
  /** CSS variable-based classes for badge styling (bg + text) */
  className: string;
}

interface AppUrlPatterns {
  /** Per-item URL pattern, e.g. 'https://bsky.app/profile/{handle}/post/{rkey}' */
  urlPattern?: string;
  /** Per-user profile URL fallback, e.g. 'https://bsky.app/profile/{handle}' */
  profileUrlPattern?: string;
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
  kipclip: { name: 'KipClip', className: badgeClass('kipclip') },
  standard: { name: 'Standard', className: badgeClass('standard') },
  aetheros: { name: 'Aetheros', className: badgeClass('aetheros') },
  roomy: { name: 'Roomy', className: badgeClass('roomy') },
  keytrace: { name: 'keytrace.dev', className: badgeClass('keytrace') },
  popfeed: { name: 'Popfeed', className: badgeClass('popfeed') },
};

const FALLBACK_CLASS = badgeClass('fallback');

/** URL patterns per app. Per-item patterns use {handle}, {did}, {rkey}, {name} placeholders. */
const APP_URL_PATTERNS: Record<string, AppUrlPatterns> = {
  bluesky: {
    urlPattern: 'https://bsky.app/profile/{handle}/post/{rkey}',
    profileUrlPattern: 'https://bsky.app/profile/{handle}',
  },
  tangled: {
    profileUrlPattern: 'https://tangled.sh/{handle}',
  },
  smokesignal: {
    urlPattern: 'https://smokesignal.events/{did}/{rkey}',
    profileUrlPattern: 'https://smokesignal.events/{did}',
  },
  whitewind: {
    urlPattern: 'https://whtwnd.com/{handle}/{rkey}',
    profileUrlPattern: 'https://whtwnd.com/{handle}',
  },
  frontpage: {
    urlPattern: 'https://frontpage.fyi/post/{did}/{rkey}',
    profileUrlPattern: 'https://frontpage.fyi/profile/{did}',
  },
  linkat: {
    profileUrlPattern: 'https://linkat.blue/{handle}',
  },
  pastesphere: {
    urlPattern: 'https://pastesphere.link/user/{handle}/snippet/{rkey}',
    profileUrlPattern: 'https://pastesphere.link/user/{handle}',
  },
  kipclip: {
    profileUrlPattern: 'https://kipclip.com/{handle}',
  },
  keytrace: {
    profileUrlPattern: 'https://keytrace.dev/@{handle}',
  },
  sifa: {
    profileUrlPattern: 'https://sifa.id/p/{handle}',
  },
  popfeed: {
    urlPattern: 'https://popfeed.social/profile/{handle}',
    profileUrlPattern: 'https://popfeed.social/profile/{handle}',
  },
  // picosky, flashes, standard, aetheros, roomy: no web URLs — cards are not clickable
};

export function getAppMeta(appId: string): AppMeta {
  return APP_REGISTRY[appId] ?? { name: appId, className: FALLBACK_CLASS };
}

/** Get the CSS variable reference for an app's stripe (accent border) color */
export function getAppStripeColor(appId: string): string {
  return `var(--app-${appId}-stripe, var(--app-fallback-stripe))`;
}

/**
 * Build a URL to fetch a blob from a user's PDS via the Bluesky relay.
 * Works for users on Bluesky's PDS. For self-hosted PDS users, the URL
 * may not resolve — callers should handle fetch failures gracefully.
 */
export function buildBlobUrl(did: string, cid: string): string {
  return `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}

function interpolatePattern(
  pattern: string,
  vars: Record<string, string | undefined>,
): string | null {
  let result = pattern;
  for (const [key, value] of Object.entries(vars)) {
    if (result.includes(`{${key}}`)) {
      if (!value) return null;
      result = result.replaceAll(`{${key}}`, encodeURIComponent(value));
    }
  }
  return result;
}

/**
 * Resolve the URL a card should link to. Returns null when no link is appropriate.
 *
 * Tier 1: per-item URL (e.g. specific post/repo/event)
 * Tier 2: per-user profile URL on the app
 * Tier 3: null (card is not clickable)
 */
export function resolveCardUrl(
  appId: string,
  params: { handle?: string; did?: string; rkey?: string },
): string | null {
  const patterns = APP_URL_PATTERNS[appId];
  if (!patterns) return null;

  const vars = { handle: params.handle, did: params.did, rkey: params.rkey };

  // Tier 1: per-item
  if (patterns.urlPattern) {
    const url = interpolatePattern(patterns.urlPattern, vars);
    if (url) return url;
  }

  // Tier 2: per-user profile
  if (patterns.profileUrlPattern) {
    const url = interpolatePattern(patterns.profileUrlPattern, vars);
    if (url) return url;
  }

  return null;
}

/** Get URL patterns for an app (for cards that need custom URL logic) */
export function getAppUrlPatterns(appId: string): AppUrlPatterns | undefined {
  return APP_URL_PATTERNS[appId];
}
