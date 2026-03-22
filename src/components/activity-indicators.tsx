'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  CircleDashed,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

import { getAppMeta } from '@/lib/atproto-apps';
import type { ActiveApp } from '@/lib/types';

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
};

interface ActivityIndicatorsProps {
  apps: ActiveApp[];
  maxVisible?: number;
  activeFilter?: string | null;
  onFilter?: (appId: string | null) => void;
}

export function ActivityIndicators({
  apps,
  maxVisible = 5,
  activeFilter,
  onFilter,
}: ActivityIndicatorsProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('activityIndicators');

  if (apps.length === 0) return null;

  const sorted = [...apps].sort((a, b) => b.recentCount - a.recentCount);
  const visible = sorted.slice(0, maxVisible);
  const overflow = sorted.slice(maxVisible);
  const hasOverflow = overflow.length > 0;

  function handleClick(appId: string) {
    if (!onFilter) return;
    onFilter(activeFilter === appId ? null : appId);
  }

  function renderPill(app: ActiveApp) {
    const meta = getAppMeta(app.id);
    const IconComponent = ICON_MAP[app.id] ?? CircleDashed;
    const label = t('activeOn', { app: meta.name });
    const pillClasses = `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.className}`;

    if (onFilter) {
      return (
        <button
          key={app.id}
          type="button"
          className={pillClasses}
          aria-label={label}
          aria-pressed={activeFilter === app.id}
          onClick={() => handleClick(app.id)}
        >
          <IconComponent size={14} weight="regular" aria-hidden="true" />
          {meta.name}
        </button>
      );
    }

    return (
      <span key={app.id} className={pillClasses} aria-label={label}>
        <IconComponent size={14} weight="regular" aria-hidden="true" />
        {meta.name}
      </span>
    );
  }

  return (
    <div role="group" aria-label={t('label')} className="flex flex-wrap gap-1.5">
      {visible.map(renderPill)}
      {hasOverflow && expanded && overflow.map(renderPill)}
      {hasOverflow && !expanded && (
        <button
          type="button"
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          aria-expanded={expanded}
          onClick={() => setExpanded(true)}
        >
          {t('moreApps', { count: overflow.length })}
        </button>
      )}
    </div>
  );
}
