import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { sanitize } from '@/lib/sanitize';

interface ProfileCardProps {
  handle: string;
  displayName?: string;
  headline?: string;
  avatar?: string;
  currentRole?: string;
  currentCompany?: string;
}

export function ProfileCard({
  handle,
  displayName,
  headline,
  avatar,
  currentRole,
  currentCompany,
}: ProfileCardProps) {
  const label = displayName ?? handle;
  return (
    <Link href={`/p/${encodeURIComponent(handle)}`} className="block">
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={`${label}'s avatar`}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              label.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{sanitize(label)}</p>
            {displayName && (
              <p className="truncate text-xs text-muted-foreground">@{sanitize(handle)}</p>
            )}
            {headline && (
              <p className="truncate text-sm text-muted-foreground">{sanitize(headline)}</p>
            )}
            {currentRole && currentCompany && (
              <p className="truncate text-sm text-muted-foreground">
                {sanitize(currentRole)} at {sanitize(currentCompany)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
