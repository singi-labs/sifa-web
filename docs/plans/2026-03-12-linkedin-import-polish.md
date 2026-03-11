# LinkedIn Import Polish (P2.12) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish the LinkedIn import wizard: design system alignment, edge case handling, progress indicators, success state with breakdown, and error recovery.

**Architecture:** Six focused tasks across sifa-web (frontend-only, no API changes needed). Replace hardcoded Tailwind colors with design-system-compliant semantic tokens. Add proper error surfacing for ZIP extraction failures. Improve progress indicator with per-section breakdown. Add i18n keys for all hardcoded strings. Add tests for all import components.

**Tech Stack:** React, Next.js 15, Vitest, @testing-library/react, Phosphor Icons, shadcn/ui components, next-intl

**GitHub Issue:** singi-labs/sifa-workspace#26

**Repos affected:** sifa-web only (all changes are frontend polish)

---

## Task 1: Design system color alignment

Replace all hardcoded Tailwind color classes in import components with semantic design tokens that work in both light/dark mode.

**Files:**

- Modify: `src/app/import/components/preview-step.tsx:116-162` (blue info alerts)
- Modify: `src/app/import/components/positions-table.tsx:32` (green "New" badge)
- Modify: `src/app/import/components/education-table.tsx:32` (green "New" badge)
- Modify: `src/app/import/components/confirm-step.tsx:124,137` (green/yellow success icons)

**Step 1: Write failing tests for design system compliance**

Create `tests/import/design-system.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PositionsTable } from '@/app/import/components/positions-table';
import { EducationTable } from '@/app/import/components/education-table';

const BANNED_COLOR_CLASSES = [
  'bg-blue-50',
  'bg-blue-950',
  'border-blue-200',
  'border-blue-900',
  'text-blue-600',
  'text-blue-400',
  'text-blue-900',
  'text-blue-100',
  'text-blue-700',
  'text-blue-300',
  'bg-green-100',
  'bg-green-900',
  'text-green-800',
  'text-green-200',
  'text-green-600',
  'text-yellow-500',
];

describe('Import components design system compliance', () => {
  it('PositionsTable does not use hardcoded color classes for badges', () => {
    const { container } = render(
      <PositionsTable
        positions={[{ companyName: 'Acme', title: 'Dev', startDate: '2024' }]}
        duplicateIndices={new Set()}
        onRemove={() => {}}
      />,
    );
    const html = container.innerHTML;
    for (const cls of BANNED_COLOR_CLASSES) {
      expect(html).not.toContain(cls);
    }
  });

  it('EducationTable does not use hardcoded color classes for badges', () => {
    const { container } = render(
      <EducationTable
        education={[{ institution: 'MIT', degree: 'CS' }]}
        duplicateIndices={new Set()}
        onRemove={() => {}}
      />,
    );
    const html = container.innerHTML;
    for (const cls of BANNED_COLOR_CLASSES) {
      expect(html).not.toContain(cls);
    }
  });
});
```

**Step 2: Run tests to verify they pass (no violations in non-duplicate mode)**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/design-system.test.tsx`
Expected: PASS (badges only show when duplicates present)

**Step 3: Add duplicate-mode test cases**

Add to `tests/import/design-system.test.tsx`:

```tsx
it('PositionsTable "New" badge uses semantic variant, not hardcoded green', () => {
  const { container } = render(
    <PositionsTable
      positions={[
        { companyName: 'Acme', title: 'Dev', startDate: '2024' },
        { companyName: 'Old Co', title: 'Jr Dev', startDate: '2020' },
      ]}
      duplicateIndices={new Set([1])}
      onRemove={() => {}}
    />,
  );
  const html = container.innerHTML;
  for (const cls of BANNED_COLOR_CLASSES) {
    expect(html).not.toContain(cls);
  }
});
```

**Step 4: Run tests to verify they fail**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/design-system.test.tsx`
Expected: FAIL -- `bg-green-100` found in HTML

**Step 5: Fix PositionsTable badge**

In `src/app/import/components/positions-table.tsx`, replace the hardcoded green badge:

```tsx
// Old:
<Badge className="bg-green-100 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
  New
</Badge>

// New:
<Badge variant="secondary" className="text-xs">
  New
</Badge>
```

**Step 6: Fix EducationTable badge (same pattern)**

In `src/app/import/components/education-table.tsx`, same replacement.

**Step 7: Fix PreviewStep info alerts**

