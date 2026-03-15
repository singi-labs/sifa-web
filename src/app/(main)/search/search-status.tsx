import { getTranslations } from 'next-intl/server';

const doneKeys = ['nameHeadline', 'bio', 'currentRole'] as const;
const plannedKeys = ['skills', 'location', 'atproto', 'autocomplete', 'filters'] as const;

export async function SearchStatus() {
  const t = await getTranslations('search');

  return (
    <aside className="mt-10 rounded-lg border border-border bg-muted/40 p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{t('statusTitle')}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{t('sifaOnlyNote')}</p>

      <ul className="space-y-1.5 text-sm">
        {doneKeys.map((key) => (
          <li key={key} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-white" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span>{t(`statusDone.${key}`)}</span>
          </li>
        ))}
        {plannedKeys.map((key) => (
          <li key={key} className="flex items-start gap-2 text-muted-foreground">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </span>
            <span>{t(`statusPlanned.${key}`)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
