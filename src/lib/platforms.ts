import type { ComponentType } from 'react';
import {
  Butterfly,
  GithubLogo,
  LinkedinLogo,
  YoutubeLogo,
  TwitterLogo,
  InstagramLogo,
  Globe,
  RssSimple,
  MastodonLogo,
  LinkSimple,
} from '@phosphor-icons/react';
import type { IconWeight } from '@phosphor-icons/react';
import { SubstackIcon } from './substack-icon';
import { OrcidIcon } from './orcid-icon';

interface PlatformInfo {
  label: string;
  icon: ComponentType<{ size?: number; weight?: IconWeight; className?: string }>;
}

const PLATFORM_MAP: Record<string, PlatformInfo> = {
  bluesky: { label: 'Bluesky', icon: Butterfly },
  github: { label: 'GitHub', icon: GithubLogo },
  linkedin: { label: 'LinkedIn', icon: LinkedinLogo },
  youtube: { label: 'YouTube', icon: YoutubeLogo },
  twitter: { label: 'X (Twitter)', icon: TwitterLogo },
  instagram: { label: 'Instagram', icon: InstagramLogo },
  substack: { label: 'Substack', icon: SubstackIcon },
  tangled: { label: 'Tangled', icon: LinkSimple },
  dns: { label: 'Domain', icon: Globe },
  website: { label: 'Website', icon: Globe },
  rss: { label: 'RSS', icon: RssSimple },
  fediverse: { label: 'Fediverse', icon: MastodonLogo },
  orcid: { label: 'ORCID', icon: OrcidIcon },
};

export function getPlatformInfo(platform: string): PlatformInfo {
  return PLATFORM_MAP[platform] ?? PLATFORM_MAP.website!;
}

export function isKnownPlatform(platform: string): boolean {
  return platform in PLATFORM_MAP;
}

/** Platforms excluded from the "Add Links" dropdown (auto-derived or not accepted by API). */
const EXCLUDED_FROM_DROPDOWN = new Set(['bluesky', 'dns', 'tangled']);

/** Platforms available in the "Add Links" dropdown. */
export const PLATFORM_OPTIONS = Object.entries(PLATFORM_MAP)
  .filter(([value]) => !EXCLUDED_FROM_DROPDOWN.has(value))
  .map(([value, info]) => ({
    value,
    label: info.label,
  }));

/**
 * Build a favicon URL for a given site URL using Google's public favicon service.
 * Returns `null` if the URL cannot be parsed.
 */
export function getFaviconUrl(siteUrl: string): string | null {
  try {
    const { hostname } = new URL(siteUrl);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`;
  } catch {
    return null;
  }
}