In `src/app/import/components/preview-step.tsx`, replace both info alert blocks (lines 116-140 and 142-162). Replace the hardcoded blue with the semantic `muted` pattern already used elsewhere in the app:

```tsx
// Old:
<div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950" role="status">
  <Info className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" weight="fill" aria-hidden="true" />
  <div className="text-sm">
    <p className="font-medium text-blue-900 dark:text-blue-100">...</p>
    <p className="mt-1 text-blue-700 dark:text-blue-300">...</p>
  </div>
</div>

// New:
<div className="mb-6 flex gap-3 rounded-lg border bg-muted/50 p-4" role="status">
  <Info className="mt-0.5 size-5 shrink-0 text-primary" weight="fill" aria-hidden="true" />
  <div className="text-sm">
    <p className="font-medium">...</p>
    <p className="mt-1 text-muted-foreground">...</p>
  </div>
</div>
```

**Step 8: Fix ConfirmStep status colors**

In `src/app/import/components/confirm-step.tsx`:

```tsx
// Success icon: text-green-600 -> text-primary (Sifa blue = success action)
<CheckCircle className="size-12 text-primary" weight="fill" aria-hidden="true" />

// Partial icon: text-yellow-500 -> text-muted-foreground (warning, muted)
<CheckCircle className="size-12 text-muted-foreground" weight="fill" aria-hidden="true" />
```

**Step 9: Run all tests to verify they pass**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/design-system.test.tsx`
Expected: PASS

**Step 10: Commit**

```bash
git -C ~/Documents/Git/sifa-web add src/app/import/components/ tests/import/
git -C ~/Documents/Git/sifa-web commit -m "style(import): align colors with design system

Replace hardcoded Tailwind color classes (blue-*, green-*) with semantic
tokens (text-primary, bg-muted, text-muted-foreground). Fixes light/dark
mode consistency per Singi Labs design system.

Refs: singi-labs/sifa-workspace#26"
```

---

## Task 2: Surface ZIP extraction errors to user

Currently, if `processLinkedInExport()` throws, the error is silently caught (page.tsx:61-62). Users see nothing happen.

**Files:**

- Modify: `src/app/import/page.tsx:55-66` (handleFileSelected)
- Modify: `src/app/import/components/upload-step.tsx` (add error prop)
- Create: `tests/import/upload-step.test.tsx`

**Step 1: Write failing test**

Create `tests/import/upload-step.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadStep } from '@/app/import/components/upload-step';

