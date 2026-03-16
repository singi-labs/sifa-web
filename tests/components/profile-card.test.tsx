import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileCard } from '@/components/profile-card';

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { vi } from 'vitest';

describe('ProfileCard', () => {
  it('renders handle and headline', () => {
    render(<ProfileCard handle="alice.bsky.social" headline="Software Engineer" />);
    expect(screen.getByText('alice.bsky.social')).toBeDefined();
    expect(screen.getByText('Software Engineer')).toBeDefined();
  });

  it('links to the profile page', () => {
    render(<ProfileCard handle="alice.bsky.social" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/p/alice.bsky.social');
  });

  it('shows first letter as avatar placeholder when no avatar', () => {
    render(<ProfileCard handle="alice.bsky.social" />);
    expect(screen.getByText('A')).toBeDefined();
  });

  it('renders avatar image when provided', () => {
    render(<ProfileCard handle="alice.bsky.social" avatar="https://example.com/avatar.jpg" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  it('renders current role and company when both provided', () => {
    render(
      <ProfileCard
        handle="alice.bsky.social"
        currentRole="Senior Engineer"
        currentCompany="Acme Corp"
      />,
    );
    expect(screen.getByText('Senior Engineer at Acme Corp')).toBeDefined();
  });

  it('does not render current role row when no current position', () => {
    render(<ProfileCard handle="alice.bsky.social" />);
    expect(screen.queryByText(/\bat\b/)).toBeNull();
  });

  it('shows Unclaimed badge when claimed is false', () => {
    render(<ProfileCard handle="someone.bsky.social" claimed={false} />);
    expect(screen.getByText('Unclaimed')).toBeDefined();
  });

  it('does not show Unclaimed badge when claimed is true', () => {
    render(<ProfileCard handle="someone.bsky.social" claimed={true} />);
    expect(screen.queryByText('Unclaimed')).toBeNull();
  });

  it('does not show Unclaimed badge when claimed is undefined', () => {
    render(<ProfileCard handle="someone.bsky.social" />);
    expect(screen.queryByText('Unclaimed')).toBeNull();
  });
});
