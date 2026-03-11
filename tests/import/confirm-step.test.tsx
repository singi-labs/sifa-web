import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfirmStep } from '@/app/import/components/confirm-step';
import type { ImportPreview } from '@/lib/import/orchestrator';

// Mock Phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  CheckCircle: (props: Record<string, unknown>) => <span data-testid="check-circle" {...props} />,
  XCircle: (props: Record<string, unknown>) => <span data-testid="x-circle" {...props} />,
  ArrowRight: (props: Record<string, unknown>) => <span data-testid="arrow-right" {...props} />,
}));

const mockPreview: ImportPreview = {
  profile: {
    firstName: 'Alice',
    lastName: 'Smith',
    headline: 'Engineer',
    location: '',
  },
  positions: [
    {
      companyName: 'Acme Corp',
      title: 'Developer',
      startDate: '2020-01',
    },
  ],
  education: [
    {
      institution: 'MIT',
      degree: 'BSc',
      startDate: '2016',
    },
  ],
  skills: [{ skillName: 'TypeScript' }, { skillName: 'React' }],
  certifications: [],
  projects: [],
  volunteering: [],
  publications: [],
  courses: [],
  honors: [],
  languages: [],
};

const mockImportedCounts = {
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
};

describe('ConfirmStep', () => {
  const onDone = vi.fn();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows importing state with total item count on mount', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
    );

    render(<ConfirmStep preview={mockPreview} onDone={onDone} />);

    expect(screen.getByText('Importing your data...')).toBeDefined();
    expect(screen.getByText(/Writing 5 records/)).toBeDefined();
  });

  it('shows success with per-section breakdown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ imported: mockImportedCounts }),
      }),
    );

    render(<ConfirmStep preview={mockPreview} onDone={onDone} />);

    await waitFor(() => {
      expect(screen.getByText('Import complete')).toBeDefined();
    });

    expect(screen.getByText('1 profile')).toBeDefined();
    expect(screen.getByText('1 position')).toBeDefined();
    expect(screen.getByText('1 education entry')).toBeDefined();
    expect(screen.getByText('2 skills')).toBeDefined();
  });

  it('shows "View your profile" button on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ imported: mockImportedCounts }),
      }),
    );

    render(<ConfirmStep preview={mockPreview} onDone={onDone} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View your profile/i })).toBeDefined();
    });
  });

  it('shows error state with retry button when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(<ConfirmStep preview={mockPreview} onDone={onDone} />);

    await waitFor(() => {
      expect(screen.getByText('Import failed')).toBeDefined();
    });

    expect(screen.getByText('Network error')).toBeDefined();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeDefined();
  });

  it('shows partial state when response has warning', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imported: mockImportedCounts,
            warning: 'Some items could not be written',
          }),
      }),
    );

    render(<ConfirmStep preview={mockPreview} onDone={onDone} />);

    await waitFor(() => {
      expect(screen.getByText('Import partially complete')).toBeDefined();
    });
  });
});
