'use client';

interface AppTotal {
  appId: string;
  appName: string;
  total: number;
}

interface HeatmapLegendProps {
  appTotals: AppTotal[];
  showAppKey: boolean;
  hiddenApps?: Set<string>;
  onToggleApp?: (appId: string) => void;
}

const MAX_APP_KEY_ITEMS = 6;

export function HeatmapLegend({
  appTotals,
  showAppKey,
  hiddenApps,
  onToggleApp,
}: HeatmapLegendProps) {
  if (!showAppKey || appTotals.length === 0) return null;

  const interactive = hiddenApps !== undefined && onToggleApp !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {appTotals.slice(0, MAX_APP_KEY_ITEMS).map(({ appId, appName }) => {
        const isHidden = hiddenApps?.has(appId) ?? false;
        return (
          <button
            key={appId}
            type="button"
            className={`flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors ${interactive ? 'cursor-pointer hover:bg-muted' : 'cursor-default'}`}
            onClick={interactive ? () => onToggleApp(appId) : undefined}
            aria-pressed={interactive ? !isHidden : undefined}
            aria-label={interactive ? `${isHidden ? 'Show' : 'Hide'} ${appName}` : undefined}
          >
            <span
              className="inline-block h-2 w-2 rounded-full transition-opacity"
              style={{
                backgroundColor: `var(--app-${appId}-stripe)`,
                opacity: isHidden ? 0.3 : 1,
              }}
            />
            <span
              className="text-xs transition-colors"
              style={{
                color: isHidden ? 'var(--muted-foreground)' : undefined,
                textDecoration: isHidden ? 'line-through' : 'none',
              }}
            >
              {appName}
            </span>
          </button>
        );
      })}
    </div>
  );
}
