'use client';

import { useMemo } from 'react';
import { CheckCircle, Circle, ArrowRight } from '@phosphor-icons/react';
import { Progress } from '@/components/ui/progress';
import type { Profile } from '@/lib/types';

interface CompletionItem {
  key: string;
  label: string;
  completed: boolean;
  action: string;
}

function getCompletionItems(profile: Profile): CompletionItem[] {
  return [
    {
      key: 'avatar',
      label: 'Add a profile photo',
      completed: Boolean(profile.avatar),
      action: '#edit-avatar',
    },
    {
      key: 'headline',
      label: 'Write a headline',
      completed: Boolean(profile.headline),
      action: '#edit-about',
    },
    {
      key: 'about',
      label: 'Add a professional summary',
      completed: Boolean(profile.about),
      action: '#about',
    },
    {
      key: 'current-position',
      label: 'Add your current position',
      completed: profile.positions.some((p) => p.current),
      action: '#career',
    },
    {
      key: 'past-position',
      label: 'Add a past position',
      completed: profile.positions.filter((p) => !p.current).length > 0,
      action: '#career',
    },
    {
      key: 'skills',
      label: 'Add 3+ skills',
      completed: profile.skills.length >= 3,
      action: '#skills',
    },
    {
      key: 'education',
      label: 'Add education',
      completed: profile.education.length > 0,
      action: '#education',
    },
    {
      key: 'website',
      label: 'Add a website or verification',
      completed: Boolean(profile.website) || (profile.verifiedAccounts ?? []).length > 0,
      action: '#edit-about',
    },
  ];
}

interface CompletionBarProps {
  profile: Profile;
}

export function CompletionBar({ profile }: CompletionBarProps) {
  const items = useMemo(() => getCompletionItems(profile), [profile]);
  const completedCount = items.filter((i) => i.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  if (!profile.isOwnProfile || percentage === 100) return null;

  const nextItem = items.find((i) => !i.completed);

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Profile strength</span>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" aria-label={`Profile ${percentage}% complete`} />

      {nextItem && (
        <a
          href={nextItem.action}
          className="mt-3 flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
        >
          <ArrowRight className="h-4 w-4" weight="bold" aria-hidden="true" />
          {nextItem.label}
        </a>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          View all items ({completedCount}/{items.length})
        </summary>
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-sm">
              {item.completed ? (
                <CheckCircle className="h-4 w-4 text-primary" weight="fill" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
