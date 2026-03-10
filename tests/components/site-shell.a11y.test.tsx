import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AuthProvider } from '@/components/auth-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BetaBanner } from '@/components/beta-banner';
import { SkipLinks } from '@/components/skip-links';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';

describe('Site shell accessibility', () => {
  it('SiteHeader has no a11y violations', async () => {
    const { container } = render(<AuthProvider><SiteHeader /></AuthProvider>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SiteFooter has no a11y violations', async () => {
    const { container } = render(<SiteFooter />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BetaBanner has no a11y violations', async () => {
    const { container } = render(<BetaBanner />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SkipLinks has no a11y violations', async () => {
    const { container } = render(<SkipLinks />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ThemeToggle has no a11y violations', async () => {
    const { container } = render(<ThemeToggle />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('MobileNav has no a11y violations', async () => {
    const { container } = render(<MobileNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
