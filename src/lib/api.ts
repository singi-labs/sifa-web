const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export interface ProfileSearchResult {
  handle: string;
  headline?: string;
  avatar?: string;
}

export async function fetchProfile(handleOrDid: string) {
  const res = await fetch(`${API_URL}/api/profile/${encodeURIComponent(handleOrDid)}`, {
    next: { revalidate: 300 }, // ISR: 5 minutes
  });
  if (!res.ok) return null;
  return res.json();
}

export async function searchProfiles(query: string): Promise<ProfileSearchResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_URL}/api/search/profiles?q=${encodeURIComponent(query)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.profiles ?? [];
}
