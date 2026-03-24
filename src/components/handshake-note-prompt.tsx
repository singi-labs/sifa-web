'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface HandshakeNotePromptProps {
  subjectDid: string;
  subjectHandle?: string;
  subjectName: string;
  subjectAvatar?: string;
  onDismiss: () => void;
}

export function HandshakeNotePrompt({
  subjectDid,
  subjectHandle,
  subjectName,
  subjectAvatar,
  onDismiss,
}: HandshakeNotePromptProps) {
  const t = useTranslations('handshake');
  const tn = useTranslations('peopleNotes');
  const [showTextarea, setShowTextarea] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showTextarea) {
      textareaRef.current?.focus();
    }
  }, [showTextarea]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/notes/${encodeURIComponent(subjectDid)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        toast.success(tn('noteSaved'));
        onDismiss();
      } else {
        toast.error('Failed to save note');
      }
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  }, [content, subjectDid, tn, onDismiss]);

  return (
    <div className="mt-4 w-full max-w-sm rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {subjectAvatar ? (
            <Image
              src={subjectAvatar}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span aria-hidden="true">{subjectName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-sm font-medium">{subjectName}</span>
      </div>

      {showTextarea ? (
        <div className="mt-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={tn('notePlaceholder')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground/70">{tn('notePrivacy')}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.length}/500</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onDismiss}>
                {t('done')}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()}>
                {saving ? '...' : tn('save')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            {t('addNotePrompt', { name: subjectName })}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTextarea(true)}>
              {tn('addNote')}
            </Button>
            {subjectHandle && (
              <Link href={`/p/${encodeURIComponent(subjectHandle)}`}>
                <Button variant="ghost" size="sm">
                  {t('viewProfile')}
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              {t('done')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
