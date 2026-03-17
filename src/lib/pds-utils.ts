import type { PdsProviderInfo } from './types';

export interface PdsProvider {
  name: string;
  profileUrl: string;
}

const PDS_PROVIDERS: { suffix: string; name: string; profileBase: string }[] = [
  { suffix: '.bsky.social', name: 'bluesky', profileBase: 'https://bsky.app/profile/' },
  { suffix: '.blacksky.app', name: 'blacksky', profileBase: 'https://blacksky.app/profile/' },
  { suffix: '.eurosky.social', name: 'eurosky', profileBase: 'https://eurosky.tech/profile/' },
];

const PROVIDER_PROFILE_BASES = Object.fromEntries(
  PDS_PROVIDERS.map((p) => [p.name, p.profileBase]),
);

export function pdsProviderFromApi(
  apiProvider: PdsProviderInfo | null | undefined,
  handle: string,
): PdsProvider | null {
  if (!apiProvider) return null;
  const profileBase = PROVIDER_PROFILE_BASES[apiProvider.name];
  if (!profileBase) return null;
  return { name: apiProvider.name, profileUrl: `${profileBase}${handle}` };
}

export function getHandleStem(handle: string): string {
  const lower = handle.toLowerCase();
  for (const provider of PDS_PROVIDERS) {
    if (lower.endsWith(provider.suffix) && lower.length > provider.suffix.length) {
      return handle.slice(0, -provider.suffix.length);
    }
  }
  return handle;
}

export function getDisplayLabel(displayName: string | undefined, handle: string): string {
  if (displayName) return displayName;
  return getHandleStem(handle);
}

export function detectPdsProvider(handle: string): PdsProvider | null {
  const lower = handle.toLowerCase();
  for (const provider of PDS_PROVIDERS) {
    if (lower.endsWith(provider.suffix)) {
      return {
        name: provider.name,
        profileUrl: `${provider.profileBase}${handle}`,
      };
    }
  }
  return null;
}
