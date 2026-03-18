import { getTranslations } from 'next-intl/server';

const sifaDoneKeys = ['nameHeadline', 'bio', 'currentRole'] as const;
const sifaPlannedKeys = ['skills', 'location', 'autocomplete', 'filters'] as const;
const globalDoneKeys = ['handleLookup'] as const;
const globalPlannedKeys = ['fullTextGlobal'] as const;

function DoneItem({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5.5L4 7.5L8 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{label}</span>
    </li>
  );
}

function PlannedItem({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2 text-muted-foreground">
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span>{label}</span>
    </li>
  );
}

export async function SearchStatus() {
  const t = await getTranslations('search');

  return (
    <aside className="mt-10 rounded-lg border border-border bg-muted/40 p-5">
      <h2 className="mb-1 text-sm font-semibold text-foreground">{t('statusTitle')}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{t('statusIntro')}</p>

      <div className="space-y-4">
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('globalGroupTitle')}
          </h3>
          <ul className="space-y-1.5 text-sm">
            {globalDoneKeys.map((key) => (
              <DoneItem key={key} label={t(`globalGroupDone.${key}`)} />
            ))}
          </ul>
          {globalPlannedKeys.length > 0 && (
            <>
              <p className="mb-1 mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('comingSoonLabel')}
              </p>
              <ul className="space-y-1.5 text-sm">
                {globalPlannedKeys.map((key) => (
                  <PlannedItem key={key} label={t(`globalGroupPlanned.${key}`)} />
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('sifaGroupTitle')}
          </h3>
          <ul className="space-y-1.5 text-sm">
            {sifaDoneKeys.map((key) => (
              <DoneItem key={key} label={t(`sifaGroupDone.${key}`)} />
            ))}
          </ul>
          {sifaPlannedKeys.length > 0 && (
            <>
              <p className="mb-1 mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t('comingSoonLabel')}
              </p>
              <ul className="space-y-1.5 text-sm">
                {sifaPlannedKeys.map((key) => (
                  <PlannedItem key={key} label={t(`sifaGroupPlanned.${key}`)} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
