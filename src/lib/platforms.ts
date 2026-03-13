import type { ComponentType } from 'react';
import {
  GithubLogo,
  LinkedinLogo,
  YoutubeLogo,
  TwitterLogo,
  InstagramLogo,
  Globe,
  RssSimple,
  MastodonLogo,
} from '@phosphor-icons/react';
import type { IconWeight } from '@phosphor-icons/react';

interface PlatformInfo {
  label: string;
  icon: ComponentType<{ size?: number; weight?: IconWeight; className?: string }>;
}

const PLATFORM_MAP: Record<string, PlatformInfo> = {
  github: { label: 'GitHub', icon: GithubLogo },
  linkedin: { label: 'LinkedIn', icon: LinkedinLogo },
  youtube: { label: 'YouTube', icon: YoutubeLogo },
  twitter: { label: 'X (Twitter)', icon: TwitterLogo },
  instagram: { label: 'Instagram', icon: InstagramLogo },
  website: { label: 'Website', icon: Globe },
  rss: { label: 'RSS', icon: RssSimple },
  fediverse: { label: 'Fediverse', icon: MastodonLogo },
};

/** Platforms that commonly have RSS/Atom feeds. */
export const FEED_PLATFORMS = new Set(['website', 'rss', 'fediverse', 'youtube']);

export function getPlatformInfo(platform: string): PlatformInfo {
  return PLATFORM_MAP[platform] ?? PLATFORM_MAP.website!;
}

export const PLATFORM_OPTIONS = Object.entries(PLATFORM_MAP).map(([value, info]) => ({
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
