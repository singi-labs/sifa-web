'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

type ContextType =
  | 'worked_together'
  | 'collaborated_in'
  | 'supervised_by'
  | 'co_authored'
  | 'other';

interface ContextOption {
  type: ContextType;
  labelKey: string;
  hasDetail: boolean;
}

const CONTEXT_OPTIONS: ContextOption[] = [
  { type: 'worked_together', labelKey: 'workedTogether', hasDetail: true },
  { type: 'collaborated_in', labelKey: 'collaboratedIn', hasDetail: true },
  { type: 'supervised_by', labelKey: 'supervisedBy', hasDetail: false },
  { type: 'co_authored', labelKey: 'coAuthored', hasDetail: false },
  { type: 'other', labelKey: 'otherContext', hasDetail: true },
];

export interface EndorsementContextSelectorProps {
  value: string;
  onChange: (context: string) => void;
  disabled?: boolean;
}

export function EndorsementContextSelector({
  value,
  onChange,
  disabled = false,
}: EndorsementContextSelectorProps) {
  const t = useTranslations('endorsement');

  const parsed = parseContextValue(value);
  const [detail, setDetail] = useState(parsed.detail);

  const handleTypeChange = (type: ContextType) => {
    const option = CONTEXT_OPTIONS.find((o) => o.type === type);
    if (!option) return;

    if (parsed.type === type) {
      // Deselect
      onChange('');
      setDetail('');
      return;
    }

    setDetail('');
    onChange(formatContext(type, ''));
  };

  const handleDetailChange = (newDetail: string) => {
    setDetail(newDetail);
    if (parsed.type) {
      onChange(formatContext(parsed.type, newDetail));
    }
  };

  const selectedOption = CONTEXT_OPTIONS.find((o) => o.type === parsed.type);

  return (
    <div role="radiogroup" aria-label={t('endorsementContext')}>
      <p className="mb-2 text-sm font-medium">{t('endorsementContext')}</p>
      <div className="space-y-2">
        {CONTEXT_OPTIONS.map((option) => {
          const isSelected = parsed.type === option.type;
          return (
            <div key={option.type}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="endorsement-context"
                  value={option.type}
                  checked={isSelected}
                  onChange={() => handleTypeChange(option.type)}
                  disabled={disabled}
                  className="h-4 w-4 border-border text-primary focus:ring-ring"
                />
                <span className="text-sm">{t(option.labelKey)}</span>
              </label>
              {isSelected && option.hasDetail && (
                <div className="ml-6 mt-1">
                  <Input
                    type="text"
                    value={detail}
                    onChange={(e) => handleDetailChange(e.target.value)}
                    placeholder={t('contextDetail')}
                    disabled={disabled}
                    aria-label={t('contextDetail')}
                    className="h-7 text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedOption && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            setDetail('');
          }}
          disabled={disabled}
          className="mt-2 text-xs text-muted-foreground underline hover:text-foreground"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}

function parseContextValue(value: string): { type: ContextType | null; detail: string } {
  if (!value) return { type: null, detail: '' };
  const match = value.match(/^\[(\w+?)(?:: (.+?))?\]$/);
  if (match) {
    return {
      type: match[1] as ContextType,
      detail: match[2] ?? '',
    };
  }
  return { type: null, detail: '' };
}

function formatContext(type: ContextType, detail: string): string {
  if (detail.trim()) {
    return `[${type}: ${detail.trim()}]`;
  }
  return `[${type}]`;
}
