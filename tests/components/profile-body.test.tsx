import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { ProfileBody } from '@/components/profile-body';
import type { Profile } from '@/lib/types';

function renderWithProvider(profile: Profile) {
  return render(
    <ProfileEditProvider initialProfile={profile}>
      <ProfileBody />
    </ProfileEditProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (this: Record<string, unknown>) {
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      this.unobserve = vi.fn();
    }),
  );
});

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

describe('ProfileBody', () => {
  it('renders about section when profile has about text', () => {
    renderWithProvider({
      ...baseProfile,
      headline: 'Software Engineer',
      about: 'I am a developer',
    });
    expect(screen.getByText('I am a developer')).toBeDefined();
  });

  it('renders activity overview', () => {
    renderWithProvider(baseProfile);
    expect(screen.getByText('Activity')).toBeDefined();
  });

  it('renders track record section', () => {
    renderWithProvider(baseProfile);
    expect(screen.getByText('Track Record')).toBeDefined();
  });

  it('renders career section when positions exist', () => {
    const profile: Profile = {
      ...baseProfile,
      positions: [
        { rkey: '1', companyName: 'Acme', title: 'Engineer', startDate: '2020', current: true },
      ],
    };
    renderWithProvider(profile);
    expect(screen.getByText('Career')).toBeDefined();
    expect(screen.getByText('Engineer')).toBeDefined();
  });

  it('renders section nav when 3+ sections populated', () => {
    const profile: Profile = {
      ...baseProfile,
      headline: 'Software Engineer',
      about: 'Summary',
      positions: [
        { rkey: '1', companyName: 'Acme', title: 'Engineer', startDate: '2020', current: true },
      ],
      education: [{ rkey: '1', institution: 'MIT', startDate: '2016' }],
    };
    renderWithProvider(profile);
    const navs = screen.getAllByRole('navigation', { name: 'Profile sections' });
    expect(navs.length).toBe(2); // desktop + mobile
  });

  it('hides section nav when fewer than 3 sections', () => {
    const profile: Profile = {
      ...baseProfile,
      positions: [
        { rkey: '1', companyName: 'Acme', title: 'Engineer', startDate: '2020', current: true },
      ],
    };
    renderWithProvider(profile);
    expect(screen.queryByRole('navigation', { name: 'Profile sections' })).toBeNull();
  });

  it('renders all extended sections when populated', () => {
    const profile: Profile = {
      ...baseProfile,
      skills: [{ rkey: '1', skillName: 'TypeScript' }],
      projects: [{ rkey: '1', name: 'My Project', startDate: '2023' }],
      languages: [{ rkey: '1', language: 'English', proficiency: 'native' }],
    };
    renderWithProvider(profile);
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('My Project')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
  });
});
