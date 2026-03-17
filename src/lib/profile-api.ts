import type { ExternalAccount, ProfilePosition, SkillSuggestion, SkillRef } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export interface WriteResult {
  success: boolean;
  error?: string;
}

export interface CreateResult extends WriteResult {
  rkey?: string;
}

async function apiRequest(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<WriteResult> {
  try {
    const headers: HeadersInit = body ? { 'Content-Type': 'application/json' } : {};
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (data as { message?: string }).message ?? `Request failed (${res.status})`,
      };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

async function apiCreateRequest(path: string, body: unknown): Promise<CreateResult> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (data as { message?: string }).message ?? `Request failed (${res.status})`,
      };
    }
    const data = (await res.json()) as { rkey: string };
    return { success: true, rkey: data.rkey };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function updateProfileSelf(data: {
  headline?: string;
  about?: string;
  location?: { country: string; countryCode?: string; region?: string; city?: string };
  website?: string;
  openTo?: string[];
  preferredWorkplace?: string[];
}): Promise<WriteResult> {
  return apiRequest('/api/profile/self', 'PUT', data);
}

export async function refreshPds(): Promise<
  WriteResult & { displayName?: string | null; avatar?: string | null }
> {
  try {
    const res = await fetch(`${API_URL}/api/profile/refresh-pds`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (data as { message?: string }).message ?? `Request failed (${res.status})`,
      };
    }
    const data = (await res.json()) as {
      ok: boolean;
      displayName: string | null;
      avatar: string | null;
    };
    return { success: true, displayName: data.displayName, avatar: data.avatar };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function createRecord(
  collection: string,
  data: Record<string, unknown>,
): Promise<CreateResult> {
  return apiCreateRequest(`/api/profile/records/${encodeURIComponent(collection)}`, data);
}

export async function updateRecord(
  collection: string,
  rkey: string,
  data: Record<string, unknown>,
): Promise<WriteResult> {
  return apiRequest(
    `/api/profile/records/${encodeURIComponent(collection)}/${encodeURIComponent(rkey)}`,
    'PUT',
    data,
  );
}

export async function deleteRecord(collection: string, rkey: string): Promise<WriteResult> {
  return apiRequest(
    `/api/profile/records/${encodeURIComponent(collection)}/${encodeURIComponent(rkey)}`,
    'DELETE',
  );
}

export async function createPosition(data: Record<string, unknown>): Promise<CreateResult> {
  return apiCreateRequest('/api/profile/position', data);
}

export async function updatePosition(
  rkey: string,
  data: Record<string, unknown>,
): Promise<WriteResult> {
  return apiRequest(`/api/profile/position/${encodeURIComponent(rkey)}`, 'PUT', data);
}

export async function deletePosition(rkey: string): Promise<WriteResult> {
  return apiRequest(`/api/profile/position/${encodeURIComponent(rkey)}`, 'DELETE');
}

export async function createEducation(data: Record<string, unknown>): Promise<CreateResult> {
  return apiCreateRequest('/api/profile/education', data);
}

export async function updateEducation(
  rkey: string,
  data: Record<string, unknown>,
): Promise<WriteResult> {
  return apiRequest(`/api/profile/education/${encodeURIComponent(rkey)}`, 'PUT', data);
}

export async function deleteEducation(rkey: string): Promise<WriteResult> {
  return apiRequest(`/api/profile/education/${encodeURIComponent(rkey)}`, 'DELETE');
}

export async function createSkill(data: Record<string, unknown>): Promise<CreateResult> {
  return apiCreateRequest('/api/profile/skill', data);
}

export async function updateSkill(
  rkey: string,
  data: Record<string, unknown>,
): Promise<WriteResult> {
  return apiRequest(`/api/profile/skill/${encodeURIComponent(rkey)}`, 'PUT', data);
}

export async function deleteSkill(rkey: string): Promise<WriteResult> {
  return apiRequest(`/api/profile/skill/${encodeURIComponent(rkey)}`, 'DELETE');
}

export async function createExternalAccount(data: {
  platform: string;
  url: string;
  label?: string;
  feedUrl?: string;
}): Promise<WriteResult & { rkey?: string; feedUrl?: string | null }> {
  try {
    const res = await fetch(`${API_URL}/api/profile/external-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (errData as { message?: string }).message ?? `Request failed (${res.status})`,
      };
    }
    const body = (await res.json()) as { rkey: string; feedUrl: string | null };
    return { success: true, rkey: body.rkey, feedUrl: body.feedUrl };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function updateExternalAccount(
  rkey: string,
  data: { platform: string; url: string; label?: string; feedUrl?: string },
): Promise<WriteResult> {
  return apiRequest(`/api/profile/external-accounts/${encodeURIComponent(rkey)}`, 'PUT', data);
}

export async function deleteExternalAccount(rkey: string): Promise<WriteResult> {
  return apiRequest(`/api/profile/external-accounts/${encodeURIComponent(rkey)}`, 'DELETE');
}

export async function setExternalAccountPrimary(rkey: string): Promise<WriteResult> {
  return apiRequest(`/api/profile/external-accounts/${encodeURIComponent(rkey)}/primary`, 'PUT');
}

export async function unsetExternalAccountPrimary(rkey: string): Promise<WriteResult> {
  return apiRequest(`/api/profile/external-accounts/${encodeURIComponent(rkey)}/primary`, 'DELETE');
}

export async function resetProfile(): Promise<WriteResult> {
  return apiRequest('/api/profile/reset', 'DELETE');
}

export async function fetchExternalAccounts(handleOrDid: string): Promise<ExternalAccount[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/profile/${encodeURIComponent(handleOrDid)}/external-accounts`,
      { credentials: 'include' },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { accounts: ExternalAccount[] };
    return data.accounts;
  } catch {
    return [];
  }
}

export async function searchSkills(query: string, limit = 10): Promise<SkillSuggestion[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/skills/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { skills: SkillSuggestion[] };
    return data.skills;
  } catch {
    return [];
  }
}

export async function linkSkillToPosition(
  position: ProfilePosition,
  skillRef: SkillRef,
): Promise<WriteResult> {
  const currentSkills = position.skills ?? [];
  const alreadyLinked = currentSkills.some((s) => s.uri === skillRef.uri);
  if (alreadyLinked) return { success: true };
  return updatePosition(position.rkey, {
    companyName: position.companyName,
    title: position.title,
    description: position.description,
    startDate: position.startDate,
    endDate: position.endDate,
    location: position.location,
    current: position.current,
    skills: [...currentSkills, skillRef],
  });
}

export async function unlinkSkillFromPosition(
  position: ProfilePosition,
  skillRef: SkillRef,
): Promise<WriteResult> {
  const currentSkills = position.skills ?? [];
  return updatePosition(position.rkey, {
    companyName: position.companyName,
    title: position.title,
    description: position.description,
    startDate: position.startDate,
    endDate: position.endDate,
    location: position.location,
    current: position.current,
    skills: currentSkills.filter((s) => s.uri !== skillRef.uri),
  });
}

export async function createEndorsement(data: {
  skillUri: string;
  comment?: string;
}): Promise<CreateResult> {
  return apiCreateRequest('/api/endorsements', data);
}
export async function deleteAccount(): Promise<WriteResult & { handle?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/profile/account`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (data as { message?: string }).message ?? `Request failed (${res.status})`,
      };
    }
    const data = (await res.json()) as { ok: boolean; handle?: string };
    return { success: true, handle: data.handle };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
