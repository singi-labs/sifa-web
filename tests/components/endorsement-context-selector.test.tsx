import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { EndorsementContextSelector } from '@/components/endorsement-context-selector';

describe('EndorsementContextSelector', () => {
  it('renders all context options', () => {
    render(<EndorsementContextSelector value="" onChange={vi.fn()} />);

    expect(screen.getByText('Worked together at...')).toBeDefined();
    expect(screen.getByText('Collaborated in...')).toBeDefined();
    expect(screen.getByText('Supervised / was supervised by')).toBeDefined();
    expect(screen.getByText('Co-authored')).toBeDefined();
    expect(screen.getByText('Other')).toBeDefined();
  });

  it('has proper radiogroup role and label', () => {
    render(<EndorsementContextSelector value="" onChange={vi.fn()} />);

    const group = screen.getByRole('radiogroup');
    expect(group).toBeDefined();
    expect(group.getAttribute('aria-label')).toBe("How do you know this person's expertise?");
  });

  it('calls onChange when option selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EndorsementContextSelector value="" onChange={onChange} />);

    await user.click(screen.getByLabelText('Worked together at...'));
    expect(onChange).toHaveBeenCalledWith('[worked_together]');
  });

  it('shows detail input when option with hasDetail is selected', () => {
    render(
      <EndorsementContextSelector value="[worked_together]" onChange={vi.fn()} />,
    );

    expect(screen.getByLabelText('Details (optional)')).toBeDefined();
  });

  it('does not show detail input for options without hasDetail', () => {
    render(
      <EndorsementContextSelector value="[supervised_by]" onChange={vi.fn()} />,
    );

    expect(screen.queryByLabelText('Details (optional)')).toBeNull();
  });

  it('calls onChange with detail when typing in detail input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EndorsementContextSelector value="[worked_together]" onChange={onChange} />,
    );

    const detailInput = screen.getByLabelText('Details (optional)');
    await user.type(detailInput, 'Stripe');
    // Each keystroke fires onChange
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    expect(lastCall![0]).toBe('[worked_together: Stripe]');
  });

  it('disables all inputs when disabled prop is true', () => {
    render(
      <EndorsementContextSelector value="[worked_together]" onChange={vi.fn()} disabled={true} />,
    );

    const radios = screen.getAllByRole('radio');
    for (const radio of radios) {
      expect((radio as HTMLInputElement).disabled).toBe(true);
    }
    expect((screen.getByLabelText('Details (optional)') as HTMLInputElement).disabled).toBe(true);
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(
      <EndorsementContextSelector value="" onChange={vi.fn()} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
