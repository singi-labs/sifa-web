import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const dangerZoneTranslations: Record<string, string> = {
  deleteModalTitle: 'Your Sifa account has been deleted.',
  deleteModalBody:
    'Your AT Protocol account and Personal Data Server still exist. Sifa only removed its own data. If you want to delete your AT Protocol account entirely, visit your PDS provider\u2019s settings.',
  deleteModalBlueskyLink: 'Bluesky: Settings > Account > Delete Account',
  deleteModalDismiss: 'Got it',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => dangerZoneTranslations[key] ?? key,
}));

import { DeletedAccountModal } from '@/components/deleted-account-modal';

describe('DeletedAccountModal', () => {
  it('renders modal with title and body text', () => {
    render(<DeletedAccountModal />);

    expect(screen.getByText('Your Sifa account has been deleted.')).toBeDefined();
    expect(
      screen.getByText(/Your AT Protocol account and Personal Data Server still exist/),
    ).toBeDefined();
  });

  it('renders a Bluesky settings link with correct href', () => {
    render(<DeletedAccountModal />);

    const link = screen.getByRole('link', {
      name: 'Bluesky: Settings > Account > Delete Account',
    });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('https://bsky.app/settings');
  });

  it('hides when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeletedAccountModal />);

    expect(screen.getByText('Your Sifa account has been deleted.')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Got it' }));

    expect(screen.queryByText('Your Sifa account has been deleted.')).toBeNull();
  });
});
