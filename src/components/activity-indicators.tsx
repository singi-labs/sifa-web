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

import { getAppMeta, getAppStripeColor } from '@/lib/atproto-apps';
import type { ActiveApp } from '@/lib/types';

const MOBILE_MAX = 3;

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
  const overflowCount = overflow.length;

  function handleClick(appId: string) {
    if (!onFilter) return;
    onFilter(activeFilter === appId ? null : appId);
  }

  function renderPill(app: ActiveApp, index: number) {
    const meta = getAppMeta(app.id);
    const IconComponent = ICON_MAP[app.id] ?? CircleDashed;
    const label = t('activeOn', { app: meta.name });
    const displayClass = !expanded && index >= MOBILE_MAX ? 'hidden sm:inline-flex' : 'inline-flex';
    const stripe = getAppStripeColor(app.id);
    const pillStyle = {
      '--_accent': stripe,
      backgroundColor: `color-mix(in oklch, ${stripe} 12%, transparent)`,
      color: stripe,
      borderColor: `color-mix(in oklch, ${stripe} 35%, transparent)`,
    } as React.CSSProperties;
    const pillClasses = `${displayClass} items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors`;

    if (onFilter) {
      return (
        <button
          key={app.id}
          type="button"
          className={`${pillClasses} hover:opacity-80`}
          style={pillStyle}
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
      <span key={app.id} className={pillClasses} style={pillStyle} aria-label={label}>
        <IconComponent size={14} weight="regular" aria-hidden="true" />
        {meta.name}
      </span>
    );
  }

  return (
    <div role="group" aria-label={t('label')} className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{t('rowLabel')}</span>
      {visible.map((app, index) => renderPill(app, index))}
      {expanded && overflow.map((app, index) => renderPill(app, visible.length + index))}
      {/* Mobile overflow: visible below sm, counts pills hidden by CSS */}
      {!expanded && sorted.length > MOBILE_MAX && (
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
          onClick={() => setExpanded(true)}
        >
          {t('moreApps', { count: sorted.length - MOBILE_MAX })}
        </button>
      )}
      {/* Desktop overflow: visible at sm+ */}
      {!expanded && overflowCount > 0 && (
        <button
          type="button"
          className="hidden items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          aria-expanded={expanded}
          onClick={() => setExpanded(true)}
        >
          {t('moreApps', { count: overflowCount })}
        </button>
      )}
    </div>
  );
}
