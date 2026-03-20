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
  it('renders name and handle', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.getByText('Alice Smith')).toBeDefined();
    expect(screen.getByText('@alice.bsky.social')).toBeDefined();
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

  it('renders location and website', () => {
    render(
      <IdentityCard
        {...baseProps}
        location={{ city: 'Amsterdam', country: 'NL' }}
        website="https://example.com"
      />,
    );
    expect(screen.getByText('Amsterdam, NL')).toBeDefined();
    expect(screen.getByText('example.com')).toBeDefined();
  });

  it('renders open to pills', () => {
    render(<IdentityCard {...baseProps} openTo={['Mentoring', 'Freelance']} />);
    expect(screen.getByText('Mentoring')).toBeDefined();
    expect(screen.getByText('Freelance')).toBeDefined();
  });

  it('renders preferredWorkplace pills', () => {
    render(
      <IdentityCard
        {...baseProps}
        preferredWorkplace={['id.sifa.defs#remote', 'id.sifa.defs#hybrid']}
      />,
    );
    // Translation mock returns the key; production renders the translated label
    expect(screen.getByText('remote')).toBeDefined();
    expect(screen.getByText('hybrid')).toBeDefined();
  });

  it('does not render preferredWorkplace section when empty', () => {
    render(<IdentityCard {...baseProps} preferredWorkplace={[]} />);
    expect(screen.queryByText('remote')).toBeNull();
    expect(screen.queryByText('hybrid')).toBeNull();
    expect(screen.queryByText('onSite')).toBeNull();
  });

  it('renders default trust stats with zeros for new users', () => {
    render(<IdentityCard {...baseProps} trustStats={[]} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    items.forEach((item) => {
      expect(item.textContent).toContain('0');
    });
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
});

describe('IdentityCard (embed variant)', () => {
  it('renders name and handle', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    expect(screen.getByText('Alice Smith')).toBeDefined();
    expect(screen.getByText('@alice.bsky.social')).toBeDefined();
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

  it('shows "View on Sifa" CTA link', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    const link = screen.getByText('View on Sifa');
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

  it('does not show trust stats in embed variant', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    expect(screen.queryByRole('list', { name: 'Trust stats' })).toBeNull();
  });

  it('shows follower count when provided', () => {
    render(<IdentityCard {...baseProps} variant="embed" followersCount={1234} />);
    expect(screen.getByText(/followers/)).toBeDefined();
  });

  it('does not show follower count when zero', () => {
    render(<IdentityCard {...baseProps} variant="embed" followersCount={0} />);
    expect(screen.queryByText(/follower/)).toBeNull();
  });

  it('shows "on Bluesky" when atprotoFollowersCount is used', () => {
    render(
      <IdentityCard
        {...baseProps}
        variant="embed"
        followersCount={5}
        atprotoFollowersCount={9999}
      />,
    );
    expect(screen.getByText(/followers on Bluesky/)).toBeDefined();
  });

  it('falls back to followersCount without Bluesky label when atprotoFollowersCount is zero', () => {
    render(
      <IdentityCard
        {...baseProps}
        variant="embed"
        followersCount={100}
        atprotoFollowersCount={0}
      />,
    );
    const el = screen.getByText(/followers/);
    expect(el).toBeDefined();
    expect(el.textContent).not.toContain('Bluesky');
  });

  it('shows PDS icon next to handle but no separate provider tagline', () => {
    render(<IdentityCard {...baseProps} variant="embed" />);
    // PDS icon is shown next to handle (via the link with provider profileUrl)
    expect(screen.getByRole('link', { name: /@alice\.bsky\.social/ })).toBeDefined();
    // No separate "on bluesky" tagline in activity indicators
    expect(screen.queryByText('pdsProvider')).toBeNull();
  });

  it('renders active app badges', () => {
    render(
      <IdentityCard
        {...baseProps}
        variant="embed"
        activeApps={[
          { id: 'smokesignal', name: 'Smoke Signal' },
          { id: 'whitewind', name: 'Whitewind' },
        ]}
      />,
    );
    expect(screen.getByText('Smoke Signal')).toBeDefined();
    expect(screen.getByText('Whitewind')).toBeDefined();
    // next-intl mock returns key for parameterized aria labels
    expect(screen.getByRole('list', { name: 'activeAppsLabel' })).toBeDefined();
  });

  it('does not render active apps section when empty', () => {
    render(<IdentityCard {...baseProps} variant="embed" activeApps={[]} />);
    expect(screen.queryByRole('list', { name: 'Active on' })).toBeNull();
  });
});
