import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Banned hardcoded color classes that should be replaced with semantic tokens
const BANNED_CLASSES = [
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

function assertNoBannedClasses(container: HTMLElement) {
  const html = container.innerHTML;
  for (const cls of BANNED_CLASSES) {
    expect(html).not.toContain(cls);
  }
}

// Mock @phosphor-icons/react to render simple spans
vi.mock('@phosphor-icons/react', () => ({
  Info: (props: Record<string, unknown>) => (
    <span data-testid="info-icon" className={props.className as string} />
  ),
  X: (props: Record<string, unknown>) => (
    <span data-testid="x-icon" className={props.className as string} />
  ),
  Eye: (props: Record<string, unknown>) => (
    <span data-testid="eye-icon" className={props.className as string} />
  ),
  CheckCircle: (props: Record<string, unknown>) => (
    <span data-testid="check-circle-icon" className={props.className as string} />
  ),
  XCircle: (props: Record<string, unknown>) => (
    <span data-testid="x-circle-icon" className={props.className as string} />
  ),
  ArrowRight: (props: Record<string, unknown>) => (
    <span data-testid="arrow-right-icon" className={props.className as string} />
  ),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

// Mock auth provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ session: { did: 'did:plc:test' }, isLoading: false }),
}));

describe('Design system color alignment', () => {
  describe('PreviewStep', () => {
    it('does not contain banned color classes when existingData has duplicates', async () => {
      const { PreviewStep } = await import('@/app/(main)/import/components/preview-step');

      const preview = {
        profile: {
          firstName: 'Test',
          lastName: 'User',
          headline: 'Dev',
          location: { country: 'NL' },
        },
        positions: [
          { company: 'Acme', title: 'Dev', startedAt: '2020-01' },
          { company: 'NewCo', title: 'Lead', startedAt: '2022-06' },
        ],
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

      const existingData = {
        positions: [{ company: 'Acme', title: 'Dev', startedAt: '2020-01' }],
        education: [],
        skills: [],
      };

      const { container } = render(
        <PreviewStep
          preview={preview}
          existingData={existingData}
          onConfirm={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      assertNoBannedClasses(container);
    });

    it('does not contain banned color classes when existingData has no duplicates', async () => {
      const { PreviewStep } = await import('@/app/(main)/import/components/preview-step');

      const preview = {
        profile: {
          firstName: 'Test',
          lastName: 'User',
          headline: 'Dev',
          location: { country: 'NL' },
        },
        positions: [{ company: 'NewCo', title: 'Lead', startedAt: '2022-06' }],
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

      const existingData = {
        positions: [{ company: 'OtherCo', title: 'Other', startedAt: '2019-01' }],
        education: [],
        skills: [],
      };

      const { container } = render(
        <PreviewStep
          preview={preview}
          existingData={existingData}
          onConfirm={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      assertNoBannedClasses(container);
    });
  });

  describe('PositionsTable', () => {
    it('does not contain banned color classes for New badge', async () => {
      const { PositionsTable } = await import('@/app/(main)/import/components/positions-table');

      const positions = [
        { company: 'Acme', title: 'Dev', startedAt: '2020-01' },
        { company: 'NewCo', title: 'Lead', startedAt: '2022-06' },
      ];

      // Index 0 is duplicate, so index 1 should show "New" badge
      const duplicateIndices = new Set([0]);

      const { container } = render(
        <PositionsTable
          positions={positions}
          duplicateIndices={duplicateIndices}
          onRemove={vi.fn()}
        />,
      );

      assertNoBannedClasses(container);
    });
  });

  describe('EducationTable', () => {
    it('does not contain banned color classes for New badge', async () => {
      const { EducationTable } = await import('@/app/(main)/import/components/education-table');

      const education = [
        { institution: 'MIT', degree: 'CS' },
        { institution: 'Stanford', degree: 'MBA' },
      ];

      const duplicateIndices = new Set([0]);

      const { container } = render(
        <EducationTable
          education={education}
          duplicateIndices={duplicateIndices}
          onRemove={vi.fn()}
        />,
      );

      assertNoBannedClasses(container);
    });
  });

  describe('ConfirmStep', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ importedCount: 2, failedItems: [] }),
        }),
      );
    });

    it('does not contain banned color classes on success', async () => {
      const { ConfirmStep } = await import('@/app/(main)/import/components/confirm-step');

      const preview = {
        profile: null,
        positions: [{ company: 'Acme', title: 'Dev', startedAt: '2020-01' }],
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

      const { container } = render(<ConfirmStep preview={preview} onDone={vi.fn()} />);

      // Wait for the fetch to resolve and status to become 'success'
      await vi.waitFor(() => {
        expect(container.innerHTML).toContain('Successfully imported');
      });

      assertNoBannedClasses(container);
    });

    it('does not contain banned color classes on partial success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              importedCount: 1,
              failedItems: ['Position: Dev at Acme'],
              warning: 'Some items failed',
            }),
        }),
      );

      const { ConfirmStep } = await import('@/app/(main)/import/components/confirm-step');

      const preview = {
        profile: null,
        positions: [
          { company: 'Acme', title: 'Dev', startedAt: '2020-01' },
          { company: 'NewCo', title: 'Lead', startedAt: '2022-06' },
        ],
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

      const { container } = render(<ConfirmStep preview={preview} onDone={vi.fn()} />);

      await vi.waitFor(() => {
        expect(container.innerHTML).toContain('Import completed with warnings');
      });

      assertNoBannedClasses(container);
    });
  });
});
