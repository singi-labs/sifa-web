import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IdentityCard } from '@/components/identity-card';

// Mock clipboard API
Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock follow-button
vi.mock('@/components/follow-button', () => ({
  FollowButton: () => <button data-testid="follow-button">Follow</button>,
}));

// Mock auth-provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ session: null, isLoading: false, refresh: vi.fn() }),
}));

// Mock @base-ui/react/popover
vi.mock('@base-ui/react/popover', () => {
  const Trigger = ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button data-testid="popover-trigger" {...props}>
      {children}
    </button>
  );
  const Portal = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-portal">{children}</div>
  );
  const Positioner = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Popup = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-popup">{children}</div>
  );
  const Arrow = () => <div />;
  const Root = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-root">{children}</div>
  );
  return {
    Popover: { Root, Trigger, Portal, Positioner, Popup, Arrow },
  };
});

// Mock profile-edit-provider with mutable state so tests can override
let mockIsActualOwner = false;
vi.mock('@/components/profile-edit-provider', () => ({
  useProfileEdit: () => ({
    profile: { isOwnProfile: mockIsActualOwner },
    isActualOwner: mockIsActualOwner,
    previewMode: false,
    togglePreview: vi.fn(),
    updateProfile: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));

afterEach(() => {
  mockIsActualOwner = false;
});

// Mock phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  ShareNetwork: (props: Record<string, unknown>) => <span data-testid="icon-share" {...props} />,
  PencilSimple: (props: Record<string, unknown>) => <span data-testid="icon-pencil" {...props} />,
  CheckCircle: (props: Record<string, unknown>) => <span data-testid="icon-check" {...props} />,
  Check: (props: Record<string, unknown>) => <span data-testid="icon-check-inline" {...props} />,
  Code: (props: Record<string, unknown>) => <span data-testid="icon-code" {...props} />,
  Eye: (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  X: (props: Record<string, unknown>) => <span data-testid="icon-x" {...props} />,
  Info: (props: Record<string, unknown>) => <span data-testid="icon-info" {...props} />,
  MapPin: (props: Record<string, unknown>) => <span data-testid="icon-map-pin" {...props} />,
  LinkSimple: (props: Record<string, unknown>) => (
    <span data-testid="icon-link-simple" {...props} />
  ),
  Briefcase: (props: Record<string, unknown>) => <span data-testid="icon-briefcase" {...props} />,
  Buildings: (props: Record<string, unknown>) => <span data-testid="icon-buildings" {...props} />,
  ArrowsLeftRight: (props: Record<string, unknown>) => (
    <span data-testid="icon-arrows" {...props} />
  ),
  UserCheck: (props: Record<string, unknown>) => <span data-testid="icon-user-check" {...props} />,
  UserPlus: (props: Record<string, unknown>) => <span data-testid="icon-user-plus" {...props} />,
  ChatCircle: (props: Record<string, unknown>) => (
    <span data-testid="icon-chat-circle" {...props} />
  ),
  GitBranch: (props: Record<string, unknown>) => <span data-testid="icon-git-branch" {...props} />,
  CalendarBlank: (props: Record<string, unknown>) => (
    <span data-testid="icon-calendar" {...props} />
  ),
  Camera: (props: Record<string, unknown>) => <span data-testid="icon-camera" {...props} />,
  Article: (props: Record<string, unknown>) => <span data-testid="icon-article" {...props} />,
  Newspaper: (props: Record<string, unknown>) => <span data-testid="icon-newspaper" {...props} />,
  ChatsCircle: (props: Record<string, unknown>) => (
    <span data-testid="icon-chats-circle" {...props} />
  ),
  Clipboard: (props: Record<string, unknown>) => <span data-testid="icon-clipboard" {...props} />,
  BookmarkSimple: (props: Record<string, unknown>) => (
    <span data-testid="icon-bookmark" {...props} />
  ),
  FileText: (props: Record<string, unknown>) => <span data-testid="icon-file-text" {...props} />,
  Globe: (props: Record<string, unknown>) => <span data-testid="icon-globe" {...props} />,
  UsersThree: (props: Record<string, unknown>) => (
    <span data-testid="icon-users-three" {...props} />
  ),
  Key: (props: Record<string, unknown>) => <span data-testid="icon-key" {...props} />,
  Star: (props: Record<string, unknown>) => <span data-testid="icon-star" {...props} />,
  CircleDashed: (props: Record<string, unknown>) => (
    <span data-testid="icon-circle-dashed" {...props} />
  ),
}));

// Mock sonner
vi.mock('sonner', () => {
  const fn = vi.fn() as ReturnType<typeof vi.fn> & { success: ReturnType<typeof vi.fn> };
  fn.success = vi.fn();
  return { toast: fn };
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Mock profile-edit-dialog
vi.mock('@/components/profile-edit-dialog', () => ({
  ProfileEditDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="profile-edit-dialog">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const baseProps = {
  did: 'did:plc:abc123',
  handle: 'alice.bsky.social',
  displayName: 'Alice Smith',
  headline: 'Senior Engineer',
  claimed: true,
  trustStats: [
    { key: 'connections', label: 'Connections', value: 10 },
    { key: 'endorsements', label: 'Endorsements', value: 5 },
    { key: 'reactions', label: 'Reactions', value: 20 },
  ],
};

describe('IdentityCard (default / page variant)', () => {
  it('renders name and handle as link to Bluesky', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.getByText('Alice Smith')).toBeDefined();
    const handleLink = screen.getByText('@alice.bsky.social');
    expect(handleLink).toBeDefined();
    expect(handleLink.tagName).toBe('A');
    expect(handleLink.getAttribute('href')).toBe('https://bsky.app/profile/alice.bsky.social');
    expect(handleLink.getAttribute('target')).toBe('_blank');
  });

  it('shows follow button for non-own profiles', () => {
    render(<IdentityCard {...baseProps} isOwnProfile={false} />);
    expect(screen.getByTestId('follow-button')).toBeDefined();
  });

  it('shows share button', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Share profile' })).toBeDefined();
  });

  it('does NOT show "View on Sifa" link', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.queryByText('View on Sifa')).toBeNull();
  });

  it('falls back to handle when no display name', () => {
    const { displayName: _displayName, ...propsWithoutName } = baseProps;
    render(<IdentityCard {...propsWithoutName} />);
    // The h1 should show the handle as fallback
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('alice');
  });

  it('renders headline', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.getByText('Senior Engineer')).toBeDefined();
  });

  it('renders pronouns when provided', () => {
    render(<IdentityCard {...baseProps} pronouns="she/her" />);
    expect(screen.getByText('(she/her)')).toBeDefined();
  });

  it('does not render pronouns when not provided', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.queryByText(/^\(.*\)$/)).toBeNull();
  });

  it('renders location with icon in separate row', () => {
    render(
      <IdentityCard
        {...baseProps}
        location={{ city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' }}
      />,
    );
    expect(screen.getByText(/Amsterdam, Netherlands/)).toBeDefined();
    // Country flag should be present
    const flag = screen.getByRole('img', { name: 'NL' });
    expect(flag).toBeDefined();
    // MapPin icon should be present
    expect(screen.getByTestId('icon-map-pin')).toBeDefined();
  });

  it('renders website as separate icon-led row', () => {
    render(
      <IdentityCard
        {...baseProps}
        location={{ city: 'Amsterdam', country: 'Netherlands' }}
        website="https://singi.dev"
      />,
    );
    const locationText = screen.getByText('Amsterdam, Netherlands');
    const websiteLink = screen.getByText('singi.dev');
    // They should be in Zone B but NOT share the same direct parent
    expect(locationText.closest('[data-testid="zone-b"]')).toBeDefined();
    expect(websiteLink.closest('[data-testid="zone-b"]')).toBeDefined();
    expect(locationText.parentElement).not.toBe(websiteLink.parentElement);
    // LinkSimple icon should be present
    expect(screen.getByTestId('icon-link-simple')).toBeDefined();
  });

  it('does not render follower count on card (demoted to profile body)', () => {
    render(
      <IdentityCard
        {...baseProps}
        followersCount={1234}
        atprotoFollowersCount={5678}
        location={{ city: 'Amsterdam', country: 'Netherlands' }}
        website="https://singi.dev"
      />,
    );
    expect(screen.queryByText(/followers/)).toBeNull();
  });

  it('renders featured skills pills when provided', () => {
    render(
      <IdentityCard
        {...baseProps}
        featuredSkills={[
          { rkey: 's1', skillName: 'TypeScript' },
          { rkey: 's2', skillName: 'AT Protocol' },
          { rkey: 's3', skillName: 'React' },
        ]}
      />,
    );
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('AT Protocol')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    // Skills should be in an accessible list
    expect(screen.getByRole('list', { name: 'featuredSkillsLabel' })).toBeDefined();
  });

  it('does not render skills section when featuredSkills is empty', () => {
    render(<IdentityCard {...baseProps} featuredSkills={[]} />);
    expect(screen.queryByRole('list', { name: 'featuredSkillsLabel' })).toBeNull();
  });

  it('renders open to pills with briefcase icon', () => {
    render(<IdentityCard {...baseProps} openTo={['Mentoring', 'Freelance']} />);
    expect(screen.getByText('Mentoring')).toBeDefined();
    expect(screen.getByText('Freelance')).toBeDefined();
    expect(screen.getByTestId('icon-briefcase')).toBeDefined();
  });

  it('renders preferredWorkplace pills with buildings icon', () => {
    render(
      <IdentityCard
        {...baseProps}
        preferredWorkplace={['id.sifa.defs#remote', 'id.sifa.defs#hybrid']}
      />,
    );
    // Translation mock returns the key; production renders the translated label
    expect(screen.getByText('remote')).toBeDefined();
    expect(screen.getByText('hybrid')).toBeDefined();
    expect(screen.getByTestId('icon-buildings')).toBeDefined();
  });

  it('does not render preferredWorkplace section when empty', () => {
    render(<IdentityCard {...baseProps} preferredWorkplace={[]} />);
    expect(screen.queryByText('remote')).toBeNull();
    expect(screen.queryByText('hybrid')).toBeNull();
    expect(screen.queryByText('onSite')).toBeNull();
  });

  it('does not render trust stats (hidden until meaningful)', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.queryByRole('list', { name: 'Trust stats' })).toBeNull();
  });

  it('renders verified badge when verified accounts exist', () => {
    render(
      <IdentityCard
        {...baseProps}
        verifiedAccounts={[
          { platform: 'github', identifier: 'alice', url: 'https://github.com/alice' },
        ]}
      />,
    );
    expect(screen.getByLabelText('Verified')).toBeDefined();
  });

  it('does not render verified badge when no verified accounts', () => {
    render(<IdentityCard {...baseProps} verifiedAccounts={[]} />);
    expect(screen.queryByLabelText('Verified')).toBeNull();
  });

  it('renders Edit button for own profile', () => {
    mockIsActualOwner = true;
    render(<IdentityCard {...baseProps} isOwnProfile={true} />);
    const editButton = screen.getByRole('button', { name: /Edit profile/ });
    expect(editButton).toBeDefined();
  });

  it('shows avatar letter placeholder when no avatar', () => {
    render(<IdentityCard {...baseProps} avatar={undefined} />);
    // Should show first letter of display name
    expect(screen.getByText('A')).toBeDefined();
  });

  it('renders handle without PDS icon (demoted to profile body)', () => {
    render(
      <IdentityCard {...baseProps} pdsProviderInfo={{ name: 'bluesky', host: 'bsky.social' }} />,
    );
    // Handle text should still render
    expect(screen.getByText('@alice.bsky.social')).toBeDefined();
    // PDS icon should not be rendered (no title attribute for PDS provider)
    expect(screen.queryByTitle('Bluesky')).toBeNull();
  });

  it('does not render active apps badges on card', () => {
    render(
      <IdentityCard
        {...baseProps}
        activeApps={[
          {
            id: 'bluesky',
            name: 'Bluesky',
            category: 'Posts',
            recentCount: 10,
            latestRecordAt: null,
          },
        ]}
      />,
    );
    expect(screen.queryByRole('list', { name: 'activeAppsLabel' })).toBeNull();
    expect(screen.queryByText('Bluesky')).toBeNull();
  });
});

