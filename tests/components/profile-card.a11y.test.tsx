import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ProfileCard } from '@/components/profile-card';

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ProfileCard accessibility', () => {
  it('should have no accessibility violations with handle only', async () => {
    const { container } = render(<ProfileCard handle="alice.bsky.social" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with handle and headline', async () => {
    const { container } = render(
      <ProfileCard handle="alice.bsky.social" headline="Software Engineer" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with avatar', async () => {
    const { container } = render(
      <ProfileCard
        handle="alice.bsky.social"
        headline="Software Engineer"
        avatar="https://example.com/avatar.jpg"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
