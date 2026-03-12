import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/(main)/about/page';
import PrivacyPage from '@/app/(main)/privacy/page';
import TermsPage from '@/app/(main)/terms/page';

describe('About page', () => {
  it('renders title', async () => {
    const Page = await AboutPage();
    render(Page);
    expect(screen.getByText('About Sifa')).toBeDefined();
  });

  it('links to Singi Labs', async () => {
    const Page = await AboutPage();
    render(Page);
    const link = screen.getByRole('link', { name: 'Singi Labs' });
    expect(link.getAttribute('href')).toBe('https://singi.dev');
  });
});

describe('Privacy page', () => {
  it('renders title and sections', async () => {
    const Page = await PrivacyPage();
    render(Page);
    expect(screen.getByText('Privacy Policy')).toBeDefined();
    expect(screen.getByText('Your data, your PDS')).toBeDefined();
    expect(screen.getByText('LinkedIn import')).toBeDefined();
    expect(screen.getByText('Cookies and sessions')).toBeDefined();
  });
});

describe('Terms page', () => {
  it('renders title and sections', async () => {
    const Page = await TermsPage();
    render(Page);
    expect(screen.getByText('Terms of Service')).toBeDefined();
    expect(screen.getByText('The service')).toBeDefined();
    expect(screen.getByText('Accounts')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByText('Disclaimer')).toBeDefined();
  });
});
