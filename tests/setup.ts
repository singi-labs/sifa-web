import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock next-intl for client components
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const translations: Record<string, Record<string, string>> = {
      common: {
        follow: 'Follow',
        unfollow: 'Unfollow',
        signIn: 'Sign in',
        signOut: 'Sign out',
      },
      profile: {
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        about: 'About',
      },
      import: {
        title: 'Import from LinkedIn',
        uploadStep: 'Upload your LinkedIn data export',
        previewStep: 'Review imported data',
        confirmStep: 'Confirm and save',
      },
      search: {
        placeholder: 'Search people by name, skills, or headline',
        noResults: 'No results found for "{query}"',
      },
    };
    return (key: string, params?: Record<string, string>) => {
      const ns = namespace ? translations[namespace] : undefined;
      let value = ns?.[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, v);
        }
      }
      return value;
    };
  },
}));

// Mock next-intl/server for server components
vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace?: string) => {
    const translations: Record<string, Record<string, string>> = {
      profile: {
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        about: 'About',
      },
      search: {
        placeholder: 'Search people by name, skills, or headline',
        noResults: 'No results found for "{query}"',
      },
    };
    return (key: string, params?: Record<string, string>) => {
      const ns = namespace ? translations[namespace] : undefined;
      let value = ns?.[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, v);
        }
      }
      return value;
    };
  },
}));

afterEach(() => {
  cleanup();
});
