/**
 * ATproto app metadata for display in identity cards.
 * Colors are defined as CSS custom properties in globals.css (--app-{id}-*).
 */

interface AppMeta {
  name: string;
  /** CSS variable-based classes for badge styling (bg + text) */
  className: string;
  /** Short description shown in the badge tooltip */
  tooltipDescription: string;
  /** Extra context for shared-namespace apps (e.g. "Posted using a Bluesky-compatible app.") */
  tooltipNetworkNote?: string;
  /** Canonical URL for the app (used for outbound link in tooltip) */
  appUrl?: string;
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
  bluesky: {
    name: 'Bluesky network',
    className: badgeClass('bluesky'),
    tooltipDescription: 'Social networking on the AT Protocol.',
    tooltipNetworkNote: 'Posted using a Bluesky-compatible app. The specific client is unknown.',
    appUrl: 'https://bsky.app',
  },
  whitewind: {
    name: 'Whitewind',
    className: badgeClass('whitewind'),
    tooltipDescription: 'Long-form writing on the AT Protocol.',
    appUrl: 'https://whtwnd.com',
  },
  smokesignal: {
    name: 'Events',
    className: badgeClass('smokesignal'),
    tooltipDescription: 'Events and RSVPs on the AT Protocol.',
    tooltipNetworkNote: 'Multiple apps can create these records.',
    appUrl: 'https://smokesignal.events',
  },
  frontpage: {
    name: 'Frontpage',
    className: badgeClass('frontpage'),
    tooltipDescription: 'Link aggregation on the AT Protocol.',
    appUrl: 'https://frontpage.fyi',
  },
  picosky: {
    name: 'Picosky',
    className: badgeClass('picosky'),
    tooltipDescription: 'Public chat on the AT Protocol.',
    appUrl: 'https://psky.social',
  },
  linkat: {
    name: 'Linkat',
    className: badgeClass('linkat'),
    tooltipDescription: 'Link-in-bio pages on the AT Protocol.',
    appUrl: 'https://linkat.blue',
  },
  pastesphere: {
    name: 'PasteSphere',
    className: badgeClass('pastesphere'),
    tooltipDescription: 'Code snippets on the AT Protocol.',
    appUrl: 'https://pastesphere.link',
  },
  tangled: {
    name: 'Tangled',
    className: badgeClass('tangled'),
    tooltipDescription: 'Git hosting on the AT Protocol.',
    appUrl: 'https://tangled.sh',
  },
  flashes: {
    name: 'Flashes',
    className: badgeClass('flashes'),
    tooltipDescription: 'Photo sharing on the AT Protocol.',
  },
  grain: {
    name: 'Grain',
    className: badgeClass('grain'),
    tooltipDescription: 'Photo galleries on the AT Protocol.',
    appUrl: 'https://grain.social',
  },
  kipclip: {
    name: 'AT Protocol bookmarks',
    className: badgeClass('kipclip'),
    tooltipDescription: 'Bookmarks on the AT Protocol.',
    tooltipNetworkNote: 'Multiple apps can create these records.',
    appUrl: 'https://kipclip.com',
  },
  standard: {
    name: 'Standard',
    className: badgeClass('standard'),
    tooltipDescription: 'Document publishing on the AT Protocol.',
    appUrl: 'https://standard.site',
  },
  aetheros: {
    name: 'Aetheros',
    className: badgeClass('aetheros'),
    tooltipDescription: 'Personal pages on the AT Protocol.',
    appUrl: 'https://aetheros.computer',
  },
  roomy: {
    name: 'Roomy',
    className: badgeClass('roomy'),
    tooltipDescription: 'Social spaces on the AT Protocol.',
    appUrl: 'https://roomy.space',
  },
  keytrace: {
    name: 'Keytrace',
    className: badgeClass('keytrace'),
    tooltipDescription: 'Identity verification on the AT Protocol.',
    appUrl: 'https://keytrace.dev',
  },
  popfeed: {
    name: 'Popfeed',
    className: badgeClass('popfeed'),
    tooltipDescription: 'Reviews and ratings on the AT Protocol.',
    appUrl: 'https://popfeed.social',
  },
  streamplace: {
    name: 'Streamplace',
    className: badgeClass('streamplace'),
    tooltipDescription: 'Livestreaming on the AT Protocol.',
    appUrl: 'https://stream.place',
  },
  semble: {
    name: 'Semble',
    className: badgeClass('semble'),
    tooltipDescription: 'Social knowledge trails on the AT Protocol.',
    appUrl: 'https://semble.so',
  },
};

const FALLBACK_CLASS = badgeClass('fallback');

/** Phosphor icon component names per app (string mapping — actual imports happen in components) */
const APP_ICONS: Record<string, string> = {
  bluesky: 'ChatCircle',
  tangled: 'GitBranch',
  smokesignal: 'CalendarBlank',
  flashes: 'Camera',
  grain: 'Images',
  whitewind: 'Article',
  frontpage: 'Newspaper',
  picosky: 'ChatsCircle',
  linkat: 'LinkSimple',
  pastesphere: 'Clipboard',
  kipclip: 'BookmarkSimple',
  standard: 'FileText',
  aetheros: 'Globe',
  roomy: 'UsersThree',
  keytrace: 'Key',
  popfeed: 'Star',
  streamplace: 'Broadcast',
  semble: 'Path',
};

/** Get the Phosphor icon component name for an app */
export function getAppIconName(appId: string): string {
  return APP_ICONS[appId] ?? 'CircleDashed';
}

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
  streamplace: {
    profileUrlPattern: 'https://stream.place/{handle}',
  },
  semble: {
    profileUrlPattern: 'https://semble.so/profile/{handle}',
  },
  grain: {
    profileUrlPattern: 'https://grain.social/{handle}',
  },
  // picosky, flashes, standard, aetheros, roomy: no web URLs — cards are not clickable
};

export function getAppMeta(appId: string): AppMeta {
  return (
    APP_REGISTRY[appId] ?? {
      name: appId,
      className: FALLBACK_CLASS,
      tooltipDescription: "Activity from an AT Protocol app that Sifa doesn't recognize yet.",
    }
  );
}

/** Get the CSS variable reference for an app's stripe (accent border) color */
export function getAppStripeColor(appId: string): string {
  return `var(--app-${appId}-stripe, var(--app-fallback-stripe))`;
}

/**
 * Build a URL to fetch a blob via the Bluesky CDN.
 * Uses cdn.bsky.app which serves blobs from all PDS instances
 * (Bluesky-hosted and self-hosted) via the relay network.
 */
export function buildBlobUrl(did: string, cid: string): string {
  return `https://cdn.bsky.app/img/feed_thumbnail/plain/${encodeURIComponent(did)}/${encodeURIComponent(cid)}@jpeg`;
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
