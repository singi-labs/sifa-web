const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface WriteResult {
  success: boolean;
  error?: string;
}

async function apiRequest(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<WriteResult> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
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

export async function updateProfileSelf(data: {
  headline?: string;
  about?: string;
  location?: string;
  website?: string;
}): Promise<WriteResult> {
  return apiRequest('/api/profile/self', 'PUT', data);
}

export async function createRecord(
  collection: string,
  data: Record<string, unknown>,
): Promise<WriteResult> {
  return apiRequest(`/api/profile/records/${encodeURIComponent(collection)}`, 'POST', data);
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
