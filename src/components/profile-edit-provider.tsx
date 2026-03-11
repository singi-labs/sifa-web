'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Profile } from '@/lib/types';

interface ProfileEditContextValue {
  profile: Profile;
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
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const updateProfile = useCallback((fields: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  }, []);

  const addItem = useCallback((key: string, item: Record<string, unknown> & { rkey: string }) => {
    setProfile((prev) => {
      const existing = (prev[key as keyof Profile] as Array<{ rkey: string }>) ?? [];
      return { ...prev, [key]: [...existing, item] };
    });
  }, []);

  const updateItem = useCallback(
    (key: string, rkey: string, fields: Record<string, unknown>) => {
      setProfile((prev) => {
        const existing = (prev[key as keyof Profile] as Array<{ rkey: string }>) ?? [];
        return {
          ...prev,
          [key]: existing.map((item) =>
            item.rkey === rkey ? { ...item, ...fields } : item,
          ),
        };
      });
    },
    [],
  );

  const removeItem = useCallback((key: string, rkey: string) => {
    setProfile((prev) => {
      const existing = (prev[key as keyof Profile] as Array<{ rkey: string }>) ?? [];
      return {
        ...prev,
        [key]: existing.filter((item) => item.rkey !== rkey),
      };
    });
  }, []);

  return (
    <ProfileEditContext.Provider
      value={{ profile, updateProfile, addItem, updateItem, removeItem }}
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
