import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from '@/components/site-footer';

describe('SiteFooter', () => {
  it('renders Singi Labs attribution', () => {
    render(<SiteFooter />);

    expect(screen.getByText('Singi Labs')).toBeDefined();
    expect(screen.getByText('Built by')).toBeDefined();
  });

  it('renders AT Protocol text', () => {
    render(<SiteFooter />);

    expect(screen.getByText('Powered by the AT Protocol')).toBeDefined();
  });

  it('renders footer navigation links', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'About' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Bluesky' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Tangled' })).toBeDefined();
  });

  it('links to singi.dev', () => {
    render(<SiteFooter />);

    const singiLink = screen.getByRole('link', { name: 'Singi Labs' });
    expect(singiLink.getAttribute('href')).toBe('https://singi.dev');
    expect(singiLink.getAttribute('target')).toBe('_blank');
    expect(singiLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('links to GitHub externally', () => {
    render(<SiteFooter />);

    const ghLink = screen.getByRole('link', { name: 'GitHub' });
    expect(ghLink.getAttribute('href')).toBe('https://github.com/singi-labs');
    expect(ghLink.getAttribute('target')).toBe('_blank');
  });

  it('links to Bluesky externally', () => {
    render(<SiteFooter />);

    const bskyLink = screen.getByRole('link', { name: 'Bluesky' });
    expect(bskyLink.getAttribute('href')).toBe('https://bsky.app/profile/sifa.id');
    expect(bskyLink.getAttribute('target')).toBe('_blank');
  });

  it('links to Tangled externally', () => {
    render(<SiteFooter />);

    const tangledLink = screen.getByRole('link', { name: 'Tangled' });
    expect(tangledLink.getAttribute('href')).toBe(
      'https://tangled.org/did:plc:45uheisi25szrjvjurfpritx?tab=repos',
    );
    expect(tangledLink.getAttribute('target')).toBe('_blank');
  });
});
