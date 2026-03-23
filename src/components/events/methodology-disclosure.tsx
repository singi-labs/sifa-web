export function MethodologyDisclosure() {
  return (
    <div role="note" className="rounded-xl border border-border bg-secondary/30 p-5 text-sm">
      <h2 className="text-base font-semibold">How this data is collected</h2>
      <ul className="mt-3 space-y-1 text-muted-foreground">
        <li>
          <strong>Attendee list:</strong> Public RSVPs from{' '}
          <a
            href="https://smokesignal.events"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Smoke Signal
          </a>
        </li>
        <li>
          <strong>Speaker list:</strong>{' '}
          <a
            href="https://atmosphereconf.org/talks"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            atmosphereconf.org/talks
          </a>
        </li>
        <li>
          <strong>Profile data:</strong> Public AT Protocol records via the Bluesky public API and
          each user&apos;s PDS
        </li>
        <li>
          <strong>Follow graph:</strong> Public{' '}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">app.bsky.graph</code> records
        </li>
        <li>
          <strong>Post activity:</strong> Public{' '}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">app.bsky.feed.post</code>{' '}
          records
        </li>
      </ul>
      <p className="mt-3 text-xs text-muted-foreground/80">
        Data refreshes hourly. All data is public. Sifa does not store follow relationships &mdash;
        graph data is computed at render time.
      </p>
    </div>
  );
}
