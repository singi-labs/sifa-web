import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/(main)/page';

describe('Home', () => {
  it('renders heading and subtitle', async () => {
    const Page = await Home();
    render(Page);
    expect(screen.getByText('Sifa ID')).toBeDefined();
    expect(screen.getByText(/Professional identity on the AT Protocol/)).toBeDefined();
  });

  it('renders CTA links', async () => {
    const Page = await Home();
    render(Page);
    expect(screen.getByRole('link', { name: 'Search profiles' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Import from LinkedIn' })).toBeDefined();
  });
});
