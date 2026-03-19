'use client';

import { useState, lazy, Suspense, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Copy, Check } from '@phosphor-icons/react';

const PlateMarkdownEditor = lazy(() =>
  import('@/components/plate-editor/plate-markdown-editor').then((mod) => ({
    default: mod.PlateMarkdownEditor,
  })),
);

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'markdown' | 'month' | 'url' | 'checkbox' | 'select' | 'hint';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  /** Only show this field when the predicate returns true. */
  visibleWhen?: (values: Record<string, string | boolean>) => boolean;
  /** URL to display as a clickable link with copy button (for hint fields). */
  hintUrl?: string;
  /** Code snippet to display and copy instead of the URL (for hint fields). */
  hintSnippet?: string;
  /** External link to show in the hint (e.g. link to platform settings page). */
  hintActionUrl?: string;
  /** Label for the external link (e.g. "GitHub profile settings"). */
  hintActionLabel?: string;
}

interface EditDialogProps {
  title: string;
  fields: FieldDef[];
  initialValues?: Record<string, string | boolean>;
  onSave: (
    values: Record<string, string | boolean>,
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  saving?: boolean;
  /** Called when any field value changes. Return partial values to auto-fill other fields. */
  onFieldChange?: (
    name: string,
    value: string | boolean,
    currentValues: Record<string, string | boolean>,
  ) => Record<string, string | boolean> | undefined;
}

export function EditDialog({
  title,
  fields,
  initialValues = {},
  onSave,
  onCancel,
  onFieldChange,
}: EditDialogProps) {
  const t = useTranslations('editor');
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const init: Record<string, string | boolean> = {};
    for (const f of fields) {
      if (f.type === 'hint') continue;
      init[f.name] = initialValues[f.name] ?? (f.type === 'checkbox' ? false : '');
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHint, setCopiedHint] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(values);
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? t('failedToSave'));
    }
  };

  const updateValue = (name: string, value: string | boolean) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (onFieldChange) {
        const autoFill = onFieldChange(name, value, next);
        if (autoFill) {
          return { ...next, ...autoFill };
        }
      }
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-label={title}
      aria-modal="true"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onCancel}
            aria-label={t('close')}
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => {
            if (field.visibleWhen && !field.visibleWhen(values)) return null;
            if (field.type === 'hint') {
              const copyText = field.hintSnippet ?? field.hintUrl;
              const isCopied = copiedHint === field.name;
              const handleCopy = async () => {
                if (!copyText) return;
                await navigator.clipboard.writeText(copyText);
                setCopiedHint(field.name);
                setTimeout(() => setCopiedHint(null), 2000);
              };
              const copyLabel = field.hintSnippet ? t('copySnippet') : t('copyUrl');
              return (
                <div
                  key={field.name}
                  className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                >
                  <p>
                    {field.description}
                    {field.hintActionUrl && (
                      <>
                        {' '}
                        <a
                          href={field.hintActionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {field.hintActionLabel ?? field.hintActionUrl}
                        </a>
                      </>
                    )}
                  </p>
                  {copyText && (
                    <div className="mt-2 flex items-center gap-2">
                      {field.hintSnippet ? (
                        <code className="block flex-1 rounded bg-blue-100 px-2 py-1 text-xs break-all dark:bg-blue-900/40">
                          {field.hintSnippet}
                        </code>
                      ) : (
                        <a
                          href={field.hintUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 break-all underline underline-offset-2"
                        >
                          {field.hintUrl}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-800"
                        aria-label={copyLabel}
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} weight="bold" />
                            {t('copied')}
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            {copyLabel}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={field.name}>
                <label htmlFor={`edit-${field.name}`} className="mb-1 block text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </label>
                {field.description && (
                  <p className="mb-1 text-xs text-muted-foreground">{field.description}</p>
                )}
                {field.type === 'markdown' ? (
                  <Suspense
                    fallback={
                      <textarea
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        rows={4}
                        disabled
                        placeholder="Loading editor..."
                      />
                    }
                  >
                    <PlateMarkdownEditor
                      id={`edit-${field.name}`}
                      value={values[field.name] as string}
                      onChange={(md) => updateValue(field.name, md)}
                      placeholder={field.placeholder}
                      aria-label={field.label}
                    />
                  </Suspense>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={`edit-${field.name}`}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={4}
                    value={values[field.name] as string}
                    onChange={(e) => updateValue(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2">
                    <input
                      id={`edit-${field.name}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      checked={values[field.name] as boolean}
                      onChange={(e) => updateValue(field.name, e.target.checked)}
                    />
                    <span className="text-sm text-muted-foreground">{field.placeholder}</span>
                  </div>
                ) : field.type === 'select' && field.options ? (
                  <select
                    id={`edit-${field.name}`}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={values[field.name] as string}
                    onChange={(e) => updateValue(field.name, e.target.value)}
                    required={field.required}
                  >
                    <option value="">{field.placeholder ?? 'Select...'}</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`edit-${field.name}`}
                    type={field.type ?? 'text'}
                    value={values[field.name] as string}
                    onChange={(e) => updateValue(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            );
          })}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
