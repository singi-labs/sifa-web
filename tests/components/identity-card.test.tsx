import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdentityCard } from '@/components/identity-card';

// Mock navigator.clipboard
Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

const baseProps = {
  did: 'did:plc:abc123',
  handle: 'alice.bsky.social',
  displayName: 'Alice Smith',
  claimed: true,
};

describe('IdentityCard', () => {
  it('renders display name and handle', () => {
    render(<IdentityCard {...baseProps} />);

    expect(screen.getByText('Alice Smith')).toBeDefined();
    expect(screen.getByText('@alice.bsky.social')).toBeDefined();
  });

  it('falls back to handle when no display name', () => {
    render(<IdentityCard did="did:plc:abc" handle="bob.bsky.social" claimed={true} />);

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('bob.bsky.social')).toBeDefined();
  });

  it('renders headline', () => {
    render(<IdentityCard {...baseProps} headline="Senior Engineer at Acme" />);

    expect(screen.getByText('Senior Engineer at Acme')).toBeDefined();
  });

  it('renders location and website', () => {
    render(<IdentityCard {...baseProps} location="Amsterdam, NL" website="https://alice.dev" />);

    expect(screen.getByText('Amsterdam, NL')).toBeDefined();
    expect(screen.getByText('alice.dev')).toBeDefined();
  });

  it('renders open to pills', () => {
    render(<IdentityCard {...baseProps} openTo={['Full-time roles', 'Mentoring']} />);

    expect(screen.getByText('Full-time roles')).toBeDefined();
    expect(screen.getByText('Mentoring')).toBeDefined();
  });

  it('renders default trust stats with zeros for new users', () => {
    render(<IdentityCard {...baseProps} />);

    const stats = screen.getByRole('list', { name: 'Trust stats' });
    expect(stats).toBeDefined();
    // Should show 3 stats with value 0
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders provided trust stats', () => {
    render(
      <IdentityCard
        {...baseProps}
        trustStats={[
          { key: 'connections', label: 'Connections', value: 42 },
          { key: 'endorsements', label: 'Endorsements', value: 7 },
          { key: 'reactions', label: 'Reactions', value: 128 },
        ]}
      />,
    );

    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('128')).toBeDefined();
  });

  it('renders verified badge when verified accounts exist', () => {
    render(
      <IdentityCard
        {...baseProps}
        verifiedAccounts={[{ platform: 'github', identifier: 'alice' }]}
      />,
    );

    expect(screen.getByLabelText('Verified')).toBeDefined();
  });

  it('does not render verified badge when no verified accounts', () => {
    render(<IdentityCard {...baseProps} />);

    expect(screen.queryByLabelText('Verified')).toBeNull();
  });

  it('renders Follow button for other profiles', () => {
    render(<IdentityCard {...baseProps} isOwnProfile={false} isFollowing={false} />);

    expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
  });

  it('renders Edit button for own profile', () => {
    render(<IdentityCard {...baseProps} isOwnProfile={true} />);

    expect(screen.getByRole('link', { name: /Edit profile/ })).toBeDefined();
  });

  it('renders Share button', () => {
    render(<IdentityCard {...baseProps} />);

    expect(screen.getByRole('button', { name: 'Share profile' })).toBeDefined();
  });

  it('shows avatar letter placeholder when no avatar', () => {
    render(<IdentityCard {...baseProps} />);

    expect(screen.getByText('A')).toBeDefined();
  });
});
