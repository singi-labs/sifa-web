interface DataTableProps {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number | boolean | null>[];
  caption?: string;
}

export function DataTable({ columns, rows, caption }: DataTableProps) {
  if (!rows.length) return null;

  return (
    <details className="mt-4">
      <summary className="inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
        Show data as table
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-border px-3 py-2 text-left font-medium text-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-secondary/50' : undefined}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="border-b border-border px-3 py-2 text-muted-foreground"
                  >
                    {formatCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function formatCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '--';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
