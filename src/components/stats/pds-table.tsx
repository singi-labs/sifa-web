'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export interface PdsRow {
  pds: string;
  creates: number;
  pct: number;
  reachablePct: number | null;
}

interface PdsTableProps {
  data: PdsRow[];
}

type SortKey = 'pds' | 'creates' | 'pct' | 'reachablePct';
type SortDir = 'asc' | 'desc';

function ReachabilityBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-sm text-muted-foreground">N/A</span>;
  }

  let className: string;
  if (value >= 80) {
    className =
      'rounded px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  } else if (value >= 20) {
    className =
      'rounded px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  } else {
    className =
      'rounded px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  return <span className={className}>{value.toLocaleString()}%</span>;
}

function SortArrow({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (column !== sortKey) {
    return (
      <svg
        className="ml-1 inline-block h-3 w-3 text-muted-foreground/40"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M8 3L5 7h6L8 3ZM8 13l3-4H5l3 4Z" />
      </svg>
    );
  }
  if (sortDir === 'asc') {
    return (
      <svg className="ml-1 inline-block h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 4l4 5H4l4-5Z" />
      </svg>
    );
  }
  return (
    <svg className="ml-1 inline-block h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12L4 7h8l-4 5Z" />
    </svg>
  );
}

const PAGE_SIZE = 50;

export function PdsTable({ data }: PdsTableProps) {
  const t = useTranslations('stats');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('creates');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.pds.toLowerCase().includes(q));
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp: number;
      if (sortKey === 'pds') {
        cmp = a.pds.localeCompare(b.pds);
      } else if (sortKey === 'reachablePct') {
        const av = a.reachablePct;
        const bv = b.reachablePct;
        if (av === null && bv === null) cmp = 0;
        else if (av === null) cmp = 1;
        else if (bv === null) cmp = -1;
        else cmp = av - bv;
      } else {
        cmp = a[sortKey] - b[sortKey];
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'pds' ? 'asc' : 'desc');
    }
    setPage(0);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(0);
  }

  function thClass(key: SortKey) {
    return `cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors${sortKey === key ? ' text-foreground' : ''}`;
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <input
          type="search"
          value={search}
          onChange={handleSearch}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={t('searchPlaceholder')}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr>
              <th scope="col" className={thClass('pds')} onClick={() => handleSort('pds')}>
                {t('pdsColumn')}
                <SortArrow column="pds" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                scope="col"
                className={`${thClass('creates')} text-right`}
                onClick={() => handleSort('creates')}
              >
                {t('createsColumn')}
                <SortArrow column="creates" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                scope="col"
                className={`${thClass('pct')} text-right`}
                onClick={() => handleSort('pct')}
              >
                {t('percentColumn')}
                <SortArrow column="pct" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                scope="col"
                className={`${thClass('reachablePct')} text-right`}
                onClick={() => handleSort('reachablePct')}
              >
                {t('reachableColumn')}
                <SortArrow column="reachablePct" sortKey={sortKey} sortDir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.pds} className="hover:bg-secondary/30 transition-colors">
                  <td className="max-w-xs truncate px-3 py-2 font-mono text-xs text-foreground">
                    {row.pds}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">
                    {row.creates.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">
                    {row.pct.toLocaleString()}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ReachabilityBadge value={row.reachablePct} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(totalPages > 1 || sorted.length > 0) && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {sorted.length.toLocaleString()} results &middot; page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md px-3 py-1 text-xs font-medium transition-colors bg-secondary text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md px-3 py-1 text-xs font-medium transition-colors bg-secondary text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