describe('UploadStep', () => {
  it('renders drop zone', () => {
    render(<UploadStep onFileSelected={() => {}} isProcessing={false} />);
    expect(screen.getByRole('button', { name: /drop zone/i })).toBeDefined();
  });

  it('shows processing state', () => {
    render(<UploadStep onFileSelected={() => {}} isProcessing={true} />);
    expect(screen.getByText(/processing zip file/i)).toBeDefined();
  });

  it('displays extraction error when provided', () => {
    render(
      <UploadStep
        onFileSelected={() => {}}
        isProcessing={false}
        extractionError="Could not read ZIP file. The archive may be corrupted."
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Could not read ZIP file');
  });

  it('clears extraction error when a new file is selected', () => {
    const { rerender } = render(
      <UploadStep onFileSelected={() => {}} isProcessing={false} extractionError="Bad file" />,
    );
    // Parent clears error when new file starts processing
    rerender(<UploadStep onFileSelected={() => {}} isProcessing={true} extractionError={null} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/upload-step.test.tsx`
Expected: FAIL -- `extractionError` prop not accepted

**Step 3: Add extractionError prop to UploadStep**

In `src/app/import/components/upload-step.tsx`:

Add to interface:

```tsx
interface UploadStepProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  extractionError?: string | null;
}
```

Add to function signature:

```tsx
export function UploadStep({ onFileSelected, isProcessing, extractionError }: UploadStepProps) {
```

Add after the `fileError` display (after line 113):

```tsx
{
  extractionError && (
    <p className="mt-4 text-sm text-destructive" role="alert">
      {extractionError}
    </p>
  );
}
```

**Step 4: Surface the error in page.tsx**

In `src/app/import/page.tsx`:

Add state:

```tsx
const [extractionError, setExtractionError] = useState<string | null>(null);
```

Update `handleFileSelected`:

```tsx
const handleFileSelected = useCallback(async (file: File) => {
  setIsProcessing(true);
  setExtractionError(null);
  try {
    const result = await processLinkedInExport(file);
    setPreview(result);
    setStep('preview');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not read ZIP file';
    setExtractionError(message);
  } finally {
    setIsProcessing(false);
  }
}, []);
```

Pass to component:

```tsx
<UploadStep
  onFileSelected={handleFileSelected}
  isProcessing={isProcessing}
  extractionError={extractionError}
/>
```

**Step 5: Run tests to verify they pass**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/upload-step.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git -C ~/Documents/Git/sifa-web add src/app/import/ tests/import/
git -C ~/Documents/Git/sifa-web commit -m "fix(import): surface ZIP extraction errors to user

Previously, ZIP parsing failures were silently caught. Now the error
message is displayed in the upload step with role=alert for screen
readers.

Refs: singi-labs/sifa-workspace#26"
```

---

## Task 3: Improve progress indicator with per-section breakdown

Replace the fake decelerating progress animation with a real item count and show which record types are being written.

**Files:**

- Modify: `src/app/import/components/confirm-step.tsx`
- Create: `tests/import/confirm-step.test.tsx`

**Step 1: Write failing tests**

Create `tests/import/confirm-step.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfirmStep } from '@/app/import/components/confirm-step';
import type { ImportPreview } from '@/lib/import/orchestrator';

const mockPreview: ImportPreview = {
  profile: { firstName: 'Jane', lastName: 'Doe', headline: 'Engineer' },
  positions: [{ companyName: 'Acme', title: 'Dev', startDate: '2024' }],
  education: [{ institution: 'MIT' }],
  skills: [{ skillName: 'TypeScript' }, { skillName: 'React' }],
  certifications: [],
  projects: [],
  volunteering: [],
  publications: [],
  courses: [],
  honors: [],
  languages: [],
};

describe('ConfirmStep', () => {
  beforeEach(() => {
    // Mock fetch to return success
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imported: {
              profile: 1,
              positions: 1,
              education: 1,
              skills: 2,
              certifications: 0,
              projects: 0,
              volunteering: 0,
              publications: 0,
              courses: 0,
              honors: 0,
              languages: 0,
            },
          }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows importing state with item count', () => {
    render(<ConfirmStep preview={mockPreview} onDone={() => {}} />);
    expect(screen.getByText(/writing.*5.*records/i)).toBeDefined();
  });

  it('shows success state with section breakdown', async () => {
    render(<ConfirmStep preview={mockPreview} onDone={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/import complete/i)).toBeDefined();
    });
    // Should show breakdown
    expect(screen.getByText(/1 position/i)).toBeDefined();
    expect(screen.getByText(/1 education/i)).toBeDefined();
    expect(screen.getByText(/2 skills/i)).toBeDefined();
  });

  it('shows view profile CTA on success', async () => {
    render(<ConfirmStep preview={mockPreview} onDone={() => {}} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view your profile/i })).toBeDefined();
    });
  });

  it('shows error state with retry button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<ConfirmStep preview={mockPreview} onDone={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeDefined();
    });
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
  });

  it('shows partial state with warning', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imported: {
              profile: 1,
              positions: 1,
              education: 0,
              skills: 0,
              certifications: 0,
              projects: 0,
              volunteering: 0,
              publications: 0,
              courses: 0,
              honors: 0,
              languages: 0,
            },
            warning: 'DB sync delayed',
          }),
      }),
    );
    render(<ConfirmStep preview={mockPreview} onDone={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/partially complete/i)).toBeDefined();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/confirm-step.test.tsx`
Expected: FAIL -- no section breakdown text

**Step 3: Rewrite ConfirmStep with per-section breakdown**

Replace the success state in `src/app/import/components/confirm-step.tsx` to include a breakdown. Update the `ImportResult` interface and the response parsing to use the actual `imported` object from the API:

```tsx
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
```

In the success/partial state, render a breakdown list:

```tsx
function ImportBreakdown({ counts }: { counts: ImportedCounts }) {
  const sections = [
    { label: 'profile', count: counts.profile },
    { label: 'position', count: counts.positions },
    { label: 'education', count: counts.education },
    { label: 'skill', count: counts.skills },
    { label: 'certification', count: counts.certifications },
    { label: 'project', count: counts.projects },
    { label: 'volunteering', count: counts.volunteering },
    { label: 'publication', count: counts.publications },
    { label: 'course', count: counts.courses },
    { label: 'honor', count: counts.honors },
    { label: 'language', count: counts.languages },
  ].filter((s) => s.count > 0);

  return (
    <ul className="text-sm text-muted-foreground">
      {sections.map((s) => (
        <li key={s.label}>
          {s.count} {s.count === 1 ? s.label : `${s.label}s`}
        </li>
      ))}
    </ul>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/confirm-step.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git -C ~/Documents/Git/sifa-web add src/app/import/components/confirm-step.tsx tests/import/
git -C ~/Documents/Git/sifa-web commit -m "feat(import): add per-section breakdown to import results

Show imported item counts by section type (positions, education, skills,
etc.) on success. Parse the actual API response instead of approximating.
Replace fake progress deceleration with real total-item indicator.

Refs: singi-labs/sifa-workspace#26"
```

---

## Task 4: Improve ImportItemList type safety

Replace `Record<string, unknown>` with proper generics to eliminate `as unknown` casts in preview-step.tsx.

**Files:**

- Modify: `src/app/import/components/import-item-list.tsx`
- Modify: `src/app/import/components/preview-step.tsx:216-283` (remove casts)
- Create: `tests/import/import-item-list.test.tsx`

**Step 1: Write failing test**

Create `tests/import/import-item-list.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportItemList } from '@/app/import/components/import-item-list';

interface TestItem {
  name: string;
  detail?: string;
}

describe('ImportItemList', () => {
  const items: TestItem[] = [{ name: 'Item A', detail: 'Detail A' }, { name: 'Item B' }];

  it('renders items with labels and details', () => {
    render(
      <ImportItemList
        items={items}
        labelFn={(item) => item.name}
        detailFn={(item) => item.detail}
        emptyMessage="None"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText('Item A')).toBeDefined();
    expect(screen.getByText('Detail A')).toBeDefined();
    expect(screen.getByText('Item B')).toBeDefined();
  });

  it('renders empty message when no items', () => {
    render(
      <ImportItemList
        items={[]}
        labelFn={(item: TestItem) => item.name}
        emptyMessage="Nothing here"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText('Nothing here')).toBeDefined();
  });

  it('calls onRemove with correct index', async () => {
    const onRemove = vi.fn();
    render(
      <ImportItemList
        items={items}
        labelFn={(item) => item.name}
        emptyMessage="None"
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /remove item a/i }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('has accessible remove buttons with aria-label', () => {
    render(
      <ImportItemList
        items={items}
        labelFn={(item) => item.name}
        emptyMessage="None"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /remove item a/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /remove item b/i })).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/import-item-list.test.tsx`
Expected: FAIL -- TypeScript error, generic interface doesn't accept `TestItem`

**Step 3: Make ImportItemList generic**

Replace `src/app/import/components/import-item-list.tsx`:

```tsx
'use client';

interface ImportItemListProps<T> {
  items: T[];
  labelFn: (item: T) => string;
  detailFn?: (item: T) => string | undefined;
  emptyMessage: string;
  onRemove: (index: number) => void;
}

export function ImportItemList<T>({
  items,
  labelFn,
  detailFn,
  emptyMessage,
  onRemove,
}: ImportItemListProps<T>) {
  if (items.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y py-2">
      {items.map((item, i) => {
        const label = labelFn(item);
        const detail = detailFn?.(item);
        return (
          <li key={i} className="flex items-start justify-between gap-4 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
            </div>
            <button
              type="button"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${label}`}
            >
              &times;
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

**Step 4: Remove casts from preview-step.tsx**

In `src/app/import/components/preview-step.tsx`, remove all `as unknown as Record<string, unknown>[]` casts. The generic component now infers types directly:

```tsx
// Old:
<ImportItemList
  items={data.certifications as unknown as Record<string, unknown>[]}
  labelFn={(c) => c.name as string}
  ...

// New:
<ImportItemList
  items={data.certifications}
  labelFn={(c) => c.name}
  ...
```

Apply this to all 7 ImportItemList usages (certifications, projects, volunteering, publications, courses, honors, languages).

**Step 5: Run tests to verify they pass**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/import-item-list.test.tsx`
Expected: PASS

**Step 6: Run typecheck to verify no type errors**

Run: `cd ~/Documents/Git/sifa-web && npx tsc --noEmit`
Expected: PASS (no errors)

**Step 7: Commit**

```bash
git -C ~/Documents/Git/sifa-web add src/app/import/components/ tests/import/
git -C ~/Documents/Git/sifa-web commit -m "refactor(import): make ImportItemList generic, remove type casts

Replace Record<string, unknown> with generic <T> parameter. Removes 7
'as unknown' casts from preview-step.tsx. Adds tests for ImportItemList.

Refs: singi-labs/sifa-workspace#26"
```

---

## Task 5: Add i18n keys for all hardcoded import strings

Move all hardcoded English strings in import components to the i18n locale file.

**Files:**

- Modify: `src/i18n/locales/en.json` (add import keys)
- Modify: `src/app/import/page.tsx` (use t() for subtitle)
- Modify: `src/app/import/components/upload-step.tsx` (use t())
- Modify: `src/app/import/components/preview-step.tsx` (use t())
- Modify: `src/app/import/components/confirm-step.tsx` (use t())

**Step 1: Add all i18n keys to en.json**

Expand the `import` section in `src/i18n/locales/en.json`:

```json
{
  "import": {
    "title": "Import from LinkedIn",
    "subtitle": "Bring your professional history to Sifa. Your data is processed entirely in your browser.",
    "uploadStep": "Upload",
    "previewStep": "Review",
    "confirmStep": "Import",
    "upload": {
      "heading": "Upload your LinkedIn data export",
      "description": "Go to LinkedIn > Settings > Data Privacy > \"Download larger data archive\". Upload the ZIP file you receive (batch 1 arrives in ~10 minutes).",
      "dropZone": "Drag and drop your LinkedIn ZIP file here, or click to browse",
      "dropZoneLabel": "Drop zone for LinkedIn ZIP file",
      "processing": "Processing ZIP file...",
      "fileTypeError": "Please select a ZIP file (.zip). LinkedIn exports are delivered as ZIP archives.",
      "fileSizeError": "File is too large (max 500 MB). Try re-downloading your LinkedIn export.",
      "privacyNote": "Your data is processed entirely in your browser. No raw CSV data is sent to our servers."
    },
    "preview": {
      "heading": "Review imported data",
      "duplicatesTitle": "Some items already exist on your profile",
      "duplicatesDescription": "{count, plural, one {# item matches} other {# items match}} your existing profile data and will be overwritten.",
      "newItemsNote": "{count, plural, one {# item is} other {# items are}} new.",
      "removeNote": "You can remove items you don't want to import.",
      "existingTitle": "Your profile already has data",
      "existingDescription": "Importing will replace all existing profile data with the data below. Your profile headline and summary will also be updated.",
      "alreadyOnProfile": "Already on profile",
      "new": "New",
      "itemCount": "{count, plural, one {# item} other {# items}} to import",
      "confirmButton": "Confirm & Import",
      "back": "Back"
    },
    "confirm": {
      "importing": "Importing your data...",
      "writingRecords": "Writing {count} records to your Personal Data Server...",
      "success": "Import complete",
      "partial": "Import partially complete",
      "error": "Import failed",
      "importedItems": "Successfully imported {count, plural, one {# item} other {# items}} to your profile.",
      "failedCount": "{count, plural, one {# item} other {# items}} could not be imported.",
      "viewFailed": "View failed items",
      "retryFailed": "Retry failed items",
      "retry": "Retry",
      "viewProfile": "View your profile",
      "goToProfile": "Go to profile"
    }
  }
}
```

**Step 2: Thread `useTranslations('import')` through components**

Each component receives `t` via `useTranslations` (already used in page.tsx). Add the hook to upload-step, preview-step, and confirm-step.

For UploadStep, replace hardcoded strings:

```tsx
import { useTranslations } from 'next-intl';
// ...
const t = useTranslations('import.upload');
// <CardTitle>{t('heading')}</CardTitle>
// etc.
```

Same pattern for PreviewStep (`import.preview`) and ConfirmStep (`import.confirm`).

**Step 3: Replace hardcoded file validation strings in upload-step**

The `handleFile` callback currently has hardcoded error strings. Replace with `t()` calls:

```tsx
setFileError(t('fileTypeError'));
// and
setFileError(t('fileSizeError'));
```

**Step 4: Run typecheck and existing tests**

Run: `cd ~/Documents/Git/sifa-web && npx tsc --noEmit && npx vitest run`
Expected: PASS

**Step 5: Commit**

```bash
git -C ~/Documents/Git/sifa-web add src/app/import/ src/i18n/
git -C ~/Documents/Git/sifa-web commit -m "feat(import): add i18n keys for all import wizard strings

Move all hardcoded English strings to en.json locale file. Covers
upload step, preview step, confirm step, error messages, and CTA labels.

Refs: singi-labs/sifa-workspace#26"
```

---

## Task 6: Add preview-step tests and edge case handling

Test the preview step including edge cases: empty sections, all duplicates, removing all items disabling import.

**Files:**

- Create: `tests/import/preview-step.test.tsx`
- Modify: `src/app/import/components/preview-step.tsx` (if bugs found)

**Step 1: Write preview-step tests**

Create `tests/import/preview-step.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewStep } from '@/app/import/components/preview-step';
import type { ImportPreview } from '@/lib/import/orchestrator';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    // Simple mock that returns the key
    if (values?.count !== undefined) return `${values.count} items`;
    return key;
  },
}));

