import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { EndorsementDialog } from '@/components/endorsement-dialog';

const defaultProps = {
  name: 'TypeScript',
  skillRkey: 'abc123',
  targetDid: 'did:plc:target',
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
};

describe('EndorsementDialog', () => {
  it('renders with skill name in title', () => {
    render(<EndorsementDialog {...defaultProps} />);

    expect(screen.getByText('Endorse TypeScript')).toBeDefined();
  });

  it('has proper ARIA attributes', () => {
    render(<EndorsementDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Endorse TypeScript');
  });

  it('renders relationship context selector', () => {
    render(<EndorsementDialog {...defaultProps} />);

    expect(screen.getByText("How do you know this person's expertise?")).toBeDefined();
  });

  it('renders comment textarea', () => {
    render(<EndorsementDialog {...defaultProps} />);

    expect(
      screen.getByLabelText("Share context about this person's expertise (optional)"),
    ).toBeDefined();
  });

  it('shows attribution notice', () => {
    render(<EndorsementDialog {...defaultProps} />);

    expect(screen.getByText('Your endorsement will be attributed to your profile')).toBeDefined();
  });

  it('does not display any "endorse back" prompt', () => {
    render(<EndorsementDialog {...defaultProps} />);

    const text = document.body.textContent ?? '';
    expect(text).not.toContain('endorse back');
    expect(text).not.toContain('Endorse back');
    expect(text).not.toContain('reciprocal');
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<EndorsementDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when X button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<EndorsementDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('submits with correct data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<EndorsementDialog {...defaultProps} onSubmit={onSubmit} onClose={onClose} />);

    // Select a context
    await user.click(screen.getByLabelText('Worked together at...'));

    // Type a comment
    const textarea = screen.getByLabelText(
      "Share context about this person's expertise (optional)",
    );
    await user.type(textarea, 'Great skills');

    // Submit
    await user.click(screen.getByText('Endorse'));

    expect(onSubmit).toHaveBeenCalledOnce();
    const callData = onSubmit.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
    expect(callData).toBeDefined();
    expect(callData!.skillRkey).toBe('abc123');
    expect(callData!.comment).toContain('[worked_together]');
    expect(callData!.comment).toContain('Great skills');
    expect(callData!.relationshipContext).toBe('[worked_together]');
  });

  it('submits without context or comment', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EndorsementDialog {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByText('Endorse'));

    expect(onSubmit).toHaveBeenCalledOnce();
    const callData = onSubmit.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
    expect(callData).toBeDefined();
    expect(callData!.skillRkey).toBe('abc123');
    expect(callData!.comment).toBeUndefined();
    expect(callData!.relationshipContext).toBeUndefined();
  });

  it('shows error on submit failure', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('API error'));
    render(<EndorsementDialog {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByText('Endorse'));

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Failed to save')).toBeDefined();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<EndorsementDialog {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
