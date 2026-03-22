import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TouchSafeCard } from '@/components/ui/touch-safe-card';

describe('TouchSafeCard', () => {
  it('renders full-card link wrapper visible only on pointer-fine', () => {
    render(
      <TouchSafeCard href="/test">
        <div>Card content</div>
      </TouchSafeCard>,
    );

    const fullCardLink = screen.getByTestId('touch-safe-card-link');
    expect(fullCardLink.tagName).toBe('A');
    expect(fullCardLink.getAttribute('href')).toBe('/test');
    expect(fullCardLink.className).toContain('pointer-coarse:hidden');
  });

  it('renders a plain wrapper visible only on pointer-coarse', () => {
    render(
      <TouchSafeCard href="/test">
        <div>Card content</div>
      </TouchSafeCard>,
    );

    const touchWrapper = screen.getByTestId('touch-safe-card-plain');
    expect(touchWrapper.tagName).toBe('DIV');
    expect(touchWrapper.className).toContain('pointer-fine:hidden');
  });

  it('passes className to both wrappers', () => {
    render(
      <TouchSafeCard href="/test" className="my-class">
        <div>Card content</div>
      </TouchSafeCard>,
    );

    expect(screen.getByTestId('touch-safe-card-link').className).toContain('my-class');
    expect(screen.getByTestId('touch-safe-card-plain').className).toContain('my-class');
  });
});
