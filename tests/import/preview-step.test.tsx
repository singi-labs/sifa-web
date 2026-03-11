import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ImportPreview } from '@/lib/import/orchestrator';
import type { ExistingProfileData } from '@/app/import/page';
import { PreviewStep } from '@/app/import/components/preview-step';

// Mock Phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  Info: (props: Record<string, unknown>) => <span data-testid="icon-info" {...props} />,
  X: (props: Record<string, unknown>) => <span data-testid="icon-x" {...props} />,
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

const existingData: ExistingProfileData = {
  positions: [{ companyName: 'Acme', title: 'Senior Dev', startDate: '2024-01' }],
  education: [{ institution: 'TU Delft', degree: 'MSc CS' }],
  skills: [{ skillName: 'TypeScript' }],
};

describe('PreviewStep', () => {
  it('renders profile info when present', () => {
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={null}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Jane Doe')).toBeDefined();
    expect(screen.getByText('Engineer')).toBeDefined();
    expect(screen.getByText('Amsterdam')).toBeDefined();
  });

  it('shows tabs only for sections with data', () => {
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={null}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    const tabLabels = tabs.map((tab) => tab.textContent);

    // Sections with data should have tabs
    expect(tabLabels.some((label) => label?.includes('Positions'))).toBe(true);
    expect(tabLabels.some((label) => label?.includes('Education'))).toBe(true);
    expect(tabLabels.some((label) => label?.includes('Skills'))).toBe(true);
    expect(tabLabels.some((label) => label?.includes('Certifications'))).toBe(true);
    expect(tabLabels.some((label) => label?.includes('Languages'))).toBe(true);

    // Empty sections should NOT have tabs
    expect(tabLabels.some((label) => label?.includes('Projects'))).toBe(false);
    expect(tabLabels.some((label) => label?.includes('Volunteering'))).toBe(false);
    expect(tabLabels.some((label) => label?.includes('Publications'))).toBe(false);
    expect(tabLabels.some((label) => label?.includes('Courses'))).toBe(false);
    expect(tabLabels.some((label) => label?.includes('Honors'))).toBe(false);
  });

  it('disables confirm button when no items', () => {
    render(
      <PreviewStep
        preview={emptyPreview}
        existingData={null}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm & Import/i });
    expect(confirmButton.hasAttribute('disabled')).toBe(true);
  });

  it('calls onConfirm with current data state when confirmed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <PreviewStep
        preview={fullPreview}
        existingData={null}
        onConfirm={onConfirm}
        onBack={vi.fn()}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm & Import/i });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledOnce();
    // The callback receives the current data state (same as preview since nothing was removed)
    const calledWith = onConfirm.mock.calls[0]![0] as ImportPreview;
    expect(calledWith.positions).toHaveLength(1);
    expect(calledWith.education).toHaveLength(1);
    expect(calledWith.skills).toHaveLength(1);
  });

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(
      <PreviewStep preview={fullPreview} existingData={null} onConfirm={vi.fn()} onBack={onBack} />,
    );

    const backButton = screen.getByRole('button', { name: /Back/i });
    await user.click(backButton);

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows duplicate info alert when existing data matches', () => {
    render(
      <PreviewStep
        preview={fullPreview}
        existingData={existingData}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    // The duplicate alert should be visible (role="status")
    const statusAlerts = screen.getAllByRole('status');
    expect(statusAlerts.length).toBeGreaterThanOrEqual(1);

    // Should show the duplicates title text
    expect(screen.getByText('Some items already exist on your profile')).toBeDefined();
  });

  it('shows existing-data info alert when existing data but no duplicates', () => {
    const nonMatchingExisting: ExistingProfileData = {
      positions: [{ companyName: 'Other Corp', title: 'Manager', startDate: '2020-01' }],
      education: [],
      skills: [],
    };

    render(
      <PreviewStep
        preview={fullPreview}
        existingData={nonMatchingExisting}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Your profile already has data')).toBeDefined();
  });

  it('does not show tabs for empty sections', () => {
    const positionsOnly: ImportPreview = {
      ...emptyPreview,
      profile: null,
      positions: [{ companyName: 'Acme', title: 'Dev', startDate: '2023-01', current: true }],
    };

    render(
      <PreviewStep
        preview={positionsOnly}
        existingData={null}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(1);
    expect(tabs[0]!.textContent).toContain('Positions');

    // Verify no other section tabs exist
    expect(screen.queryByRole('tab', { name: /Education/i })).toBeNull();
    expect(screen.queryByRole('tab', { name: /Skills/i })).toBeNull();
    expect(screen.queryByRole('tab', { name: /Certifications/i })).toBeNull();
    expect(screen.queryByRole('tab', { name: /Languages/i })).toBeNull();
  });
});
