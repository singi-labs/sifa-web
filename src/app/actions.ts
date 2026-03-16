'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateProfileCache(handleOrDid: string) {
  try {
    revalidatePath(`/p/${handleOrDid}`);
  } catch {
    // Silently fail outside of Next.js server context (e.g., in tests)
  }
}
