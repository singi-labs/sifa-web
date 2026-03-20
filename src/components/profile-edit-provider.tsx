'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';
import { revalidateProfileCache } from '@/app/actions';
import type { Profile } from '@/lib/types';

interface ProfileEditContextValue {
  profile: Profile;
  /** True when the actual owner is viewing -- unaffected by preview mode. */
  isActualOwner: boolean;
  /** True when preview mode is active (owner viewing as public). */
  previewMode: boolean;
  togglePreview: () => void;
  updateProfile: (fields: Partial<Profile>) => void;
  addItem: (key: string, item: Record<string, unknown> & { rkey: string }) => void;
  updateItem: (key: string, rkey: string, fields: Record<string, unknown>) => void;
  removeItem: (key: string, rkey: string) => void;
}

const ProfileEditContext = createContext<ProfileEditContextValue | null>(null);

interface ProfileEditProviderProps {
  initialProfile: Profile;
  children: ReactNode;
}

export function ProfileEditProvider({ initialProfile, children }: ProfileEditProviderProps) {
  const { session } = useAuth();
  const isActualOwner = Boolean(session?.did && session.did === initialProfile.did);
  const [previewMode, setPreviewMode] = useState(false);

  const isOwnProfile = isActualOwner && !previewMode;

  const [profile, setProfile] = useState<Profile>(() => ({
    ...initialProfile,
    isOwnProfile,
  }));

  // Keep isOwnProfile in sync when session loads or preview mode changes
  const prevIsOwn = profile.isOwnProfile;
  if (isOwnProfile !== prevIsOwn) {
    setProfile((prev) => ({ ...prev, isOwnProfile }));
  }

  const togglePreview = useCallback(() => {
    setPreviewMode((prev) => !prev);
  }, []);

  /** Bust the ISR cache for this profile so the next page load gets fresh data. */
  const bustCache = useCallback(() => {
    void revalidateProfileCache(initialProfile.handle);
    if (initialProfile.did) void revalidateProfileCache(initialProfile.did);
  }, [initialProfile.handle, initialProfile.did]);

  const updateProfile = useCallback(
    (fields: Partial<Profile>) => {
      setProfile((prev) => ({ ...prev, ...fields }));
      bustCache();
    },
    [bustCache],
  );

  const addItem = useCallback(
    (key: string, item: Record<string, unknown> & { rkey: string }) => {
      setProfile((prev) => {
        const existing = (prev[key as keyof Profile] as Array<{ rkey: string }>) ?? [];
        return { ...prev, [key]: [...existing, item] };
      });
      bustCache();
    },
    [bustCache],
  );

  const updateItem = useCallback(
    (key: string, rkey: string, fields: Record<string, unknown>) => {
      setProfile((prev) => {
        const existing = (prev[key as keyof Profile] as Array<{ rkey: string }>) ?? [];
        return {
          ...prev,
          [key]: existing.map((item) => (item.rkey === rkey ? { ...item, ...fields } : item)),
        };
      });
      bustCache();
    },
    [bustCache],
  );

  const removeItem = useCallback(
    (key: string, rkey: string) => {
      setProfile((prev) => {
        const existing = (prev[key as keyof Profile] as Array<{ rkey: string }>) ?? [];
        return {
          ...prev,
          [key]: existing.filter((item) => item.rkey !== rkey),
        };
      });
      bustCache();
    },
    [bustCache],
  );

  return (
    <ProfileEditContext.Provider
      value={{
        profile,
        isActualOwner,
        previewMode,
        togglePreview,
        updateProfile,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </ProfileEditContext.Provider>
  );
}

export function useProfileEdit(): ProfileEditContextValue {
  const context = useContext(ProfileEditContext);
  if (context === null) {
    throw new Error('useProfileEdit must be used within a ProfileEditProvider');
  }
  return context;
}
