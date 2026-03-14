# External Account Verification UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace negative "Unverified" badges with positive-only "Verified" badges, add verification instructions in the add/edit form for verifiable platforms, and fix stale verification state after save.

**Architecture:** Three independent frontend changes: (1) remove Unverified badge rendering, (2) add a `hint` field type to `EditDialog` + platform-specific verification instructions in the form, (3) add `onPostSave` callback to `EditableSection` that polls for updated verification status.

**Tech Stack:** Next.js 15+, React, TypeScript, Vitest, @testing-library/react

---

### Task 1: Remove Unverified Badge (Positive Labeling)

**Files:**
- Modify: `src/components/profile-sections/external-accounts-section.tsx:147-152`
- Modify: `tests/components/external-accounts-section.test.tsx:59-63`

**Step 1: Update test -- unverified accounts show no badge**

In `tests/components/external-accounts-section.test.tsx`, change the test at line 59:

```tsx
it('shows no badge for verifiable but unverified accounts', () => {
  const acc = { ...baseAccount, verifiable: true, verified: false };
  withProvider(<ExternalAccountsSection accounts={[acc]} />, { externalAccounts: [acc] });
  expect(screen.queryByText('Unverified')).toBeNull();
  expect(screen.queryByLabelText('Verified')).toBeNull();
});
```

**Step 2: Run test to verify it fails**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/external-accounts-section.test.tsx`
Expected: FAIL -- "Unverified" text is still found in the DOM.

**Step 3: Remove Unverified badge from component**

In `src/components/profile-sections/external-accounts-section.tsx`, delete lines 147-152 (the `acc.verifiable && !acc.verified` block):

```tsx
{acc.verifiable && !acc.verified && (
  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
    <WarningCircle size={12} weight="fill" />
    {t('unverified')}
  </span>
)}
```

Also remove the `WarningCircle` import from the Phosphor icons import line (line 5) since it's no longer used.

**Step 4: Run test to verify it passes**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/external-accounts-section.test.tsx`
Expected: All 7 tests PASS.

**Step 5: Run lint and typecheck**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm lint && pnpm typecheck`
Expected: PASS

**Step 6: Commit**

```bash
cd ~/Documents/Git/sifa-web/.worktrees/verification-ux
git add src/components/profile-sections/external-accounts-section.tsx tests/components/external-accounts-section.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): replace negative Unverified badge with positive-only Verified

Remove the amber "Unverified" badge from verifiable external accounts.
Only verified accounts now show a green checkmark badge. Unverified
accounts (whether verifiable or not) show no badge, avoiding negative
labeling that implies something is wrong.

Closes #88
EOF
)"
```

---

### Task 2: Add Hint Field Type to EditDialog

**Files:**
- Modify: `src/components/profile-editor/edit-dialog.tsx:9-19` (FieldDef type), `src/components/profile-editor/edit-dialog.tsx:103-161` (render logic)
- Create: `tests/components/edit-dialog-hint.test.tsx`

**Step 1: Write the failing test**

Create `tests/components/edit-dialog-hint.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditDialog, type FieldDef } from '@/components/profile-editor/edit-dialog';

const fields: FieldDef[] = [
  {
    name: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    options: [
      { value: 'github', label: 'GitHub' },
      { value: 'youtube', label: 'YouTube' },
    ],
  },
  { name: 'url', label: 'URL', type: 'url', required: true },
  {
    name: 'verificationHint',
    label: 'Verification',
    type: 'hint',
    description: 'Add your profile URL to GitHub.',
    visibleWhen: (values) => values.platform === 'github',
  },
];

