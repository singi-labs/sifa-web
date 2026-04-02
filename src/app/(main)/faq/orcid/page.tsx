import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FAQ - ORCID Publications on Sifa',
  description:
    'How to get your scientific publications on your Sifa professional profile using ORCID.',
  openGraph: {
    images: ['/api/og?title=FAQ+-+ORCID+Publications'],
  },
};

export default function FaqOrcidPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/faq" className="underline-offset-4 hover:underline">
          FAQ
        </Link>
        {' / '}
        ORCID
      </p>
      <h1 className="mt-2 text-3xl font-bold">How to get your publications on your Sifa profile</h1>
      <p className="mt-2 text-muted-foreground">
        Sifa integrates with{' '}
        <a
          href="https://orcid.org"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ORCID
        </a>
        , the global researcher identifier used by universities, publishers, and funding bodies. If
        you have an ORCID profile, your publications can appear automatically on Sifa.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold">Getting started</h2>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-muted-foreground">
            <li>
              Create an ORCID account at{' '}
              <a
                href="https://orcid.org/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                orcid.org
              </a>{' '}
              if you don&apos;t have one yet.
            </li>
            <li>
              Make sure your publications are added to your ORCID profile and set to{' '}
              <strong className="text-foreground">public</strong> visibility.
            </li>
            <li>
              On Sifa, go to the <strong className="text-foreground">Links</strong> section on your
              profile and add your ORCID URL (e.g.{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                https://orcid.org/0000-0000-0000-0000
              </code>
              ).
            </li>
            <li>
              Your ORCID publications will automatically appear in your{' '}
              <strong className="text-foreground">Publications</strong> section.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Verifying your ORCID account</h2>
          <p className="mt-2 text-muted-foreground">
            Verification proves you own the linked ORCID account. It adds a checkmark to your ORCID
            link and to each publication sourced from it.
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-muted-foreground">
            <li>
              Go to your{' '}
              <a
                href="https://orcid.org/my-orcid"
                className="font-medium text-foreground underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ORCID profile
              </a>{' '}
              and find the <strong className="text-foreground">Websites &amp; social links</strong>{' '}
              section.
            </li>
            <li>
              Add your Sifa profile URL (e.g.{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                https://sifa.id/p/yourhandle
              </code>
              ) with visibility set to <strong className="text-foreground">Everyone</strong>.
            </li>
            <li>
              Back on Sifa, click the <strong className="text-foreground">Check now</strong> button
              next to your ORCID link.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Can I hide specific publications?</h2>
          <p className="mt-2 text-muted-foreground">
            Yes. All your ORCID publications are shown by default, but you can hide individual items
            using the eye icon next to each publication in your edit view. Hidden publications are
            only visible to you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">What happens if I disconnect my ORCID?</h2>
          <p className="mt-2 text-muted-foreground">
            Removing your ORCID link from the Links section removes all ORCID-sourced publications
            from your profile. Your manually-added publications are not affected. If you re-link the
            same ORCID later, your hide preferences are restored.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">How often does Sifa refresh my publications?</h2>
          <p className="mt-2 text-muted-foreground">
            Sifa syncs with ORCID daily. New publications added to your ORCID profile will appear on
            Sifa within 24 hours. You can also tap the{' '}
            <strong className="text-foreground">Refresh from ORCID</strong> button in your
            Publications section to sync immediately (requires a verified ORCID account).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Why don&apos;t my ORCID publications show up?</h2>
          <p className="mt-2 text-muted-foreground">
            Check that your works are set to <strong className="text-foreground">public</strong>{' '}
            visibility on{' '}
            <a
              href="https://orcid.org/my-orcid"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              orcid.org
            </a>
            . Works set to &quot;Trusted parties only&quot; or &quot;Only me&quot; are not
            accessible via the public API and will not appear on Sifa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Can I edit ORCID publications on Sifa?</h2>
          <p className="mt-2 text-muted-foreground">
            No. ORCID is the source of truth for these publications. To change a title, add a DOI,
            or update any other detail, edit the publication on{' '}
            <a
              href="https://orcid.org/my-orcid"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              orcid.org
            </a>{' '}
            and Sifa will pick up the change on the next sync. You can always add publications
            manually in the Publications section if you prefer to manage them directly on Sifa.
          </p>
        </section>
      </div>
    </div>
  );
}
