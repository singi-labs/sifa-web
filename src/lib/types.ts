export interface LocationValue {
  city?: string;
  region?: string;
  country: string;
  countryCode?: string;
  postalCode?: string;
  geonameId?: number;
}

export interface SkillRef {
  uri: string;
  cid: string;
}

export interface ProfilePosition {
  rkey: string;
  companyName: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: LocationValue | null;
  current: boolean;
  skills?: SkillRef[];
  linkedSkills?: ProfileSkill[];
}

export interface ProfileEducation {
  rkey: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProfileSkill {
  rkey: string;
  skillName: string;
  category?: string;
  endorsementCount?: number;
}

export interface SkillSuggestion {
  canonicalName: string;
  slug: string;
  category: string;
}

export interface ProfileCertification {
  rkey: string;
  name: string;
  issuingOrg: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface ProfileProject {
  rkey: string;
  name: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProfilePublication {
  rkey: string;
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  description?: string;
}

export interface ProfileVolunteering {
  rkey: string;
  organization: string;
  role?: string;
  cause?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ProfileHonor {
  rkey: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface ProfileLanguage {
  rkey: string;
  language: string;
  proficiency?:
    | 'elementary'
    | 'limited_working'
    | 'professional_working'
    | 'full_professional'
    | 'native';
}

export interface ProfileCourse {
  rkey: string;
  name: string;
  institution?: string;
  number?: string;
}

export interface TrustStat {
  key: string;
  label: string;
  value: number;
}

export interface VerifiedAccount {
  platform: string;
  identifier: string;
  url?: string;
}

export interface ExternalAccount {
  rkey: string;
  platform: string;
  url: string;
  label?: string;
  feedUrl?: string;
  primary?: boolean;
  verifiable: boolean;
  verified: boolean;
  verifiedVia?: string | null;
}

export interface FeedItem {
  title: string;
  excerpt: string;
  url: string;
  timestamp: string;
  source: string;
}

export interface Profile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  headline?: string;
  about?: string;
  // Override system
  hasHeadlineOverride?: boolean;
  hasAboutOverride?: boolean;
  source?: {
    headline?: string;
    about?: string;
  };
  location?: LocationValue | null;
  website?: string;
  openTo?: string[];
  claimed: boolean;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  createdAt?: string;

  // Trust stats (externally validated, top 3 dynamic)
  trustStats?: TrustStat[];

  // Verified accounts (Keytrace)
  verifiedAccounts?: VerifiedAccount[];

  // Social graph counts
  followersCount: number;
  followingCount: number;
  connectionsCount: number;

  // Professional history
  positions: ProfilePosition[];
  education: ProfileEducation[];
  skills: ProfileSkill[];
  certifications?: ProfileCertification[];
  projects?: ProfileProject[];
  publications?: ProfilePublication[];
  volunteering?: ProfileVolunteering[];
  honors?: ProfileHonor[];
  languages?: ProfileLanguage[];
  courses?: ProfileCourse[];
  externalAccounts?: ExternalAccount[];
}