describe('EditDialog hint field', () => {
  it('renders hint text when visibleWhen is true', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'github', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Add your profile URL to GitHub.')).toBeDefined();
  });

  it('hides hint when visibleWhen is false', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'youtube', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText('Add your profile URL to GitHub.')).toBeNull();
  });

  it('hint does not render an input element', () => {
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: 'github', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('Verification')).toBeNull();
  });

  it('hint appears when platform changes to verifiable', async () => {
    const user = userEvent.setup();
    render(
      <EditDialog
        title="Add Link"
        fields={fields}
        initialValues={{ platform: '', url: '' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText('Add your profile URL to GitHub.')).toBeNull();
    await user.selectOptions(screen.getByRole('combobox'), 'github');
    expect(screen.getByText('Add your profile URL to GitHub.')).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/edit-dialog-hint.test.tsx`
Expected: FAIL -- `hint` is not a valid type in FieldDef.

**Step 3: Implement hint field type**

In `src/components/profile-editor/edit-dialog.tsx`:

1. Update the `FieldDef` type (line 12) to include `'hint'`:

```tsx
type?: 'text' | 'textarea' | 'month' | 'url' | 'checkbox' | 'select' | 'hint';
```

2. In the form rendering (inside the `fields.map` callback, after the `visibleWhen` check at line 104), add a hint branch before the label/input rendering. Replace the field rendering block (lines 106-161) with:

```tsx
<div key={field.name}>
  {field.type === 'hint' ? (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
      {field.description}
    </div>
  ) : (
    <>
      <label htmlFor={`edit-${field.name}`} className="mb-1 block text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </label>
      {field.description && (
        <p className="mb-1 text-xs text-muted-foreground">{field.description}</p>
      )}
      {field.type === 'textarea' ? (
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
    </>
  )}
</div>
```

Also skip hint fields from the initial values setup (line 49-52). Change the loop to:

```tsx
for (const f of fields) {
  if (f.type === 'hint') continue;
  init[f.name] = initialValues[f.name] ?? (f.type === 'checkbox' ? false : '');
}
```

**Step 4: Run test to verify it passes**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/edit-dialog-hint.test.tsx`
Expected: All 4 tests PASS.

**Step 5: Run full test suite + lint + typecheck**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run && pnpm lint && pnpm typecheck`
Expected: All PASS.

**Step 6: Commit**

```bash
cd ~/Documents/Git/sifa-web/.worktrees/verification-ux
git add src/components/profile-editor/edit-dialog.tsx tests/components/edit-dialog-hint.test.tsx
git commit -m "$(cat <<'EOF'
feat(editor): add hint field type to EditDialog

Add a 'hint' type to FieldDef that renders as a read-only info box
instead of an input. Supports visibleWhen for conditional display.
Hint fields are excluded from form state initialization.
EOF
)"
```

---

### Task 3: Add Verification Instructions to External Account Form

**Files:**
- Modify: `src/components/profile-editor/form-fields.ts:80-100`
- Modify: `src/components/profile-sections/external-accounts-section.tsx` (pass handle to fields)
- Modify: `src/i18n/locales/en.json` (add verification hint strings)
- Modify: `tests/setup.ts` (add mock translations)

**Step 1: Write the failing test**

Add a test to `tests/components/external-accounts-section.test.tsx`:

```tsx
it('shows verification hint when selecting a verifiable platform', async () => {
  const user = userEvent.setup();
  withProvider(
    <ExternalAccountsSection accounts={[]} isOwnProfile />,
    { externalAccounts: [], handle: 'gui.do' },
  );
  await user.click(screen.getByRole('button', { name: 'Add Other Profiles' }));
  await user.selectOptions(screen.getByRole('combobox'), 'github');
  expect(screen.getByText(/Add your Sifa profile URL/)).toBeDefined();
});
```

Also add the `userEvent` import at the top of the file if not present.

**Step 2: Run test to verify it fails**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/external-accounts-section.test.tsx`
Expected: FAIL -- no verification hint text found.

**Step 3: Add verification hint strings to i18n**

In `src/i18n/locales/en.json`, add to the `sections` object:

```json
"verifyHintGithub": "Add your Sifa profile URL as the Website on your GitHub profile at github.com/settings/profile. We'll verify the link automatically when you save.",
"verifyHintWebsite": "Add <link rel=\"me\" href=\"https://sifa.id/p/{handle}\"> to your site's <head> tag. We'll verify the link automatically when you save.",
"verifyHintFediverse": "Add your Sifa profile URL (https://sifa.id/p/{handle}) to one of your profile metadata fields. We'll verify the link automatically when you save.",
"verifyHintRss": "Include a link to your Sifa profile (https://sifa.id/p/{handle}) with rel=\"me\" on your feed's HTML page. We'll verify the link automatically when you save."
```

Also add corresponding entries in `tests/setup.ts` under the `sections` key.

**Step 4: Create `getVerificationHintFields` function in form-fields.ts**

In `src/components/profile-editor/form-fields.ts`, change `EXTERNAL_ACCOUNT_FIELDS` from a constant array to a function that accepts a handle and translations:

```tsx
import type { FieldDef } from './edit-dialog';
import { PLATFORM_OPTIONS } from '@/lib/platforms';

const VERIFIABLE_PLATFORMS = new Set(['github', 'website', 'fediverse', 'rss']);

export function getExternalAccountFields(
  handle: string,
  tSections: (key: string, params?: Record<string, string>) => string,
): FieldDef[] {
  return [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      placeholder: 'Select a platform...',
      options: PLATFORM_OPTIONS,
    },
    { name: 'url', label: 'URL', type: 'url', required: true },
    { name: 'label', label: 'Label', placeholder: 'My Blog, Photography...' },
    {
      name: 'feedUrl',
      label: 'RSS / Atom Feed URL',
      type: 'url',
      placeholder: 'https://example.com/feed.xml',
      description:
        'Used to show your posts in the ATmosphere Stream. Leave empty for auto-detection.',
      visibleWhen: (values) => values.platform === 'website',
    },
    {
      name: 'verificationHint',
      label: 'Verification',
      type: 'hint',
      description: '', // set dynamically via visibleWhen
      visibleWhen: (values) => {
        const platform = values.platform as string;
        return VERIFIABLE_PLATFORMS.has(platform);
      },
      // The description is static per FieldDef, so we use platform-specific hint fields instead
    },
  ];
}
```

Actually, the `description` is static per field definition, but we need it to change based on the selected platform. Better approach: create one hint field per verifiable platform, each with its own `visibleWhen`:

```tsx
export function getExternalAccountFields(
  handle: string,
  tSections: (key: string, params?: Record<string, string>) => string,
): FieldDef[] {
  return [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      placeholder: 'Select a platform...',
      options: PLATFORM_OPTIONS,
    },
    { name: 'url', label: 'URL', type: 'url', required: true },
    { name: 'label', label: 'Label', placeholder: 'My Blog, Photography...' },
    {
      name: 'feedUrl',
      label: 'RSS / Atom Feed URL',
      type: 'url',
      placeholder: 'https://example.com/feed.xml',
      description:
        'Used to show your posts in the ATmosphere Stream. Leave empty for auto-detection.',
      visibleWhen: (values) => values.platform === 'website',
    },
    {
      name: 'verifyHintGithub',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintGithub', { handle }),
      visibleWhen: (values) => values.platform === 'github',
    },
    {
      name: 'verifyHintWebsite',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintWebsite', { handle }),
      visibleWhen: (values) => values.platform === 'website',
    },
    {
      name: 'verifyHintFediverse',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintFediverse', { handle }),
      visibleWhen: (values) => values.platform === 'fediverse',
    },
    {
      name: 'verifyHintRss',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintRss', { handle }),
      visibleWhen: (values) => values.platform === 'rss',
    },
  ];
}

// Keep backward compat export for other consumers (none expected, but safe)
export const EXTERNAL_ACCOUNT_FIELDS = getExternalAccountFields('', (k) => k);
```

**Step 5: Update ExternalAccountsSection to use the function**

In `src/components/profile-sections/external-accounts-section.tsx`:

1. Replace `EXTERNAL_ACCOUNT_FIELDS` import with `getExternalAccountFields`
2. Get handle from profile context: `const { profile } = useProfileEdit();`  (already available)
3. Build fields: `const externalAccountFields = useMemo(() => getExternalAccountFields(profile.handle, t), [profile.handle, t]);`
4. Pass `externalAccountFields` to `EditableSection` instead of `EXTERNAL_ACCOUNT_FIELDS`

Add `useMemo` to the React import.

**Step 6: Run test to verify it passes**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/external-accounts-section.test.tsx`
Expected: All tests PASS.

**Step 7: Run full suite + lint + typecheck**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run && pnpm lint && pnpm typecheck`
Expected: All PASS.

**Step 8: Commit**

```bash
cd ~/Documents/Git/sifa-web/.worktrees/verification-ux
git add src/components/profile-editor/form-fields.ts src/components/profile-sections/external-accounts-section.tsx src/i18n/locales/en.json tests/setup.ts tests/components/external-accounts-section.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add verification instructions for verifiable platforms

When adding or editing an external account for a verifiable platform
(GitHub, website, Fediverse, RSS), show platform-specific instructions
on how to set up rel="me" verification. Instructions include the
user's Sifa profile URL for easy reference.
EOF
)"
```

---

### Task 4: Poll for Verification Status After Save

**Files:**
- Modify: `src/components/profile-editor/editable-section.tsx:56-74,95-125`
- Modify: `src/components/profile-sections/external-accounts-section.tsx`
- Modify: `src/lib/profile-api.ts` (add `fetchExternalAccounts` function)

**Step 1: Write the failing test**

Add to `tests/components/editable-section.test.tsx`:

```tsx
it('calls onPostSave after successful create', async () => {
  const user = userEvent.setup();
  const onPostSave = vi.fn();
  render(
    <EditableSection<TestSkill>
      sectionTitle="Skills"
      profileKey="skills"
      isOwnProfile
      fields={SKILL_FIELDS}
      toValues={toValues}
      fromValues={fromValues}
      collection="id.sifa.profile.skill"
      renderEntry={renderEntry}
      onPostSave={onPostSave}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Add Skills' }));
  await user.type(screen.getByLabelText(/Skill Name/), 'Go');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await vi.waitFor(() => {
    expect(onPostSave).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/editable-section.test.tsx`
Expected: FAIL -- `onPostSave` is not a valid prop.

**Step 3: Add `onPostSave` prop to EditableSection**

In `src/components/profile-editor/editable-section.tsx`:

1. Add to `EditableSectionProps`:
```tsx
/** Called after a successful create or update. Use for post-save side effects like verification polling. */
onPostSave?: () => void;
```

2. Destructure in the component:
```tsx
}: EditableSectionProps<T>) {
```
becomes:
```tsx
  onPostSave,
}: EditableSectionProps<T>) {
```

3. In `handleSave`, after each successful save (both edit and create), call `onPostSave`:

After `toast.success(...)` in both the edit branch (line 108) and add branch (line 120), add:
```tsx
onPostSave?.();
```

4. Add `onPostSave` to the `useCallback` dependency array.

**Step 4: Add `fetchExternalAccounts` to profile-api.ts**

In `src/lib/profile-api.ts`, add:

```tsx
export async function fetchExternalAccounts(
  handleOrDid: string,
): Promise<ExternalAccount[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/profile/${encodeURIComponent(handleOrDid)}/external-accounts`,
      { credentials: 'include' },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { accounts: ExternalAccount[] };
    return data.accounts;
  } catch {
    return [];
  }
}
```

Add the `ExternalAccount` import from `@/lib/types`.

**Step 5: Wire up onPostSave in ExternalAccountsSection**

In `src/components/profile-sections/external-accounts-section.tsx`:

1. Import `fetchExternalAccounts` from `@/lib/profile-api`
2. Get `updateProfile` from `useProfileEdit()` (add to existing destructure)
3. Create the post-save handler:

```tsx
const handlePostSave = useCallback(() => {
  const timeoutId = setTimeout(async () => {
    const fresh = await fetchExternalAccounts(profile.handle);
    if (fresh.length > 0) {
      updateProfile({ externalAccounts: fresh });
    }
  }, 2000);
  return () => clearTimeout(timeoutId);
}, [profile.handle, updateProfile]);
```

4. Pass `onPostSave={handlePostSave}` to `EditableSection`.

**Step 6: Run test to verify it passes**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run tests/components/editable-section.test.tsx`
Expected: All tests PASS.

**Step 7: Run full suite + lint + typecheck**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run && pnpm lint && pnpm typecheck`
Expected: All PASS.

**Step 8: Commit**

```bash
cd ~/Documents/Git/sifa-web/.worktrees/verification-ux
git add src/components/profile-editor/editable-section.tsx src/components/profile-sections/external-accounts-section.tsx src/lib/profile-api.ts tests/components/editable-section.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): poll for verification status after external account save

After creating or updating an external account, poll the API after
2 seconds to fetch updated verification status. This ensures the
Verified badge appears without requiring a full page reload.

Adds onPostSave callback to EditableSection for post-save side effects.
EOF
)"
```

---

### Task 5: Clean Up Unused i18n Key and Final Verification

**Files:**
- Modify: `src/i18n/locales/en.json` (remove `unverified` key from sections)
- Modify: `tests/setup.ts` (remove `unverified` from mock translations)

**Step 1: Remove unused `unverified` i18n key**

In `src/i18n/locales/en.json`, remove `"unverified": "Unverified"` from the `sections` object.

In `tests/setup.ts`, remove `unverified: 'Unverified'` from the `sections` mock.

**Step 2: Run full suite + lint + typecheck + build**

Run: `cd ~/Documents/Git/sifa-web/.worktrees/verification-ux && pnpm vitest run && pnpm lint && pnpm typecheck && pnpm build`
Expected: All PASS.

**Step 3: Commit**

```bash
cd ~/Documents/Git/sifa-web/.worktrees/verification-ux
git add src/i18n/locales/en.json tests/setup.ts
git commit -m "$(cat <<'EOF'
chore: remove unused unverified i18n key

The Unverified badge has been removed in favor of positive-only labeling.
EOF
)"
```
