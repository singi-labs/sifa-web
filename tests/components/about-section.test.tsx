import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { AboutSection } from '@/components/about-section';
import type { Profile } from '@/lib/types';

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

describe('AboutSection', () => {
  it('renders about text', () => {
    withProvider(<AboutSection about="Hello world" />, { about: 'Hello world' });
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('returns null when no about and not own profile', () => {
    const { container } = withProvider(<AboutSection about="" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows prompt for own profile when empty', () => {
    withProvider(<AboutSection about="" isOwnProfile={true} />, { isOwnProfile: true });
    expect(screen.getByText('Add a professional summary')).toBeDefined();
  });

  it('collapses long text with read more button', () => {
    const longText = 'A'.repeat(400);
    withProvider(<AboutSection about={longText} />, { about: longText });

    expect(screen.getByText(/A{100,}\.\.\.$/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Read more' })).toBeDefined();
  });

  it('expands text on read more click', async () => {
    const user = userEvent.setup();
    const longText = 'A'.repeat(400);
    withProvider(<AboutSection about={longText} />, { about: longText });

    await user.click(screen.getByRole('button', { name: 'Read more' }));

    expect(screen.getByRole('button', { name: 'Read less' })).toBeDefined();
    // Full text should not end with ...
    expect(screen.getByText(longText)).toBeDefined();
  });

  it('does not show read more for short text', () => {
    withProvider(<AboutSection about="Short text" />, { about: 'Short text' });
    expect(screen.queryByRole('button', { name: 'Read more' })).toBeNull();
  });
});
