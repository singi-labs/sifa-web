const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export async function fetchProfile(handleOrDid: string) {
  const res = await fetch(`${API_URL}/api/profile/${encodeURIComponent(handleOrDid)}`, {
    next: { revalidate: 300 }, // ISR: 5 minutes
  });
  if (!res.ok) return null;
  return res.json();
}
