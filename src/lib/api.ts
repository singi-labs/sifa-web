const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export interface ProfileSearchResult {
  did?: string;
  handle: string;
  displayName?: string;
  headline?: string;
  avatar?: string;
  about?: string;
  currentRole?: string;
  currentCompany?: string;
  claimed?: boolean;
}

export async function fetchProfile(handleOrDid: string) {
  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(`${API_URL}/api/profile/${encodeURIComponent(handleOrDid)}`, {
      next: { revalidate: 300, tags: [`profile-${handleOrDid}`] },
    });
    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '5', 10);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }
    if (!res.ok) return null;
    return res.json();
  }
  return null;
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

// --- Suggestions ---

export interface SuggestionProfile {
  did: string;
  handle: string;
  displayName?: string;
  headline?: string;
  avatarUrl?: string;
  source: string;
  dismissed: boolean;
}

export interface SuggestionsResponse {
  onSifa: SuggestionProfile[];
  notOnSifa: SuggestionProfile[];
  cursor?: string;
}

export async function fetchSuggestions(opts?: {
  source?: string;
  includeDismissed?: boolean;
  cursor?: string;
  limit?: number;
}): Promise<SuggestionsResponse> {
  const params = new URLSearchParams();
  if (opts?.source) params.set('source', opts.source);
  if (opts?.includeDismissed) params.set('include_dismissed', 'true');
  if (opts?.cursor) params.set('cursor', opts.cursor);
  if (opts?.limit) params.set('limit', String(opts.limit));

  const qs = params.toString();
  const res = await fetch(`${API_URL}/api/suggestions${qs ? `?${qs}` : ''}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) return { onSifa: [], notOnSifa: [] };
  return res.json();
}

export async function fetchSuggestionCount(since?: string): Promise<number> {
  const params = since ? `?since=${encodeURIComponent(since)}` : '';
  const res = await fetch(`${API_URL}/api/suggestions/count${params}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export async function dismissSuggestion(subjectDid: string): Promise<void> {
  await fetch(`${API_URL}/api/suggestions/dismiss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subjectDid }),
  });
}

export async function undismissSuggestion(subjectDid: string): Promise<void> {
  await fetch(`${API_URL}/api/suggestions/dismiss/${encodeURIComponent(subjectDid)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

export async function createInvite(subjectDid: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subjectDid }),
  });
  if (!res.ok) throw new Error('Failed to create invite');
  const data = await res.json();
  return data.inviteUrl;
}

export interface StatsResponse {
  profileCount: number;
  avatars: string[];
  atproto: {
    userCount: number;
    growthPerSecond: number;
    timestamp: number;
  } | null;
}

export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface FeaturedProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  headline?: string;
  about?: string;
  currentRole?: string;
  currentCompany?: string;
  locationCountry?: string;
  locationRegion?: string;
  locationCity?: string;
  countryCode?: string;
  location?: string;
  website?: string;
  openTo?: string[];
  preferredWorkplace?: string[];
  followersCount?: number;
  atprotoFollowersCount?: number;
  pdsProvider?: { name: string; host: string } | null;
  claimed: boolean;
  featuredDate: string;
}

export async function fetchFeaturedProfile(): Promise<FeaturedProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/featured-profile`, {
      next: { revalidate: 900 },
    });
    if (res.status === 204 || !res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
