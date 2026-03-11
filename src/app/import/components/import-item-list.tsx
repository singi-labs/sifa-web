'use client';

interface ImportItemListProps<T> {
  items: T[];
  labelFn: (item: T) => string;
  detailFn?: (item: T) => string | undefined;
  emptyMessage: string;
  onRemove: (index: number) => void;
}

export function ImportItemList<T>({
  items,
  labelFn,
  detailFn,
  emptyMessage,
  onRemove,
}: ImportItemListProps<T>) {
  if (items.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y py-2">
      {items.map((item, i) => {
        const label = labelFn(item);
        const detail = detailFn?.(item);
        return (
          <li key={i} className="flex items-start justify-between gap-4 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
            </div>
            <button
              type="button"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${label}`}
            >
              &times;
            </button>
          </li>
        );
      })}
    </ul>
  );
}
