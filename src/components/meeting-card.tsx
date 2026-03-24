'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Handshake, NotePencil, PencilSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface MeetingCardProps {
  subjectDid: string;
  handle?: string;
  displayName?: string;
  avatarUrl?: string;
  metAt: string;
  note: string | null;
  eventContext?: Array<{ slug: string; name: string; bothRsvped: boolean }>;
  onNoteUpdated: () => void;
}

export function MeetingCard({
  subjectDid,
  handle,
  displayName,
  avatarUrl,
  metAt,
  note,
  eventContext,
  onNoteUpdated,
}: MeetingCardProps) {
  const t = useTranslations('handshake');
  const tn = useTranslations('peopleNotes');
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note ?? '');
  const [saving, setSaving] = useState(false);

  const name = displayName ?? handle ?? subjectDid;
  const metDate = new Date(metAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleSave = useCallback(async () => {
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
        setEditing(false);
        onNoteUpdated();
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [content, subjectDid, tn, onNoteUpdated]);

  const handleDelete = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/${encodeURIComponent(subjectDid)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(tn('noteDeleted'));
        setContent('');
        setEditing(false);
        onNoteUpdated();
      }
    } catch {
      toast.error('Failed to delete');
    }
  }, [subjectDid, tn, onNoteUpdated]);

  return (
    <div className="flex gap-3 rounded-lg border border-border p-3">
      <Link href={handle ? `/p/${encodeURIComponent(handle)}` : '#'} className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={handle ? `/p/${encodeURIComponent(handle)}` : '#'}
            className="truncate text-sm font-medium hover:underline"
          >
            {name}
          </Link>
          {handle && <span className="truncate text-xs text-muted-foreground">@{handle}</span>}
        </div>

        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Handshake className="h-3.5 w-3.5" weight="fill" aria-hidden="true" />
          <span>Met {metDate}</span>
        </div>

        {/* Event context hints */}
        {eventContext && eventContext.length > 0 && (
          <div className="mt-1">
            {eventContext.map((ec) => (
              <p key={ec.slug} className="text-xs text-muted-foreground">
                {ec.bothRsvped
                  ? t('eventContext', { event: ec.name })
                  : t('eventContextSelf', { event: ec.name })}
              </p>
            ))}
          </div>
        )}

        {/* Note display/edit */}
        {editing ? (
          <div className="mt-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder={tn('notePlaceholder')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground/70">{tn('notePrivacy')}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{content.length}/500</span>
              <div className="flex gap-2">
                {note && (
                  <Button variant="ghost" size="sm" onClick={handleDelete}>
                    {tn('deleteNote')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContent(note ?? '');
                    setEditing(false);
                  }}
                >
                  {tn('cancel')}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()}>
                  {saving ? '...' : tn('save')}
                </Button>
              </div>
            </div>
          </div>
        ) : note ? (
          <button
            onClick={() => setEditing(true)}
            className="mt-1.5 flex items-start gap-1.5 text-left"
          >
            <PencilSimple
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
              weight="fill"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">{note}</span>
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <NotePencil className="h-3.5 w-3.5" weight="fill" aria-hidden="true" />
            <span>{tn('addNote')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
