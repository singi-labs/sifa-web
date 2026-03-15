interface AvatarReelProps {
  avatars: string[];
  caption: string;
}

export function AvatarReel({ avatars, caption }: AvatarReelProps) {
  if (avatars.length === 0) return null;

  // Duplicate avatars to fill the marquee seamlessly
  const repeated =
    avatars.length < 12
      ? Array.from({ length: Math.ceil(24 / avatars.length) }, () => avatars).flat()
      : [...avatars, ...avatars];

  return (
    <div className="mt-10 w-full max-w-lg">
      <div className="relative overflow-hidden" aria-hidden="true">
        <div className="flex animate-marquee gap-3">
          {repeated.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full bg-muted object-cover"
              loading="lazy"
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">{caption}</p>
    </div>
  );
}
