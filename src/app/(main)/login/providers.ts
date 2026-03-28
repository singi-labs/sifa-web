export interface Provider {
  id: string;
  name: string;
  host: string;
  signupUrl: string;
  descriptionKey: string;
  countryKey: string;
  readMoreUrl: string;
  recommended?: boolean;
  requiresInvite?: boolean;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'bluesky',
    name: 'Bluesky',
    host: 'bsky.social',
    signupUrl: 'https://bsky.app',
    descriptionKey: 'providerBlueskyDesc',
    countryKey: 'providerBlueskyCountry',
    readMoreUrl: 'https://bsky.social',
    recommended: true,
  },
  {
    id: 'tangled',
    name: 'Tangled',
    host: 'tngl.sh',
    signupUrl: 'https://tangled.org/signup',
    descriptionKey: 'providerTangledDesc',
    countryKey: 'providerTangledCountry',
    readMoreUrl: 'https://tangled.org',
  },
  {
    id: 'eurosky',
    name: 'Eurosky',
    host: 'eurosky.social',
    signupUrl: 'https://www.eurosky.tech/register',
    descriptionKey: 'providerEuroskyDesc',
    countryKey: 'providerEuroskyCountry',
    readMoreUrl: 'https://www.eurosky.tech',
    requiresInvite: true,
  },
];
