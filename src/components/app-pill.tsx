'use client';

import {
  ChatCircle,
  GitBranch,
  CalendarBlank,
  Camera,
  Article,
  Newspaper,
  ChatsCircle,
  LinkSimple,
  Clipboard,
  BookmarkSimple,
  FileText,
  Globe,
  UsersThree,
  Key,
  Star,
  Broadcast,
  CircleDashed,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

import { getAppStripeColor } from '@/lib/atproto-apps';

const ICON_MAP: Record<string, Icon> = {
  bluesky: ChatCircle,
  tangled: GitBranch,
  smokesignal: CalendarBlank,
  flashes: Camera,
  whitewind: Article,
  frontpage: Newspaper,
  picosky: ChatsCircle,
  linkat: LinkSimple,
  pastesphere: Clipboard,
  kipclip: BookmarkSimple,
  standard: FileText,
  aetheros: Globe,
  roomy: UsersThree,
  keytrace: Key,
  popfeed: Star,
  streamplace: Broadcast,
};

export function getAppPillStyle(appId: string): React.CSSProperties {
  const stripe = getAppStripeColor(appId);
  return {
    backgroundColor: `color-mix(in oklch, ${stripe} 12%, transparent)`,
    color: stripe,
    borderColor: `color-mix(in oklch, ${stripe} 35%, transparent)`,
  };
}

interface AppPillProps {
  appId: string;
  name: string;
}

export function AppPill({ appId, name }: AppPillProps) {
  const IconComponent = ICON_MAP[appId] ?? CircleDashed;
  const style = getAppPillStyle(appId);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={style}
    >
      <IconComponent size={14} weight="regular" aria-hidden="true" />
      {name}
    </span>
  );
}
