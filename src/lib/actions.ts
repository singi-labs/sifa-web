'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateProfile(handle: string) {
  revalidatePath(`/p/${handle}`);
}
