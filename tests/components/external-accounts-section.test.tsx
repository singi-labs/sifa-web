import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExternalAccountsSection } from '@/components/profile-sections/external-accounts-section';
import type { ExternalAccount } from '@/lib/types';

describe('ExternalAccountsSection', () => {
  const baseAccount: ExternalAccount = {
    rkey: '1',
    platform: 'github',
    url: 'https://github.com/testuser',
    verifiable: true,
    verified: false,
  };

  it('renders nothing when accounts array is empty', () => {
    const { container } = render(<ExternalAccountsSection accounts={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders section with accounts', () => {
    render(<ExternalAccountsSection accounts={[baseAccount]} />);
    expect(screen.getByText('Other Profiles')).toBeDefined();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeDefined();
  });

  it('shows custom label when provided', () => {
    render(<ExternalAccountsSection accounts={[{ ...baseAccount, label: 'My Projects' }]} />);
    expect(screen.getByRole('link', { name: 'My Projects' })).toBeDefined();
  });

  it('shows verified checkmark for verified accounts', () => {
    render(<ExternalAccountsSection accounts={[{ ...baseAccount, verified: true }]} />);
    expect(screen.getByLabelText('Verified')).toBeDefined();
  });

  it('shows unverified badge for verifiable but unverified accounts', () => {
    render(
      <ExternalAccountsSection
        accounts={[{ ...baseAccount, verifiable: true, verified: false }]}
      />,
    );
    expect(screen.getByText('Unverified')).toBeDefined();
  });

  it('shows no badge for non-verifiable accounts', () => {
    render(
      <ExternalAccountsSection
        accounts={[{ ...baseAccount, platform: 'instagram', verifiable: false, verified: false }]}
      />,
    );
    expect(screen.queryByText('Unverified')).toBeNull();
    expect(screen.queryByLabelText('Verified')).toBeNull();
  });

  it('renders correct link targets', () => {
    render(<ExternalAccountsSection accounts={[baseAccount]} />);
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link.getAttribute('href')).toBe('https://github.com/testuser');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