const fullPreview: ImportPreview = {
  profile: { firstName: 'Jane', lastName: 'Doe', headline: 'Engineer', location: 'Amsterdam' },
  positions: [{ companyName: 'Acme', title: 'Senior Dev', startDate: '2024-01', current: true }],
  education: [{ institution: 'TU Delft', degree: 'MSc CS' }],
  skills: [{ skillName: 'TypeScript' }],
  certifications: [{ name: 'AWS Solutions Architect' }],
  projects: [],
  volunteering: [],
  publications: [],
  courses: [],
  honors: [],
  languages: [{ name: 'Dutch', proficiency: 'native' }],
};

const emptyPreview: ImportPreview = {
  profile: null,
  positions: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  volunteering: [],
  publications: [],
  courses: [],
  honors: [],
  languages: [],
};

describe('PreviewStep', () => {
  it('renders profile info when present', () => {
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={null}
        onConfirm={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('Jane Doe')).toBeDefined();
    expect(screen.getByText('Engineer')).toBeDefined();
  });

  it('shows tabs only for sections with data', () => {
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={null}
        onConfirm={() => {}}
        onBack={() => {}}
      />,
    );
    // Should have tabs for positions, education, skills, certifications, languages
    expect(screen.getByRole('tab', { name: /positions/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /education/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /skills/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /certifications/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /languages/i })).toBeDefined();
    // Should NOT have tabs for empty sections
    expect(screen.queryByRole('tab', { name: /projects/i })).toBeNull();
    expect(screen.queryByRole('tab', { name: /volunteering/i })).toBeNull();
  });

  it('disables confirm button when no items', () => {
    render(
      <PreviewStep
        preview={emptyPreview}
        existingData={null}
        onConfirm={() => {}}
        onBack={() => {}}
      />,
    );
    const btn = screen.getByRole('button', { name: /confirm/i });
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('calls onConfirm with current data state', async () => {
    const onConfirm = vi.fn();
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={null}
        onConfirm={onConfirm}
        onBack={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const data = onConfirm.mock.calls[0][0];
    expect(data.positions).toHaveLength(1);
  });

  it('calls onBack when back button clicked', async () => {
    const onBack = vi.fn();
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={null}
        onConfirm={() => {}}
        onBack={onBack}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows duplicate alert when existing data matches', () => {
    const existingData = {
      positions: [{ companyName: 'Acme', title: 'Senior Dev', startDate: '2024-01' }],
      education: [],
      skills: [],
    };
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={existingData}
        onConfirm={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByRole('status')).toBeDefined();
  });
});
```

**Step 2: Run tests**

Run: `cd ~/Documents/Git/sifa-web && npx vitest run tests/import/preview-step.test.tsx`
Expected: Results depend on i18n mock accuracy; fix any issues.

**Step 3: Fix any test failures and iterate**

Adjust mocks or component code as needed to make tests pass.

**Step 4: Commit**

```bash
git -C ~/Documents/Git/sifa-web add tests/import/
git -C ~/Documents/Git/sifa-web commit -m "test(import): add preview-step component tests

Cover profile rendering, dynamic tabs, duplicate detection, confirm/back
callbacks, disabled state when no items, and edge cases.

Refs: singi-labs/sifa-workspace#26"
```

---

## Final Verification

After all tasks:

1. Run full test suite: `cd ~/Documents/Git/sifa-web && npx vitest run`
2. Run typecheck: `cd ~/Documents/Git/sifa-web && npx tsc --noEmit`
3. Run lint: `cd ~/Documents/Git/sifa-web && npx eslint src/app/import/`
4. Verify dark mode manually (if dev server available)

Then create PR against `main` referencing singi-labs/sifa-workspace#26.