describe('IdentityCard (embed variant)', () => {
  it('renders name and handle as link to Bluesky', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    expect(screen.getByText('Alice Smith')).toBeDefined();
    const handleLink = screen.getByText('@alice.bsky.social');
    expect(handleLink.tagName).toBe('A');
    expect(handleLink.getAttribute('href')).toBe('https://bsky.app/profile/alice.bsky.social');
  });

  it('hides follow button', () => {
    render(<IdentityCard {...baseProps} variant="embed" isOwnProfile={false} />);
    expect(screen.queryByTestId('follow-button')).toBeNull();
  });

  it('hides share button', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    expect(screen.queryByRole('button', { name: 'Share profile' })).toBeNull();
  });

  it('hides edit link for own profile', () => {
    render(<IdentityCard {...baseProps} variant="embed" isOwnProfile={true} />);
    expect(screen.queryByText('Edit profile')).toBeNull();
  });

  it('shows "View on Sifa ID" CTA link', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    const link = screen.getByText('View on Sifa ID');
    expect(link).toBeDefined();
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://sifa.id/p/alice.bsky.social');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('hides "View on Sifa" when hideFooter is set', () => {
    render(<IdentityCard {...baseProps} variant="embed" hideFooter />);
    expect(screen.queryByText('View on Sifa')).toBeNull();
  });

  it('hides unclaimed popover for unclaimed profiles', () => {
    render(<IdentityCard {...baseProps} variant="embed" claimed={false} />);
    expect(screen.queryByTestId('popover-root')).toBeNull();
  });

  it('still shows headline', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    expect(screen.getByText('Senior Engineer')).toBeDefined();
  });

  it('renders pronouns in embed variant', () => {
    render(<IdentityCard {...baseProps} variant="embed" pronouns="they/them" />);
    expect(screen.getByText('(they/them)')).toBeDefined();
  });

  it('renders role at company in embed', () => {
    render(<IdentityCard {...baseProps} variant="embed" currentRole="CTO" currentCompany="Acme" />);
    expect(screen.getByText(/CTO/)).toBeDefined();
    expect(screen.getByText(/Acme/)).toBeDefined();
  });

  it('renders location with icon in embed', () => {
    render(
      <IdentityCard
        {...baseProps}
        variant="embed"
        location={{ city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' }}
      />,
    );
    expect(screen.getByText(/Amsterdam, Netherlands/)).toBeDefined();
    expect(screen.getByTestId('icon-map-pin')).toBeDefined();
  });

  it('renders website with icon in embed', () => {
    render(<IdentityCard {...baseProps} variant="embed" website="https://singi.dev" />);
    expect(screen.getByText('singi.dev')).toBeDefined();
    expect(screen.getByTestId('icon-link-simple')).toBeDefined();
  });

  it('shows condensed "Available for work" badge when openTo is set', () => {
    render(<IdentityCard {...baseProps} variant="embed" openTo={['id.sifa.defs#fullTimeRoles']} />);
    // next-intl mock returns the key itself
    expect(screen.getByText('availableForWork')).toBeDefined();
  });

  it('does not show individual openTo pills in embed', () => {
    render(
      <IdentityCard
        {...baseProps}
        variant="embed"
        openTo={['id.sifa.defs#fullTimeRoles', 'id.sifa.defs#contractRoles']}
      />,
    );
    // Should show condensed badge, not individual pills
    expect(screen.getByText('availableForWork')).toBeDefined();
    expect(screen.queryByText('fullTimeRoles')).toBeNull();
    expect(screen.queryByText('contractRoles')).toBeNull();
  });

  it('does not show preferred workplace in embed', () => {
    render(
      <IdentityCard {...baseProps} variant="embed" preferredWorkplace={['id.sifa.defs#remote']} />,
    );
    expect(screen.queryByText('remote')).toBeNull();
    expect(screen.queryByTestId('icon-buildings')).toBeNull();
  });

  it('does not show follower count in embed', () => {
    render(<IdentityCard {...baseProps} variant="embed" followersCount={1234} />);
    expect(screen.queryByText(/followers/)).toBeNull();
  });

  it('shows active apps badges in embed', () => {
    render(
      <IdentityCard
        {...baseProps}
        variant="embed"
        activeApps={[
          {
            id: 'bluesky',
            name: 'Bluesky',
            category: 'Posts',
            recentCount: 10,
            latestRecordAt: null,
          },
        ]}
      />,
    );
    expect(screen.getByText('Bluesky')).toBeDefined();
  });

  it('does not show skills pills in embed', () => {
    render(
      <IdentityCard
        {...baseProps}
        variant="embed"
        featuredSkills={[{ rkey: 's1', skillName: 'TypeScript' }]}
      />,
    );
    expect(screen.queryByText('TypeScript')).toBeNull();
  });
});
