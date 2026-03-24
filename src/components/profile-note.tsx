'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { NotePencil, PencilSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface ProfileNoteProps {
  did: string;
}

export function ProfileNote({ did }: ProfileNoteProps) {
  const tn = useTranslations('peopleNotes');
  const { session } = useAuth();
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/notes/${encodeURIComponent(did)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { content: string };
          setNote(data.content);
          setContent(data.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [did, session]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/notes/${encodeURIComponent(did)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        toast.success(tn('noteSaved'));
        setNote(content.trim());
        setEditing(false);
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [content, did, tn]);

  const handleDelete = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/${encodeURIComponent(did)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(tn('noteDeleted'));
        setNote(null);
        setContent('');
        setEditing(false);
      }
    } catch {
      toast.error('Failed to delete');
    }
  }, [did, tn]);

  // Don't render for own profile or when not authenticated
  if (!session || loading || session.did === did) return null;

  if (editing) {
    return (
      <div className="mt-3 rounded-lg border border-border p-3">
        <textarea
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
    );
  }

  if (note) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-3 flex w-full items-start gap-2 rounded-lg border border-border p-3 text-left hover:bg-muted/50"
      >
        <PencilSimple
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          weight="fill"
          aria-hidden="true"
        />
        <span className="text-sm text-foreground">{note}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <NotePencil className="h-4 w-4" weight="fill" aria-hidden="true" />
      <span>{tn('addNote')}</span>
    </button>
  );
}
