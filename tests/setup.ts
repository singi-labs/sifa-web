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
    findPeople: 'Find People',
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
    betaBanner: 'Sifa is pre-alpha, and this is basically our live dev server.',
    betaBannerSub:
      'Your profile data is safe in your AT Protocol account, but features and preferences may change before launch. Help build a better networking ecosystem.',
    betaBannerReportLink: 'Report any issues on GitHub',
    dismissBanner: 'Dismiss banner',
    editProfile: 'Edit profile',
    viewProfile: 'View profile',
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
    editAbout: 'Edit profile summary',
    readMore: 'Read more',
    readLess: 'Read less',
  },
  import: {
    title: 'Import from LinkedIn',
    subtitle:
      'Bring your professional history to Sifa. Your LinkedIn ZIP is extracted in your browser and never leaves your device.',
    uploadStep: 'Upload',
    previewStep: 'Review',
    confirmStep: 'Import',
  },
  'import.upload': {
    heading: 'Upload your LinkedIn data export',
    descriptionPrefix: 'Go to ',
    descriptionLinkText: 'LinkedIn\'s "Download my data" page',
    descriptionMiddle:
      ' and select "Download larger data archive" (the first option on that page). Upload the ZIP file you receive (batch 1 arrives in your e-mail inbox in ~10 minutes).',
    screenshotAlt:
      'LinkedIn\'s Download my data page showing the "Download larger data archive" option selected',
    screenshotCaption: 'What it looks like on LinkedIn',
    dropZone: 'Drag and drop your LinkedIn ZIP file here, or click to browse',
    dropZoneLabel: 'Drop zone for LinkedIn ZIP file',
    processing: 'Processing ZIP file...',
    fileTypeError:
      'Please select a ZIP file (.zip). LinkedIn exports are delivered as ZIP archives.',
    fileSizeError: 'File is too large (max 500 MB). Try re-downloading your LinkedIn export.',
    privacyNote:
      'Your LinkedIn ZIP is extracted in your browser and never leaves your device. The structured profile data is then written directly to your Personal Data Server through our API.',
    publicDataNotice:
      'Everything you import will be publicly visible to anyone, including people without a Sifa account. Unlike LinkedIn (where some data is hidden from logged-out visitors), Sifa profiles are fully public. Review your data before importing.',
  },
  'import.preview': {
    heading: 'Review imported data',
    duplicatesTitle: 'Some items already exist on your profile',
    duplicatesBody: '{count} items match your existing profile data and will be overwritten.',
    newItemsNote: '{count} items are new.',
    removeNote: "You can remove items you don't want to import.",
    existingTitle: 'Your profile already has data',
    existingBody:
      'Importing will replace all existing profile data with the data below. Your profile headline and summary will also be updated.',
    alreadyOnProfile: 'Already on profile',
    new: 'New',
    itemCount: '{count} items to import',
    confirmButton: 'Confirm & Import',
    back: 'Back',
    profile: 'Profile',
    noPositions: 'No positions found in export.',
    noEducation: 'No education found in export.',
    noSkills: 'No skills found in export.',
  },
  'import.confirm': {
    importing: 'Importing your data...',
    writingRecords: 'Writing {count} records to your Personal Data Server...',
    success: 'Import complete',
    partial: 'Import partially complete',
    error: 'Import failed',
    successMessage: 'Successfully imported to your profile:',
    warningPrefix: 'Import completed with warnings:',
    viewFailed: 'View failed items',
    retryFailed: 'Retry failed items',
    retry: 'Retry',
    viewProfile: 'View your profile',
    goToProfile: 'Go to profile',
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
    usedIn: 'Used in',
    verified: 'Verified',
    verifyHintGithub:
      'Add your Sifa profile URL in the "URL" field or under "Social accounts" in your GitHub profile settings. We\'ll verify the link automatically when you save.',
    verifyHintWebsite:
      "Add the following tag to your site's head section. We'll verify the link automatically when you save.",
    verifyHintFediverse:
      "Add your Sifa profile URL to one of your Fediverse profile metadata fields. We'll verify the link automatically when you save.",
    verifyHintRss:
      'Add a link with rel="me" pointing to your Sifa profile URL on your feed\'s HTML page. We\'ll verify the link automatically when you save.',
  },
  editor: {
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    close: 'Close',
    add: 'Add',
    failedToSave: 'Failed to save',
    added: '{section} added',
    updated: '{section} updated',
    removed: '{section} removed',
    failedToDelete: 'Failed to delete',
    copyUrl: 'Copy profile URL',
    copySnippet: 'Copy snippet',
    copied: 'Copied!',
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
  dataTransparency: {
    title: 'Your data on the AT Protocol',
    body: 'Your professional profile is stored in your Personal Data Server (PDS). This data is public and portable -- you can inspect exactly what is stored and take it to any compatible provider.',
    viewRawData: 'View your raw data',
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
    linkCopied: 'Link copied',
    embed: 'Embed',
    viewOnSifa: 'View on Sifa',
    followers: '{count} followers',
    followersOnBluesky: '{count} followers on Bluesky',
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
  activityCard: {
    fallback: 'Activity on {appName}',
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
    importBody: 'ZIP is extracted in your browser and never leaves your device.',
    cookiesTitle: 'Cookies and sessions',
    cookiesBody: 'Session cookies only.',
    contactTitle: 'Contact',
    contactBody: 'Contact us at privacy@sifa.id.',
  },
  embedBuilder: {
    pageTitle: 'Embed a Sifa Profile Card',
    pageDescription:
      'Add a live professional profile card to any website with a single line of code.',
    pageSubtitle: 'Add a live professional profile card to any website with a single line of code.',
    identifierLabel: 'Handle or DID',
    codeLabel: 'Embed code',
    themeNote:
      "The embed automatically adjusts between light and dark mode based on the visitor's browser setting.",
    previewLabel: 'Preview',
    previewTitle: 'Embed preview',
    copy: 'Copy',
    copied: 'Copied to clipboard',
    enterHandle: 'Enter a handle or DID to see a preview',
  },
  heatmap: {
    less: 'Less',
    more: 'More',
    noActivity: 'No activity',
    totalActions: '{count} total',
    actionsInPeriod: '{count} actions in {months} months',
    mostActive: 'Most active: {app}',
    appsActive: '{count} apps active',
    emptyState: 'Activity across the ATmosphere will appear here.',
    emptyStateOwner: 'Activity across the ATmosphere will appear here as you participate.',
    showFullYear: 'Show full year',
    showSixMonths: 'Show 6 months',
    filterDate: 'Showing {date}',
    clearFilter: 'Clear date',
  },
  endorsement: {
    endorseSkill: 'Endorse {skillName}',
    endorsementContext: "How do you know this person's expertise?",
    workedTogether: 'Worked together at...',
    collaboratedIn: 'Collaborated in...',
    supervisedBy: 'Supervised / was supervised by',
    coAuthored: 'Co-authored',
    otherContext: 'Other',
    endorseComment: "Share context about this person's expertise (optional)",
    endorseSubmit: 'Endorse',
    endorseCancel: 'Cancel',
    endorseAttribution: 'Your endorsement will be attributed to your profile',
    contextDetail: 'Details (optional)',
    endorsedBy: 'Endorsed by',
    relationshipWorkedTogether: 'Worked together at {detail}',
    relationshipCollaboratedIn: 'Collaborated in {detail}',
    relationshipSupervisedBy: 'Supervised / was supervised by',
    relationshipCoAuthored: 'Co-authored',
    relationshipOther: '{detail}',
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
