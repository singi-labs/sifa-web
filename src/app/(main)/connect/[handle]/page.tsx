import Image from 'next/image';
import { fetchProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import { ConnectQR } from '@/components/connect-qr';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) return { title: 'Profile Not Found' };

  const name = profile.displayName ?? profile.handle;

  return {
    title: `Connect with ${name} on Sifa`,
    description: `Scan the QR code to connect with ${name} on Sifa ID.`,
    robots: { index: false, follow: false },
  };
}

export default async function ConnectPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await fetchProfile(handle);
  if (!profile) notFound();

  const label = profile.displayName ?? profile.handle;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-6">
        {/* Identity */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{label}</h1>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
          </div>
        </div>

        {/* QR Code */}
        <ConnectQR handle={profile.handle} avatar={profile.avatar} />
      </div>
    </div>
  );
}
