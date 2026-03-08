import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileCardProps {
  handle: string;
  headline?: string;
  avatar?: string;
}

export function ProfileCard({ handle, headline, avatar }: ProfileCardProps) {
  return (
    <Link href={`/profile/${encodeURIComponent(handle)}`} className="block">
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={`${handle}'s avatar`}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              handle.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{handle}</p>
            {headline && <p className="truncate text-sm text-muted-foreground">{headline}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
