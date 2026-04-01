interface UnregisteredCollection {
  collection: string;
  namespace: string;
  userCount: number;
  totalRecords: number;
  latestSeenAt: string | null;
}

interface UnregisteredCollectionsTableProps {
  data: UnregisteredCollection[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function UnregisteredCollectionsTable({
  data,
  total,
  page,
  pageSize,
  onPageChange,
}: UnregisteredCollectionsTableProps) {
  if (total === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No unregistered collections found. All discovered collections are in the app registry.
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-base font-semibold">
        {total} unregistered collection{total !== 1 ? 's' : ''}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="pb-2 pr-4">Collection</th>
              <th className="pb-2 pr-4">Namespace</th>
              <th className="pb-2 pr-4 text-right">Users</th>
              <th className="pb-2 pr-4 text-right">Records (90d)</th>
              <th className="pb-2 text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={row.collection} className="hover:bg-muted/50">
                <td className="py-2 pr-4 font-mono text-xs">{row.collection}</td>
                <td className="py-2 pr-4 text-muted-foreground">{row.namespace}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{row.userCount}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{row.totalRecords}</td>
                <td className="py-2 text-right text-muted-foreground">
                  {formatDate(row.latestSeenAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="rounded-md bg-muted px-3 py-1 text-sm font-medium transition-colors hover:text-foreground disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="rounded-md bg-muted px-3 py-1 text-sm font-medium transition-colors hover:text-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
