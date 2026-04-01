interface UnregisteredCollection {
  collection: string;
  namespace: string;
  userCount: number;
  totalRecords: number;
  latestSeenAt: string | null;
}

interface UnregisteredCollectionsTableProps {
  data: UnregisteredCollection[];
}

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function UnregisteredCollectionsTable({ data }: UnregisteredCollectionsTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No unregistered collections found. All discovered collections are in the app registry.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-base font-semibold">
        {data.length} unregistered collection{data.length !== 1 ? 's' : ''}
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
    </div>
  );
}
