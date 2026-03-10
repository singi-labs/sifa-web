import 'vitest-axe/extend-expect';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const translations: Record<string, Record<string, string>> = {
  common: {
    follow: 'Follow',
    unfollow: 'Unfollow',
    signIn: 'Sign in',
    signOut: 'Sign out',
    home: 'Sifa home',
    search: 'Search',
    import: 'Import',
    mainNav: 'Main navigation',
    footerNav: 'Footer navigation',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    builtBy: 'Built by',
    poweredByAtproto: 'Powered by the AT Protocol',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    skipToContent: 'Skip to main content',
    betaBanner:
      'Sifa is in beta. Your profile data is safely stored in your AT Protocol account. Some app preferences may reset before launch.',
    dismissBanner: 'Dismiss banner',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    errorTitle: 'Something went wrong',
    errorDescription: 'An unexpected error occurred. Please try again.',
    tryAgain: 'Try again',
  },
  profile: {
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    about: 'About',
    editProfile: 'Edit profile',
    noProfile: "This profile doesn't exist yet.",
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

function createTranslator(namespace?: string) {
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
}

// Mock next-intl for client components
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => createTranslator(namespace),
}));

// Mock next-intl/server for server components
vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace?: string) => createTranslator(namespace),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

afterEach(() => {
  cleanup();
});
