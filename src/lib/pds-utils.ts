export interface PdsProvider {
  name: string;
  profileUrl: string;
}

const PDS_PROVIDERS: { suffix: string; name: string; profileBase: string }[] = [
  { suffix: '.bsky.social', name: 'bluesky', profileBase: 'https://bsky.app/profile/' },
  { suffix: '.blacksky.app', name: 'blacksky', profileBase: 'https://blacksky.app/profile/' },
  { suffix: '.eurosky.social', name: 'eurosky', profileBase: 'https://eurosky.tech/profile/' },
];

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
