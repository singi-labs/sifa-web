'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Translate } from '@phosphor-icons/react';
import type { LanguageOption } from '@/lib/import/orchestrator';

interface LanguageStepProps {
  languages: LanguageOption[];
  onSelect: (language: string) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export function LanguageStep({ languages, onSelect, onBack, isProcessing }: LanguageStepProps) {
  const t = useTranslations('import.language');
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('heading')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {languages.map((lang) => (
            <button
              key={lang.dirName}
              type="button"
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                selected === lang.dirName
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={() => setSelected(lang.dirName)}
            >
              <Translate className="size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{lang.label}</p>
                <p className="text-xs text-muted-foreground">{lang.dirName}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={isProcessing}>
            {t('back')}
          </Button>
          <Button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected || isProcessing}
          >
            {isProcessing ? t('processing') : t('continue')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
