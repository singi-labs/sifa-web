import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import type { Profile } from '@/lib/types';
import { ProfileEditProvider, useProfileEdit } from '@/components/profile-edit-provider';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    did: 'did:plc:test',
    handle: 'test.bsky.social',
    claimed: true,
    followersCount: 0,
    followingCount: 0,
    connectionsCount: 0,
    positions: [],
    education: [],
    skills: [],
    ...overrides,
  };
}

function wrapper(profile: Profile) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <ProfileEditProvider initialProfile={profile}>{children}</ProfileEditProvider>;
  };
}

describe('ProfileEditProvider', () => {
  it('provides initial profile data to consumers', () => {
    const profile = makeProfile({ headline: 'Engineer' });

    function Consumer() {
      const { profile: p } = useProfileEdit();
      return <span>{p.headline}</span>;
    }

    render(
      <ProfileEditProvider initialProfile={profile}>
        <Consumer />
      </ProfileEditProvider>,
    );

    expect(screen.getByText('Engineer')).toBeDefined();
  });

  it('updateProfile updates top-level fields', () => {
    const profile = makeProfile({ headline: 'Old' });
    const { result } = renderHook(() => useProfileEdit(), {
      wrapper: wrapper(profile),
    });

    act(() => {
      result.current.updateProfile({ headline: 'New', location: 'NL' });
    });

    expect(result.current.profile.headline).toBe('New');
    expect(result.current.profile.location).toBe('NL');
  });

  it('addItem appends to the array', () => {
    const profile = makeProfile({
      skills: [{ rkey: 's1', skillName: 'TypeScript' }],
    });
    const { result } = renderHook(() => useProfileEdit(), {
      wrapper: wrapper(profile),
    });

    act(() => {
      result.current.addItem('skills', { rkey: 's2', skillName: 'Rust' });
    });

    expect(result.current.profile.skills).toHaveLength(2);
    expect(result.current.profile.skills[1]?.skillName).toBe('Rust');
  });

  it('addItem works on optional arrays that start undefined', () => {
    const profile = makeProfile();
    const { result } = renderHook(() => useProfileEdit(), {
      wrapper: wrapper(profile),
    });

    act(() => {
      result.current.addItem('certifications', { rkey: 'c1', name: 'AWS' });
    });

    expect(result.current.profile.certifications).toHaveLength(1);
  });

  it('updateItem changes a specific item by rkey', () => {
    const profile = makeProfile({
      positions: [
        { rkey: 'p1', title: 'Dev', companyName: 'Acme', startDate: '2020-01', current: true },
        { rkey: 'p2', title: 'Lead', companyName: 'Beta', startDate: '2022-01', current: false },
      ],
    });
    const { result } = renderHook(() => useProfileEdit(), {
      wrapper: wrapper(profile),
    });

    act(() => {
      result.current.updateItem('positions', 'p1', { title: 'Senior Dev' });
    });

    expect(result.current.profile.positions[0]?.title).toBe('Senior Dev');
    expect(result.current.profile.positions[1]?.title).toBe('Lead');
  });

  it('removeItem filters out the item', () => {
    const profile = makeProfile({
      education: [
        { rkey: 'e1', institution: 'MIT' },
        { rkey: 'e2', institution: 'Stanford' },
      ],
    });
    const { result } = renderHook(() => useProfileEdit(), {
      wrapper: wrapper(profile),
    });

    act(() => {
      result.current.removeItem('education', 'e1');
    });

    expect(result.current.profile.education).toHaveLength(1);
    expect(result.current.profile.education[0]?.institution).toBe('Stanford');
  });

  it('throws when useProfileEdit is used outside provider', () => {
    expect(() => {
      renderHook(() => useProfileEdit());
    }).toThrow('useProfileEdit must be used within a ProfileEditProvider');
  });
});
