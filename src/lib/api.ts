const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export interface ProfileSearchResult {
  handle: string;
  displayName?: string;
  headline?: string;
  avatar?: string;
  currentRole?: string;
  currentCompany?: string;
}

export async function fetchProfile(handleOrDid: string) {
  const res = await fetch(`${API_URL}/api/profile/${encodeURIComponent(handleOrDid)}`, {
    next: { revalidate: 300, tags: [`profile-${handleOrDid}`] },
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
