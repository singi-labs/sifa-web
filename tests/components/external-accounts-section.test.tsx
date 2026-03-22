import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    <ProfileEditProvider initialProfile={{ ...baseProfile, ...profile }}>{ui}</ProfileEditProvider>,
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

  it('renders ATProto entry even when accounts array is empty', () => {
    withProvider(<ExternalAccountsSection accounts={[]} />);
    expect(screen.getByRole('link', { name: 'Bluesky (@test.bsky.social)' })).toBeDefined();
    expect(screen.getByLabelText('Verified')).toBeDefined();
  });

  it('renders section with accounts', () => {
    withProvider(<ExternalAccountsSection accounts={[baseAccount]} />, {
      externalAccounts: [baseAccount],
    });
    expect(screen.getByText('Also find test.bsky.social on…')).toBeDefined();
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
    // Bluesky entry + the verified GitHub account = 2 verified badges
    expect(screen.getAllByLabelText('Verified').length).toBe(2);
  });

  it('shows no badge for verifiable but unverified accounts', () => {
    const acc = { ...baseAccount, verifiable: true, verified: false };
    withProvider(<ExternalAccountsSection accounts={[acc]} />, { externalAccounts: [acc] });
    expect(screen.queryByText('Unverified')).toBeNull();
    // Only the synthetic Bluesky entry has a verified badge
    expect(screen.getAllByLabelText('Verified').length).toBe(1);
  });

  it('shows no badge for non-verifiable accounts', () => {
    const acc = { ...baseAccount, platform: 'instagram', verifiable: false, verified: false };
    withProvider(<ExternalAccountsSection accounts={[acc]} />, { externalAccounts: [acc] });
    expect(screen.queryByText('Unverified')).toBeNull();
    // Only the synthetic Bluesky entry has a verified badge
    expect(screen.getAllByLabelText('Verified').length).toBe(1);
  });

  it('shows verification hint when selecting a verifiable platform', async () => {
    const user = userEvent.setup();
    withProvider(<ExternalAccountsSection accounts={[]} isOwnProfile />, {
      externalAccounts: [],
      handle: 'gui.do',
    });
    await user.click(screen.getByRole('button', { name: 'Add Links' }));
    await user.selectOptions(screen.getByRole('combobox'), 'github');
    expect(screen.getByText(/Add your Sifa profile URL/)).toBeDefined();
  });

  it('renders correct link targets', () => {
    withProvider(<ExternalAccountsSection accounts={[baseAccount]} />, {
      externalAccounts: [baseAccount],
    });
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link.getAttribute('href')).toBe('https://github.com/testuser');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
