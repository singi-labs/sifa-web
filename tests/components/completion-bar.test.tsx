import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompletionBar } from '@/components/completion-bar';
import type { Profile } from '@/lib/types';

const baseProfile: Profile = {
  did: 'did:plc:test',
  handle: 'test.bsky.social',
  isOwnProfile: true,
  followersCount: 0,
  followingCount: 0,
  connectionsCount: 0,
  positions: [],
  education: [],
  skills: [],
};

describe('CompletionBar', () => {
  it('renders for own profile with incomplete data', () => {
    render(<CompletionBar profile={baseProfile} />);
    expect(screen.getByText('Profile strength')).toBeDefined();
    expect(screen.getByText('0%')).toBeDefined();
  });

  it('shows next action link', () => {
    render(<CompletionBar profile={baseProfile} />);
    const links = screen.getAllByText('Add a profile photo');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('calculates percentage with some items completed', () => {
    const profile: Profile = {
      ...baseProfile,
      avatar: 'https://example.com/pic.jpg',
      headline: 'Dev',
    };
    render(<CompletionBar profile={profile} />);
    expect(screen.getByText('25%')).toBeDefined();
  });

  it('hides at 100%', () => {
    const profile: Profile = {
      ...baseProfile,
      avatar: 'https://example.com/pic.jpg',
      headline: 'Dev',
      about: 'Hi',
      positions: [
        { rkey: '1', companyName: 'Co', title: 'Eng', startDate: '2020', current: true },
        {
          rkey: '2',
          companyName: 'Co2',
          title: 'Jr',
          startDate: '2018',
          endDate: '2020',
          current: false,
        },
      ],
      skills: [
        { rkey: '1', skillName: 'TS' },
        { rkey: '2', skillName: 'React' },
        { rkey: '3', skillName: 'Node' },
      ],
      education: [{ rkey: '1', institution: 'MIT', startDate: '2016' }],
      website: 'https://example.com',
    };
    const { container } = render(<CompletionBar profile={profile} />);
    expect(container.innerHTML).toBe('');
  });

  it('hides for non-owners', () => {
    const { container } = render(
      <CompletionBar profile={{ ...baseProfile, isOwnProfile: false }} />,
    );
    expect(container.innerHTML).toBe('');
  });
});
