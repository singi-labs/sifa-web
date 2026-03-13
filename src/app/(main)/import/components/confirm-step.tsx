'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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

interface ImportedCounts {
  profile: number;
  positions: number;
  education: number;
  skills: number;
  certifications: number;
  projects: number;
  volunteering: number;
  publications: number;
  courses: number;
  honors: number;
  languages: number;
}

interface ImportResult {
  totalItems: number;
  importedCounts: ImportedCounts | null;
  failedItems: string[];
}

function ImportBreakdown({ counts }: { counts: ImportedCounts }) {
  const sections: { label: string; plural: string; count: number }[] = [
    { label: 'profile', plural: 'profiles', count: counts.profile },
    { label: 'position', plural: 'positions', count: counts.positions },
    { label: 'education entry', plural: 'education entries', count: counts.education },
    { label: 'skill', plural: 'skills', count: counts.skills },
    { label: 'certification', plural: 'certifications', count: counts.certifications },
    { label: 'project', plural: 'projects', count: counts.projects },
    { label: 'volunteering entry', plural: 'volunteering entries', count: counts.volunteering },
    { label: 'publication', plural: 'publications', count: counts.publications },
    { label: 'course', plural: 'courses', count: counts.courses },
    { label: 'honor', plural: 'honors', count: counts.honors },
    { label: 'language', plural: 'languages', count: counts.languages },
  ].filter((s) => s.count > 0);

  return (
    <ul className="text-sm text-muted-foreground">
      {sections.map((s) => (
        <li key={s.label}>
          {s.count} {s.count === 1 ? s.label : s.plural}
        </li>
      ))}
    </ul>
  );
}

type ImportStatus = 'importing' | 'success' | 'partial' | 'error';

export function ConfirmStep({ preview, onDone }: ConfirmStepProps) {
  const t = useTranslations('import.confirm');
  const [status, setStatus] = useState<ImportStatus>('importing');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalItems =
    (preview.profile ? 1 : 0) +
    preview.positions.length +
    preview.education.length +
    preview.skills.length +
    preview.certifications.length +
    preview.projects.length +
    preview.volunteering.length +
    preview.publications.length +
    preview.courses.length +
    preview.honors.length +
    preview.languages.length;

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

      let res: Response;
      try {
        res = await fetch(`${API_URL}/api/import/linkedin/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(preview),
        });
      } finally {
        clearInterval(progressInterval);
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error((body as { message?: string })?.message ?? `Import failed (${res.status})`);
      }

      const data = (await res.json().catch(() => ({}))) as {
        imported?: ImportedCounts;
        failedItems?: string[];
        warning?: string;
      };
      const importedCounts = data.imported ?? null;
      const failedItems = data.failedItems ?? [];

      setProgress(100);
      setResult({ totalItems, importedCounts, failedItems });

      if (data.warning) {
        setStatus('partial');
        setResult({ totalItems, importedCounts, failedItems: [data.warning] });
      } else if (failedItems.length > 0) {
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
          {status === 'importing' && t('importing')}
          {status === 'success' && t('success')}
          {status === 'partial' && t('partial')}
          {status === 'error' && t('error')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'importing' && (
          <div className="space-y-4">
            <Progress value={progress} aria-label={`Import progress: ${progress}%`} />
            <p className="text-sm text-muted-foreground">
              {t('writingRecords', { count: totalItems })}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="size-12 text-primary" weight="fill" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{t('successMessage')}</p>
            {result?.importedCounts && <ImportBreakdown counts={result.importedCounts} />}
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              {t('formattingHint')}
            </p>
            <Button onClick={onDone}>
              {t('viewProfile')}
              <ArrowRight className="ml-1 h-4 w-4" weight="bold" aria-hidden="true" />
            </Button>
          </div>
        )}

        {status === 'partial' && result && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle
              className="size-12 text-muted-foreground"
              weight="fill"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              {t('warningPrefix')}
              {result.failedItems.length > 0 && (
                <> {result.failedItems.length} items could not be imported.</>
              )}
            </p>
            {result.importedCounts && <ImportBreakdown counts={result.importedCounts} />}
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              {t('formattingHint')}
            </p>
            {result.failedItems.length > 0 && (
              <details className="w-full max-w-sm">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  {t('viewFailed')}
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
                {t('retryFailed')}
              </Button>
              <Button onClick={onDone}>
                {t('viewProfile')}
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
                {t('retry')}
              </Button>
              <Button variant="ghost" onClick={onDone}>
                {t('goToProfile')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
