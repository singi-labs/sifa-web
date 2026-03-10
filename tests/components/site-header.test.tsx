import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/components/auth-provider';
import { SiteHeader } from '@/components/site-header';

function renderHeader() {
  return render(
    <AuthProvider>
      <SiteHeader />
    </AuthProvider>,
  );
}

describe('SiteHeader', () => {
  it('renders the Sifa logo and name', () => {
    renderHeader();

    expect(screen.getByText('Sifa')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Sifa home' })).toBeDefined();
  });

  it('renders desktop navigation links', () => {
    renderHeader();

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Search' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Import' })).toBeDefined();
  });

  it('renders sign in when not authenticated', async () => {
    renderHeader();

    await waitFor(() => {
      expect(screen.getByText('Sign in')).toBeDefined();
    });
  });

  it('renders mobile menu button', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeDefined();
  });

  it('renders theme toggle', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeDefined();
  });
});
