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
  Link,
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
  other: { label: 'Link', icon: Link },
};

export function getPlatformInfo(platform: string): PlatformInfo {
  return PLATFORM_MAP[platform] ?? PLATFORM_MAP.other!;
}

export const PLATFORM_OPTIONS = Object.entries(PLATFORM_MAP).map(([value, info]) => ({
  value,
  label: info.label,
}));
