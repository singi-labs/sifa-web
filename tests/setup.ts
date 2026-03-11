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
      'Sifa is in the pre-alpha "move fast and break things" stage, and this is basically our live development server. Your profile data is safely stored in your AT Protocol account, but other things might change a lot and some app preferences may reset before we launch.',
    betaBannerReport:
      'Help build a better networking ecosystem — report issues on GitHub.',
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
    addAbout: 'Add a professional summary',
    readMore: 'Read more',
    readLess: 'Read less',
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
  sections: {
    career: 'Career',
    education: 'Education',
    educationEntry: 'Education',
    courses: 'Courses',
    skills: 'Skills',
    projects: 'Projects',
    credentials: 'Credentials',
    publications: 'Publications',
    volunteering: 'Volunteering',
    awards: 'Awards',
    languages: 'Languages',
    otherProfiles: 'Other Profiles',
    verified: 'Verified',
    unverified: 'Unverified',
  },
  trackRecord: {
    title: 'Track Record',
    endorsementsTitle: 'Endorsements',
    endorsementsDesc: 'Skills endorsed by other professionals.',
    verifiedTitle: 'Verified Accounts',
    verifiedDesc: 'Verified platform accounts.',
    reactionsTitle: 'Reactions Received',
    reactionsDesc: 'Reactions on your posts.',
    communityTitle: 'Community Presence',
    communityDesc: 'Activity in communities.',
    mutualTitle: 'Mutual Connections',
    mutualDesc: 'Connections you share.',
    sharedTitle: 'Shared History',
    sharedDesc: 'Common employers or education.',
  },
  activityOverview: {
    title: 'Activity',
    viewAll: 'View full activity',
    comingSoon: 'Activity overview coming soon.',
  },
  identityCard: {
    label: 'Professional identity',
    avatarAlt: "{name}'s profile photo",
    verified: 'Verified',
    statConnections: 'Connections',
    statEndorsements: 'Endorsements',
    statReactions: 'Reactions',
    trustStatsLabel: 'Trust stats',
    editProfile: 'Edit profile',
    shareProfile: 'Share profile',
    share: 'Share',
  },
  home: {
    title: 'Sifa',
    subtitle: 'Professional identity on the AT Protocol. Own your career narrative.',
    comingSoon: 'Timeline and feed are coming soon.',
    searchProfiles: 'Search profiles',
    importLinkedIn: 'Import from LinkedIn',
  },
  activity: {
    title: 'Activity for {handle}',
    comingSoon: 'Activity stream is coming soon.',
  },
  about: {
    title: 'About Sifa',
    mission: 'Sifa is a decentralized professional identity network built on the AT Protocol.',
    atproto: 'Built on the AT Protocol.',
    openSource: 'Professional profile lexicons and import tools are open source.',
    builtBy: 'Built by',
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: March 2026',
    dataStorageTitle: 'Your data, your PDS',
    dataStorageBody: 'Your professional profile data is stored in your PDS.',
    importTitle: 'LinkedIn import',
    importBody: 'ZIP is processed in your browser.',
    cookiesTitle: 'Cookies and sessions',
    cookiesBody: 'Session cookies only.',
    contactTitle: 'Contact',
    contactBody: 'Contact us at privacy@sifa.id.',
  },
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: March 2026',
    serviceTitle: 'The service',
    serviceBody: 'Sifa provides a web interface for professional profiles.',
    accountsTitle: 'Accounts',
    accountsBody: 'You sign in with your AT Protocol account.',
    contentTitle: 'Content',
    contentBody: 'You are responsible for your profile information.',
    disclaimerTitle: 'Disclaimer',
    disclaimerBody: 'Sifa is provided as-is during beta.',
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

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue(null),
  getLoginUrl: () => '/api/auth/login',
  getLogoutUrl: () => '/api/auth/logout',
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
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
