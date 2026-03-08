'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  defaultValue: string;
}

export function SearchInput({ defaultValue }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = (formData.get('q') as string)?.trim();
      if (query) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('q', query);
        router.push(`/search?${params.toString()}`);
      }
    },
    [router, searchParams],
  );

  return (
    <form onSubmit={handleSubmit} role="search">
      <Input
        name="q"
        type="search"
        placeholder="Search people by name, skills, or headline"
        defaultValue={defaultValue}
        autoFocus
      />
    </form>
  );
}
