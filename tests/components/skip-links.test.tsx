import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLinks } from '@/components/skip-links';

describe('SkipLinks', () => {
  it('renders a skip to content link', () => {
    render(<SkipLinks />);

    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('#main-content');
  });
});
