import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHeader } from '@/components/site-header';

describe('SiteHeader', () => {
  it('renders the Sifa logo and name', () => {
    render(<SiteHeader />);

    expect(screen.getByText('Sifa')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Sifa home' })).toBeDefined();
  });

  it('renders desktop navigation links', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Search' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Import' })).toBeDefined();
  });

  it('renders sign in button', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeDefined();
  });

  it('renders mobile menu button', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeDefined();
  });

  it('renders theme toggle', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeDefined();
  });
});
