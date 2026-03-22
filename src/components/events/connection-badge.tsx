import { ArrowsLeftRight, UserCheck, UserPlus } from '@phosphor-icons/react';
import type { ComponentType } from 'react';

import type { ConnectionType } from '@/hooks/use-attendee-connections';

interface ConnectionBadgeProps {
  type: ConnectionType | undefined;
  handle?: string;
}

interface ConnectionConfig {
  icon: ComponentType<{ size: number; weight: 'regular' }>;
  label: string;
  ariaLabel: (handle?: string) => string;
}

const connectionConfigs: Record<ConnectionType, ConnectionConfig> = {
  mutual: {
    icon: ArrowsLeftRight,
    label: 'Mutual',
    ariaLabel: (handle) => (handle ? `Mutual follow with ${handle}` : 'Mutual'),
  },
  following: {
    icon: UserCheck,
    label: 'Following',
    ariaLabel: (handle) => (handle ? `You follow ${handle}` : 'Following'),
  },
  followedBy: {
    icon: UserPlus,
    label: 'Follows you',
    ariaLabel: (handle) => (handle ? `Followed by ${handle}` : 'Follows you'),
  },
};

export function ConnectionBadge({ type, handle }: ConnectionBadgeProps): React.ReactNode {
  if (!type) {
    return null;
  }

  const config = connectionConfigs[type];
  const Icon = config.icon;

  return (
    <span
      role="img"
      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
      aria-label={config.ariaLabel(handle)}
    >
      <Icon size={14} weight="regular" />
      {config.label}
    </span>
  );
}
