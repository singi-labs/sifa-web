'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ImportPreview } from '@/lib/import/orchestrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface ConfirmStepProps {
  preview: ImportPreview;
  onDone: () => void;
}

type ImportStatus = 'importing' | 'success' | 'error';

export function ConfirmStep({ preview, onDone }: ConfirmStepProps) {
  const [status, setStatus] = useState<ImportStatus>('importing');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runImport = useCallback(async () => {
    setStatus('importing');
    setProgress(10);

    try {
      // Simulate incremental progress while the request is in flight
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 300);

      const res = await fetch(`${API_URL}/api/import/linkedin/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(preview),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Import failed (${res.status})`);
      }

      setProgress(100);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, [preview]);

  useEffect(() => {
    runImport();
  }, [runImport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {status === 'importing' && 'Importing your data...'}
          {status === 'success' && 'Import complete'}
          {status === 'error' && 'Import failed'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'importing' && (
          <div className="space-y-4">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Writing records to your Personal Data Server...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="size-12 text-green-600" />
            <p className="text-sm text-muted-foreground">
              Your LinkedIn data has been imported to your profile.
            </p>
            <Button onClick={onDone}>View your profile</Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <XCircle className="size-12 text-destructive" />
            <p className="text-sm text-destructive">{errorMessage}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => runImport()}>
                Retry
              </Button>
              <Button variant="ghost" onClick={onDone}>
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
