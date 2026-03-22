import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ConnectionPerson } from '../connection-summary';
import { ConnectionSummary } from '../connection-summary';

function makePerson(overrides: Partial<ConnectionPerson> = {}): ConnectionPerson {
  return {
    did: `did:plc:test${Math.random().toString(36).slice(2, 8)}`,
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    ...overrides,
  };
}

describe('ConnectionSummary', () => {
  it('shows login prompt with link when not logged in', () => {
    render(<ConnectionSummary isLoggedIn={false} isLoading={false} connections={[]} />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/login');
    expect(link.textContent).toContain('Sign in');
  });

  it('uses custom loginUrl when provided', () => {
    render(
      <ConnectionSummary
        isLoggedIn={false}
        isLoading={false}
        connections={[]}
        loginUrl="/custom-login"
      />,
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/custom-login');
  });

  it('shows loading state with spinner text', () => {
    render(<ConnectionSummary isLoggedIn={true} isLoading={true} connections={[]} />);

    expect(screen.getByText('Checking your connections...')).toBeDefined();
  });

  it('shows discovery message when logged in with zero connections', () => {
    render(<ConnectionSummary isLoggedIn={true} isLoading={false} connections={[]} />);

    expect(screen.getByText(/None of your Bluesky connections have RSVP'd yet/)).toBeDefined();
  });

  it('shows connection count and avatars when connections exist', () => {
    const connections = [makePerson({ displayName: 'Alice' }), makePerson({ displayName: 'Bob' })];

    render(<ConnectionSummary isLoggedIn={true} isLoading={false} connections={connections} />);

    expect(screen.getByText(/2 people you know/)).toBeDefined();
    expect(screen.getByText(/are attending/)).toBeDefined();

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('caps avatar display at 4 and shows +N for remaining', () => {
    const connections = Array.from({ length: 7 }, (_, i) =>
      makePerson({ displayName: `Person ${i + 1}`, did: `did:plc:test${i}` }),
    );

    render(<ConnectionSummary isLoggedIn={true} isLoading={false} connections={connections} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);

    expect(screen.getByText('+3')).toBeDefined();
    expect(screen.getByText(/7 people you know/)).toBeDefined();
  });

  it('each avatar has alt text', () => {
    const connections = [
      makePerson({ displayName: 'Alice' }),
      makePerson({ displayName: undefined }),
    ];

    render(<ConnectionSummary isLoggedIn={true} isLoading={false} connections={connections} />);

    const images = screen.getAllByRole('img');
    expect(images[0]!.getAttribute('alt')).toBe('Alice');
    expect(images[1]!.getAttribute('alt')).toBe('Connection');
  });
});
