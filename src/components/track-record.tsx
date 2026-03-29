'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal, ShieldCheck, ThumbsUp, Users, Handshake, Buildings } from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import type { IconWeight } from '@phosphor-icons/react';

interface TrackRecordCardConfig {
  key: string;
  titleKey: string;
  descriptionKey: string;
  icon: ComponentType<{ className?: string; weight?: IconWeight; 'aria-hidden'?: boolean }>;
  authOnly: boolean;
}

const CARDS: TrackRecordCardConfig[] = [
  {
    key: 'endorsements',
    titleKey: 'endorsementsTitle',
    descriptionKey: 'endorsementsDesc',
    icon: Medal,
    authOnly: false,
  },
  {
    key: 'verified',
    titleKey: 'verifiedTitle',
    descriptionKey: 'verifiedDesc',
    icon: ShieldCheck,
    authOnly: false,
  },
  {
    key: 'reactions',
    titleKey: 'reactionsTitle',
    descriptionKey: 'reactionsDesc',
    icon: ThumbsUp,
    authOnly: false,
  },
  {
    key: 'community',
    titleKey: 'communityTitle',
    descriptionKey: 'communityDesc',
    icon: Users,
    authOnly: false,
  },
  {
    key: 'mutual',
    titleKey: 'mutualTitle',
    descriptionKey: 'mutualDesc',
    icon: Handshake,
    authOnly: true,
  },
  {
    key: 'shared',
    titleKey: 'sharedTitle',
    descriptionKey: 'sharedDesc',
    icon: Buildings,
    authOnly: true,
  },
];

interface TrackRecordProps {
  isAuthenticated?: boolean;
  isOwnProfile?: boolean;
}

export function TrackRecord({ isAuthenticated, isOwnProfile }: TrackRecordProps) {
  const t = useTranslations('trackRecord');

  const visibleCards = CARDS.filter((card) => !card.authOnly || isAuthenticated);

  // Don't render for visitors if there's nothing to show (all empty in P2)
  if (!isOwnProfile && visibleCards.length === 0) return null;

  return (
    <section className="mt-8" aria-label={t('title')}>
      <h2 className="text-xl font-semibold">{t('title')}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('wip')}</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="border-dashed">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-5 w-5 text-muted-foreground"
                    weight="duotone"
                    aria-hidden={true}
                  />
                  <CardTitle className="text-sm font-medium">{t(card.titleKey)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t(card.descriptionKey)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
