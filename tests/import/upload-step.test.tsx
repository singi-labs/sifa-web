import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadStep } from '@/app/import/components/upload-step';

vi.mock('@phosphor-icons/react', () => ({
  Upload: (props: Record<string, unknown>) => <span data-testid="icon-upload" {...props} />,
}));

describe('UploadStep', () => {
  const defaultProps = {
    onFileSelected: vi.fn(),
    isProcessing: false,
  };

  it('renders drop zone with accessible label', () => {
    render(<UploadStep {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Drop zone for LinkedIn ZIP file' })).toBeDefined();
  });

  it('shows processing state text', () => {
    render(<UploadStep {...defaultProps} isProcessing={true} />);

    expect(screen.getByText('Processing ZIP file...')).toBeDefined();
  });

  it('displays extraction error with role=alert', () => {
    render(
      <UploadStep {...defaultProps} extractionError="Invalid ZIP: missing required CSV files" />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toBe('Invalid ZIP: missing required CSV files');
  });

  it('does not display extraction error when null', () => {
    const { rerender } = render(
      <UploadStep {...defaultProps} extractionError="Some error" />,
    );

    expect(screen.getByRole('alert')).toBeDefined();

    rerender(<UploadStep {...defaultProps} extractionError={null} />);

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
