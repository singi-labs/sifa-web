'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { X, Info } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { EndorsementContextSelector } from '@/components/endorsement-context-selector';
import type { EndorsementData } from '@/lib/types';

export interface EndorsementDialogProps {
  skillName: string;
  skillRkey: string;
  targetDid: string;
  onClose: () => void;
  onSubmit: (data: EndorsementData) => Promise<void>;
}

export function EndorsementDialog({
  skillName,
  skillRkey,
  onClose,
  onSubmit,
}: EndorsementDialogProps) {
  const t = useTranslations('endorsement');
  const tEditor = useTranslations('editor');
  const [relationshipContext, setRelationshipContext] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildComment = useCallback((): string | undefined => {
    const parts: string[] = [];
    if (relationshipContext) parts.push(relationshipContext);
    if (comment.trim()) parts.push(comment.trim());
    return parts.length > 0 ? parts.join(' ') : undefined;
  }, [relationshipContext, comment]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        skillRkey,
        comment: buildComment(),
        relationshipContext: relationshipContext || undefined,
      });
      onClose();
    } catch {
      setError(tEditor('failedToSave'));
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-label={t('endorseSkill', { skillName })}
      aria-modal="true"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {t('endorseSkill', { skillName })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
            aria-label={tEditor('close')}
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <EndorsementContextSelector
            value={relationshipContext}
            onChange={setRelationshipContext}
            disabled={submitting}
          />

          <div>
            <label htmlFor="endorsement-comment" className="mb-1 block text-sm font-medium">
              {t('endorseComment')}
            </label>
            <textarea
              id="endorsement-comment"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" weight="fill" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">
              {t('endorseAttribution')}
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              {t('endorseCancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? tEditor('saving') : t('endorseSubmit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
