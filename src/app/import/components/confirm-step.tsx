'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ImportPreview } from '@/lib/import/orchestrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight } from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface ConfirmStepProps {
  preview: ImportPreview;
  onDone: () => void;
}

interface ImportResult {
  totalItems: number;
  importedCount: number;
  failedItems: string[];
}

type ImportStatus = 'importing' | 'success' | 'partial' | 'error';

export function ConfirmStep({ preview, onDone }: ConfirmStepProps) {
  const [status, setStatus] = useState<ImportStatus>('importing');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalItems =
    (preview.profile ? 1 : 0) +
    preview.positions.length +
    preview.education.length +
    preview.skills.length;

  const runImport = useCallback(async () => {
    setStatus('importing');
    setProgress(5);
    setErrorMessage(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Slow down as we approach 90%: fast start, decelerating finish
          const remaining = 90 - prev;
          const step = Math.max(remaining * 0.08, 0.5);
          return Math.min(prev + step, 90);
        });
      }, 100);

      const res = await fetch(`${API_URL}/api/import/linkedin/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(preview),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error((body as { message?: string })?.message ?? `Import failed (${res.status})`);
      }

      const data = (await res.json().catch(() => ({}))) as {
        importedCount?: number;
        failedItems?: string[];
      };
      const importedCount = data.importedCount ?? totalItems;
      const failedItems = data.failedItems ?? [];

      setProgress(100);
      setResult({ totalItems, importedCount, failedItems });

      if (failedItems.length > 0) {
        setStatus('partial');
      } else {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, [preview, totalItems]);

  useEffect(() => {
    runImport();
  }, [runImport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {status === 'importing' && 'Importing your data...'}
          {status === 'success' && 'Import complete'}
          {status === 'partial' && 'Import partially complete'}
          {status === 'error' && 'Import failed'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'importing' && (
          <div className="space-y-4">
            <Progress value={progress} aria-label={`Import progress: ${progress}%`} />
            <p className="text-sm text-muted-foreground">
              Writing {totalItems} records to your Personal Data Server...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="size-12 text-green-600" weight="fill" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Successfully imported {result?.importedCount ?? totalItems} items to your profile.
            </p>
            <Button onClick={onDone}>
              View your profile
              <ArrowRight className="ml-1 h-4 w-4" weight="bold" aria-hidden="true" />
            </Button>
          </div>
        )}

        {status === 'partial' && result && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="size-12 text-yellow-500" weight="fill" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Imported {result.importedCount} of {result.totalItems} items.
              {result.failedItems.length > 0 && (
                <> {result.failedItems.length} items could not be imported.</>
              )}
            </p>
            {result.failedItems.length > 0 && (
              <details className="w-full max-w-sm">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  View failed items
                </summary>
                <ul className="mt-2 space-y-1 text-xs text-destructive">
                  {result.failedItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </details>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => runImport()}>
                Retry failed items
              </Button>
              <Button onClick={onDone}>
                View your profile
                <ArrowRight className="ml-1 h-4 w-4" weight="bold" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <XCircle className="size-12 text-destructive" weight="fill" aria-hidden="true" />
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => runImport()}>
                Retry
              </Button>
              <Button variant="ghost" onClick={onDone}>
                Go to profile
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
