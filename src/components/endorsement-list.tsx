'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { Endorsement } from '@/lib/types';

export interface EndorsementListProps {
  endorsements: Endorsement[];
}

export function EndorsementList({ endorsements }: EndorsementListProps) {
  const t = useTranslations('endorsement');

  if (endorsements.length === 0) return null;

  return (
    <div className="space-y-3" aria-label={t('endorsedBy')}>
      {endorsements.map((endorsement) => (
        <EndorsementCard
          key={`${endorsement.endorserDid}-${endorsement.createdAt}`}
          endorsement={endorsement}
        />
      ))}
    </div>
  );
}

interface EndorsementCardProps {
  endorsement: Endorsement;
}

function EndorsementCard({ endorsement }: EndorsementCardProps) {
  const displayName = endorsement.endorserDisplayName ?? endorsement.endorserHandle;
  const contextLabel = formatRelationshipContext(endorsement.relationshipContext);
  const commentText = extractCommentText(endorsement.comment);

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {endorsement.endorserAvatar ? (
          <Image
            src={endorsement.endorserAvatar}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{displayName}</span>
          {contextLabel && (
            <Badge variant="outline" className="text-xs font-normal">
              {contextLabel}
            </Badge>
          )}
        </div>
        {commentText && <p className="mt-1 text-sm text-muted-foreground">{commentText}</p>}
      </div>
    </div>
  );
}

function formatRelationshipContext(context?: string): string | null {
  if (!context) return null;
  const match = context.match(/^\[(\w+?)(?:: (.+?))?\]$/);
  if (!match) return null;

  const type = match[1];
  const detail = match[2];

  switch (type) {
    case 'worked_together':
      return detail ? `Worked together at ${detail}` : 'Worked together';
    case 'collaborated_in':
      return detail ? `Collaborated in ${detail}` : 'Collaborated';
    case 'supervised_by':
      return 'Supervised / was supervised by';
    case 'co_authored':
      return 'Co-authored';
    case 'other':
      return detail ?? null;
    default:
      return null;
  }
}

function extractCommentText(comment?: string): string | null {
  if (!comment) return null;
  // Remove the context prefix if present
  const stripped = comment.replace(/^\[[\w]+(?:: [^\]]+)?\]\s*/, '');
  return stripped.trim() || null;
}
