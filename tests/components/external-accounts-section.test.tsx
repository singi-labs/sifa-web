import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { ExternalAccountsSection } from '@/components/profile-sections/external-accounts-section';
import type { ExternalAccount, Profile } from '@/lib/types';

const baseProfile: Profile = {
  did: 'did:plc:test',
  handle: 'test.bsky.social',
  claimed: true,
  followersCount: 0,
  followingCount: 0,
  connectionsCount: 0,
  positions: [],
  education: [],
  skills: [],
};

function withProvider(ui: React.ReactElement, profile: Partial<Profile> = {}) {
  return render(
    <ProfileEditProvider initialProfile={{ ...baseProfile, ...profile }}>
      {ui}
    </ProfileEditProvider>,
  );
}

describe('ExternalAccountsSection', () => {
  const baseAccount: ExternalAccount = {
    rkey: '1',
    platform: 'github',
    url: 'https://github.com/testuser',
    verifiable: true,
    verified: false,
  };

  it('renders nothing when accounts array is empty', () => {
    const { container } = withProvider(<ExternalAccountsSection accounts={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders section with accounts', () => {
    withProvider(<ExternalAccountsSection accounts={[baseAccount]} />, { externalAccounts: [baseAccount] });
    expect(screen.getByText('Other Profiles')).toBeDefined();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeDefined();
  });

  it('shows custom label when provided', () => {
    const acc = { ...baseAccount, label: 'My Projects' };
    withProvider(<ExternalAccountsSection accounts={[acc]} />, { externalAccounts: [acc] });
    expect(screen.getByRole('link', { name: 'My Projects' })).toBeDefined();
  });

  it('shows verified checkmark for verified accounts', () => {
    const acc = { ...baseAccount, verified: true };
    withProvider(<ExternalAccountsSection accounts={[acc]} />, { externalAccounts: [acc] });
    expect(screen.getByLabelText('Verified')).toBeDefined();
  });

  it('shows unverified badge for verifiable but unverified accounts', () => {
    const acc = { ...baseAccount, verifiable: true, verified: false };
    withProvider(<ExternalAccountsSection accounts={[acc]} />, { externalAccounts: [acc] });
    expect(screen.getByText('Unverified')).toBeDefined();
  });

  it('shows no badge for non-verifiable accounts', () => {
    const acc = { ...baseAccount, platform: 'instagram', verifiable: false, verified: false };
    withProvider(<ExternalAccountsSection accounts={[acc]} />, { externalAccounts: [acc] });
    expect(screen.queryByText('Unverified')).toBeNull();
    expect(screen.queryByLabelText('Verified')).toBeNull();
  });

  it('renders correct link targets', () => {
    withProvider(<ExternalAccountsSection accounts={[baseAccount]} />, { externalAccounts: [baseAccount] });
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link.getAttribute('href')).toBe('https://github.com/testuser');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
