import { describe, it, expect, vi } from 'vitest';
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

// Mock profile-edit-provider
vi.mock('@/components/profile-edit-provider', () => ({
  useProfileEdit: () => ({
    profile: { isOwnProfile: false },
    isActualOwner: false,
    previewMode: false,
    togglePreview: vi.fn(),
    updateProfile: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));

// Mock phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  ShareNetwork: (props: Record<string, unknown>) => <span data-testid="icon-share" {...props} />,
  PencilSimple: (props: Record<string, unknown>) => <span data-testid="icon-pencil" {...props} />,
  CheckCircle: (props: Record<string, unknown>) => <span data-testid="icon-check" {...props} />,
  Check: (props: Record<string, unknown>) => <span data-testid="icon-check-inline" {...props} />,
  Code: (props: Record<string, unknown>) => <span data-testid="icon-code" {...props} />,
  Eye: (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  MapPin: (props: Record<string, unknown>) => <span data-testid="icon-map-pin" {...props} />,
  LinkSimple: (props: Record<string, unknown>) => (
    <span data-testid="icon-link-simple" {...props} />
  ),
  Briefcase: (props: Record<string, unknown>) => <span data-testid="icon-briefcase" {...props} />,
  Buildings: (props: Record<string, unknown>) => <span data-testid="icon-buildings" {...props} />,
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
  claimed: true,
  variant: 'embed' as const,
  hideFooter: true,
};

describe('Event card enrichment — embed variant fields', () => {
  it('renders headline when provided', () => {
    render(<IdentityCard {...baseProps} headline="Principal Engineer at Acme" />);
    expect(screen.getByText('Principal Engineer at Acme')).toBeDefined();
  });

  it('renders bio (truncated to ~120 chars) when no headline is provided', () => {
    const longBio =
      'Experienced software engineer with a passion for distributed systems and open protocols. ' +
      'Building decentralized infrastructure for the next generation of social software.';
    render(<IdentityCard {...baseProps} about={longBio} />);

    // Should show truncated text with ellipsis, not the full bio
    const bioElement = screen.getByText(/Experienced software engineer/);
    expect(bioElement).toBeDefined();
    expect(bioElement.textContent).toContain('\u2026');
    expect(bioElement.textContent!.length).toBeLessThanOrEqual(124); // 120 chars + ellipsis + margin
  });

  it('renders full bio when shorter than 120 chars and no headline', () => {
    const shortBio = 'Open source developer and AT Protocol enthusiast.';
    render(<IdentityCard {...baseProps} about={shortBio} />);
    expect(screen.getByText(shortBio)).toBeDefined();
  });

  it('renders headline instead of bio when both are provided (headline takes priority)', () => {
    render(
      <IdentityCard
        {...baseProps}
        headline="Staff Engineer"
        about="A long bio that should not appear when headline is present."
      />,
    );
    expect(screen.getByText('Staff Engineer')).toBeDefined();
    expect(screen.queryByText(/A long bio that should not appear/)).toBeNull();
  });

  it('renders website as a link with truncated domain and LinkSimple icon', () => {
    render(<IdentityCard {...baseProps} website="https://www.example.com/about" />);

    const link = screen.getByText('example.com/about');
    expect(link).toBeDefined();
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://www.example.com/about');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.getByTestId('icon-link-simple')).toBeDefined();
  });

  it('strips protocol and www from website display text', () => {
    render(<IdentityCard {...baseProps} website="https://www.singi.dev/" />);
    expect(screen.getByText('singi.dev')).toBeDefined();
  });

  it('does not render website when not provided', () => {
    render(<IdentityCard {...baseProps} />);
    expect(screen.queryByTestId('icon-link-simple')).toBeNull();
  });

  it('does not render headline/bio section when neither is provided', () => {
    const { container } = render(<IdentityCard {...baseProps} />);
    // The headline/bio paragraph should not exist
    const paragraphs = container.querySelectorAll('p.mt-3');
    expect(paragraphs.length).toBe(0);
  });
});
